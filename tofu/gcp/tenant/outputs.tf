output "falkordb_host" {
  value = module.k8s.falkordb_host
}
output "falkordb_redis_port" {
  value = module.k8s.falkordb_redis_port
}
output "tenant_namespace" {
  value = module.k8s.tenant_namespace
}