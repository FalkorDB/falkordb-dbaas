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

data "aws_s3_bucket" "falkordb_backup_bucket" {
  bucket = var.falkordb_s3_backup_name
}

resource "aws_s3_bucket_lifecycle_configuration" "falkordb_backup_s3_bucket_lifecycle_configuration" {
  bucket = data.aws_s3_bucket.falkordb_backup_bucket.id

  rule {
    id = "falkordb-rule-${var.tenant_name}"

    filter {
      prefix = "${var.tenant_name}/"
    }

    expiration {
      days = var.backup_retention_period
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 3
    }

    status = "Enabled"
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
              command = ["/bin/sh", "-c", "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.28.3/2023-11-14/bin/linux/amd64/kubectl; chmod +x kubectl; ./kubectl exec falkordb-redis-node-0 --namespace falkordb -- redis-cli -a '${local.falkordb_password}' save; ./kubectl cp falkordb-redis-node-0:/data/dump.rdb dump.rdb -c redis --namespace falkordb; aws s3 cp dump.rdb s3://${data.aws_s3_bucket.falkordb_backup_bucket.id}/${var.tenant_name}/dump$(date +'%Y-%m-%d_%H-%M-%S').rdb"]
            }
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_namespace.backup_namespace
  ]
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

resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = ""
}

locals {
  falkordb_password = var.falkordb_password != null ? var.falkordb_password : random_password.password.result

  tags = {
    customer = var.tenant_name
  }
}

resource "random_string" "random_kms_alias" {
  length  = 4
  special = false
}

module "ebs_kms_key" {
  source  = "terraform-aws-modules/kms/aws"
  version = "~> 2.1.0"

  description = "Customer managed key to encrypt EKS managed node group volumes"

  # Policy
  key_administrators                = var.key_administrators
  key_service_roles_for_autoscaling = var.key_service_roles_for_autoscaling

  # Aliases
  computed_aliases = {
    alias = {
      name = "eks/${var.tenant_name}_${random_string.random_kms_alias.result}/ebs"
    }
  }
  aliases_use_name_prefix = true

  tags = local.tags
}

# Create a storage class for EBS volumes
# resource "kubernetes_storage_class" "falkordb" {
#   metadata {
#     name = "falkordb-storage-class"
#   }

#   storage_provisioner = "ebs.csi.aws.com"

#   reclaim_policy         = "Delete"
#   allow_volume_expansion = true

#   volume_binding_mode = "WaitForFirstConsumer"
#   parameters = {
#     type                        = "gp2"
#     encrypted                   = "true"
#     kmsKeyId                    = module.ebs_kms_key.key_id
#   }
# }

# https://github.com/bitnami/charts/tree/main/bitnami/redis
resource "helm_release" "falkordb" {
  name      = "falkordb"
  namespace = kubernetes_namespace.falkordb.metadata[0].name
  version   = "18.6.3"

  # Necessary so there's enough time to finish installing
  timeout = 600

  # Must be cluster name so we can destroy the load balancer
  description = var.falkordb_eks_cluster_name

  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"

  set {
    name  = "global.redis.password"
    value = local.falkordb_password
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
    value = "LoadBalancer"
  }
  set {
    name  = "sentinel.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
    value = "external"
  }
  set {
    name  = "sentinel.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-nlb-target-type"
    value = "ip"
  }
  set {
    name  = "sentinel.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
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

  # set {
  #   name  = "global.storageClass"
  #   value = "falkordb-storage-class"
  # }


  depends_on = [
    module.load_balancer_controller
  ]
}


resource "helm_release" "falkordb-monitoring" {
  name      = "falkordb-monitoring"
  namespace = kubernetes_namespace.falkordb_monitoring.metadata[0].name

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
    value = local.falkordb_password
  }
  set {
    name  = "grafana.additionalDataSources[0].editable"
    value = "true"
  }
}

# https://github.com/kubernetes-sigs/external-dns
# module "eks-external-dns" {
#   source                           = "lablabs/eks-external-dns/aws"
#   version                          = "1.2.0"
#   cluster_identity_oidc_issuer     = data.aws_iam_openid_connect_provider.cluster.url
#   cluster_identity_oidc_issuer_arn = data.aws_iam_openid_connect_provider.cluster.arn

#   settings = {
#     "policy"           = "upsert-only"
#     "aws.zoneType"     = "public"
#     "domainFilters[0]" = var.falkordb_domain
#     "txtOwnerId"       = var.falkordb_hosted_zone_id
#   }
# }

module "load_balancer_controller" {
  source = "git::https://github.com/DNXLabs/terraform-aws-eks-lb-controller.git"

  cluster_identity_oidc_issuer     = var.falkordb_eks_cluster_oidc_issuer_url
  cluster_identity_oidc_issuer_arn = var.falkordb_eks_cluster_oidc_issuer_arn
  cluster_name                     = var.falkordb_eks_cluster_name
  helm_chart_version               = "1.6.2"

}
