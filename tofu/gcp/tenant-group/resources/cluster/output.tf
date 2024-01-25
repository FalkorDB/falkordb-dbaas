output "cluster_name" {
  value = module.gke.name
}

output "health_check_name" {
  value = google_compute_region_health_check.redis.name
}

output "cluster_endpoint" {
  value = module.gke.endpoint
}

output "cluster_ca_certificate" {
  value = module.gke.ca_certificate
}
