
# resource "random_password" "grafana_admin_password" {
#   length  = 8
#   special = false
# }

# locals {
#   grafana_admin_password = var.grafana_admin_password != null ? var.grafana_admin_password : random_password.grafana_admin_password.result
# # }

# resource "kubernetes_namespace" "falkordb_monitoring" {
#   metadata {
#     name = "monitoring"
#   }
# }


# # https://docs.syseleven.de/metakube-accelerator/building-blocks/observability-monitoring/kube-prometheus-stack#adding-grafana-dashboards
# resource "kubernetes_config_map" "falkordb_grafana_dashboard" {
#   metadata {
#     name      = "falkordb-grafana-dashboard-redis"
#     namespace = kubernetes_namespace.falkordb_monitoring.metadata[0].name
#     labels = {
#       grafana_dashboard = "1"
#     }
#   }
#   data = {
#     "falkordb.json" = "${file("${path.module}/dashboards/falkordb.json")}"
#   }
# }


# resource "helm_release" "falkordb-monitoring" {
#   name      = "falkordb-monitoring"
#   namespace = kubernetes_namespace.falkordb_monitoring.metadata[0].name

#   chart      = "oci://registry-1.docker.io/bitnamicharts/kube-prometheus"
#   # set {
#   #   name  = "grafana.adminPassword"
#   #   value = local.grafana_admin_password
#   # }
#   # https://redisgrafana.github.io/redis-datasource/provisioning/
#   # set_list {
#   #   name  = "grafana.plugins"
#   #   value = ["redis-datasource"]
#   # }
#   # set {
#   #   name  = "grafana.additionalDataSources[0].name"
#   #   value = "FalkorDB"
#   # }
#   # set {
#   #   name  = "grafana.additionalDataSources[0].type"
#   #   value = "redis-datasource"
#   # }
#   # set {
#   #   name  = "grafana.additionalDataSources[0].url"
#   #   value = "falkordb-redis.${var.deployment_namespace}.svc.cluster.local:6379"
#   # }
#   # set {
#   #   name  = "grafana.additionalDataSources[0].secureJsonData.password"
#   #   value = var.falkordb_password
#   # }
#   # set {
#   #   name  = "grafana.additionalDataSources[0].editable"
#   #   value = "true"
#   # }
# }


# Google Managed Prometheus Monitoring

resource "kubernetes_manifest" "pod_monitoring" {
  manifest = {
    apiVersion = "monitoring.googleapis.com/v1"
    kind       = "ClusterPodMonitoring"
    metadata = {
      name      = "falkordb-redis"
      labels = {
        "app.kubernetes.io/name"    = "redis"
        "app.kubernetes.io/part-of" = "google-cloud-managed-prometheus"
      }
    }

    spec = {
      selector = {
        matchLabels = {
          "app.kubernetes.io/name" : "redis"
        }
      }
      endpoints = [{
        port     = "metrics"
        interval = "30s"
      }]
    }
  }
}
