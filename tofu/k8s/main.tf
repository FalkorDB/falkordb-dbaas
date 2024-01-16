provider "kubernetes" {
  host                   = var.falkordb_eks_endpoint
  cluster_ca_certificate = base64decode(var.falkordb_cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", var.falkordb_eks_cluster_name]
  }
}

resource "kubernetes_namespace" "backup_namespace" {
  metadata {
    name = "falkordb-backup"
  }
}

resource "kubernetes_namespace" "falkordb" {
  metadata {
    name = "falkordb"
  }
}

resource "kubernetes_namespace" "falkordb_monitoring" {
  metadata {
    name = "falkordb-monitoring"
  }
}

resource "kubernetes_cluster_role" "falkordb_role" {
  metadata {
    name = "falkordb-role"
  }

  rule {
    api_groups = [""]
    resources  = ["pods"]
    verbs      = ["get", "watch", "list"]
  }
  rule {
    api_groups = [""]
    resources  = ["pods/exec"]
    verbs      = ["create"]
  }
}

resource "kubernetes_cluster_role_binding" "falkordb_role_binding" {
  metadata {
    name = "falkordb-role-binding"
  }
  role_ref {
    name      = "falkordb-role"
    kind      = "ClusterRole"
    api_group = "rbac.authorization.k8s.io"
  }
  subject {
    kind      = "ServiceAccount"
    name      = "default"
    namespace = "falkordb-backup"
  }
}

resource "kubernetes_cron_job_v1" "falkorbd_backup" {
  metadata {
    name      = "falkordb-backup"
    namespace = "falkordb-backup"
  }
  spec {
    concurrency_policy = "Replace"
    schedule           = var.backup_schedule
    job_template {
      metadata {}
      spec {
        backoff_limit              = 2
        ttl_seconds_after_finished = 60
        template {
          metadata {}
          spec {
            container {
              name  = "backup"
              image = "amazon/aws-cli"
              # https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html
              command = ["/bin/sh", "-c", "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.3/2023-11-14/bin/linux/amd64/kubectl; chmod +x kubectl; ./kubectl exec falkordb-redis-node-0 --namespace falkordb -- redis-cli -a '${random_password.password.result}' save; ./kubectl cp falkordb-redis-node-0:/data/dump.rdb dump.rdb -c redis --namespace falkordb; aws s3 cp dump.rdb s3://${var.falkordb_s3_backup_location}/dump$(date +'%Y-%m-%d_%H-%M-%S').rdb"]
            }
          }
        }
      }
    }
  }
}

# https://docs.syseleven.de/metakube-accelerator/building-blocks/observability-monitoring/kube-prometheus-stack#adding-grafana-dashboards
resource "kubernetes_config_map" "falkordb_grafana_dashboard" {
  metadata {
    name = "falkordb-grafana-dashboard-redis"
    labels = {
      grafana_dashboard = "1"
    }
  }
  data = {
    "falkordb.json" = "${file("${path.module}/dashboards/falkordb.json")}"
  }
}

provider "helm" {
  kubernetes {
    host                   = var.falkordb_eks_endpoint
    cluster_ca_certificate = base64decode(var.falkordb_cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", var.falkordb_eks_cluster_name]
    }
  }
}

resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = ""
}

# https://github.com/bitnami/charts/tree/main/bitnami/redis
resource "helm_release" "falkordb" {
  name      = "falkordb"
  namespace = "falkordb"
  version   = "18.6.3"

  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"

  set {
    name  = "global.redis.password"
    value = random_password.password.result
  }
  set {
    name  = "image.repository"
    value = "falkordb/falkordb"
  }
  set {
    name  = "image.tag"
    value = var.falkordb_version
  }
  set_list {
    name  = "master.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "master.resources.requests.cpu"
    value = var.falkordb_cpu
  }
  set {
    name  = "master.resources.requests.memory"
    value = var.falkordb_memory
  }
  set {
    name  = "master.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "sentinel.service.type"
    value = "NodePort"
  }
  set {
    name  = "sentinel.service.nodePorts.redis"
    value = 30100
  }
  set {
    name  = "sentinel.service.nodePorts.sentinel"
    value = 30200
  }
  set {
    name  = "replica.replicaCount"
    value = var.falkordb_replicas
  }
  set_list {
    name  = "replica.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "replica.resources.requests.cpu"
    value = var.falkordb_cpu
  }
  set {
    name  = "replica.resources.requests.memory"
    value = var.falkordb_memory
  }
  set {
    name  = "replica.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "sentinel.enabled"
    value = true
  }
  set {
    name  = "metrics.enabled"
    value = true
  }
  set {
    name  = "metrics.serviceMonitor.enabled"
    value = true
  }
  set {
    name  = "metrics.serviceMonitor.namespace"
    value = "falkordb"
  }
  set {
    name  = "metrics.serviceMonitor.additionalLabels.release"
    value = "falkordb-monitoring"
  }
  set_list {
    name  = "metrics.serviceMonitor.relabelings[0].sourceLabels"
    value = ["__meta_kubernetes_pod_name"]
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].action"
    value = "Replace"
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].targetLabel"
    value = "instance"
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].regex"
    value = "(.*redis.*)"
  }
  set {
    name  = "useExternalDNS.enabled"
    value = "true"
  }
  set {
    name  = "useExternalDNS.suffix"
    value = "falkordb.io"
  }
}

resource "helm_release" "falkordb-monitoring" {
  name      = "falkordb-monitoring"
  namespace = "falkordb-monitoring"

  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"

  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }
  set {
    name  = "grafana.additionalDataSources[0].name"
    value = "FalkorDB"
  }
  # https://redisgrafana.github.io/redis-datasource/provisioning/
  set_list {
    name  = "grafana.plugins"
    value = ["redis-datasource"]
  }
  set {
    name  = "grafana.additionalDataSources[0].type"
    value = "redis-datasource"
  }
  set {
    name  = "grafana.additionalDataSources[0].url"
    value = "falkordb-redis.falkordb.svc.cluster.local:6379"
  }
  set {
    name  = "grafana.additionalDataSources[0].secureJsonData.password"
    value = random_password.password.result
  }
  set {
    name  = "grafana.additionalDataSources[0].editable"
    value = "true"
  }
}

module "eks-external-dns" {
  source                           = "lablabs/eks-external-dns/aws"
  version                          = "1.2.0"
  cluster_identity_oidc_issuer     = var.falkordb_eks_oidc_issuer
  cluster_identity_oidc_issuer_arn = var.falkordb_eks_oidc_provider_arn

  settings = {
    "policy"           = "upsert-only"
    "aws.zoneType"     = "public"
    "domainFilters[0]" = var.falkordb_domain
    "txtOwnerId"       = var.falkordb_hosted_zone_id
  }
}