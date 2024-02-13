output "vpc_name" {
  value = module.tenant_group.vpc_name
}

output "ip_address_name" {
  value = module.tenant_group.ip_address_name
}

output "ip_address" {
  value = module.tenant_group.ip_address
}

output "cluster_name" {
  value = module.tenant_group.cluster_name
}

output "cluster_endpoint" {
  value     = module.tenant_group.cluster_endpoint
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = module.tenant_group.cluster_ca_certificate
  sensitive = true
}

output "backup_bucket_name" {
  value = module.tenant_group.backup_bucket_name
}
output "dns_zone_name" {
  value = module.tenant_group.dns_zone_name
}
output "dns_name" {
  value = module.tenant_group.dns_name
}

output "falkordb_standalone_tenant_host" {
  value = module.standalone_tenant.falkordb_host
}

output "falkordb_standalone_tenant_sentinel_port" {
  value = module.standalone_tenant.falkordb_sentinel_port
}

output "falkordb_standalone_tenant_redis_port" {
  value = module.standalone_tenant.falkordb_redis_port
}

output "falkordb_single_zone_tenant_host" {
  value = module.single_zone_tenant.falkordb_host
}

output "falkordb_single_zone_tenant_sentinel_port" {
  value = module.single_zone_tenant.falkordb_sentinel_port
}

output "falkordb_single_zone_tenant_redis_port" {
  value = module.single_zone_tenant.falkordb_redis_port
}

output "falkordb_multi_zone_tenant_host" {
  value = module.multi_zone_tenant.falkordb_host
}

output "falkordb_multi_zone_tenant_sentinel_port" {
  value = module.multi_zone_tenant.falkordb_sentinel_port
}

output "falkordb_multi_zone_tenant_redis_port" {
  value = module.multi_zone_tenant.falkordb_redis_port
}