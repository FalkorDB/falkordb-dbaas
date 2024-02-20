output "backup_writer_sa_name" {
  value = module.falkordb_backup.backup_writer_sa_name
}

output "falkordb_deployment" {
  value = module.falkordb_deployment
}

output "falkordb_host" {
  value = local.dns_hostname
}

output "falkordb_redis_port" {
  value = var.redis_port
}

output "tenant_namespace" {
  value = kubernetes_namespace.falkordb.metadata[0].name
}
