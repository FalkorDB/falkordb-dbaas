output "deployment_namespace" {
  value = kubernetes_namespace.falkordb.metadata[0].name
}