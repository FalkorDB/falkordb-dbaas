output "vpc_name" {
  value = module.networking.network_name
}

output "subnet_name" {
  value = module.networking.subnets[0].subnet_name
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

output "health_check_name" {
  value = module.gke_cluster.health_check_name
}