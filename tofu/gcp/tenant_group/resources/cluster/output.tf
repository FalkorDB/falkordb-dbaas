output "cluster_name" {
  value = module.gke.name
}

output "cluster_endpoint" {
  value = module.gke.endpoint
}

output "cluster_ca_certificate" {
  value = module.gke.ca_certificate
}
