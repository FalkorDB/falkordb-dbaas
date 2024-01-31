
output "deployment_monitoring_namespace" {
  value = kubernetes_namespace.falkordb_monitoring.metadata[0].name
}