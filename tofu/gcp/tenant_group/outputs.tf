output "vpc_name" {
  value = module.networking.network_name
}

output "ip_address_name" {
  value = module.networking.ip_address_name
}

output "ip_address" {
  value = module.networking.ip_address
}

output "cluster_name" {
  value = module.gke_cluster.cluster_name
}

output "backup_bucket_name" {
  value = module.backup.backup_bucket_name
}
output "dns_zone_name" {
  value = module.dns.dns_zone_name
}
output "dns_name" {
  value = module.dns.dns_name
}