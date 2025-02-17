output "cluster_endpoint" {
  value     = module.gke.endpoint
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = module.gke.ca_certificate
  sensitive = true
}

output "cluster_name" {
  value = module.gke.name
}

output "metrics_bucket" {
  value = google_storage_bucket.metrics_bucket.name
}

output "argocd_ip" {
  value = module.argocd_ip.addresses[0]
}

output "grafana_ip" {
  value = module.grafana_ip.addresses[0]
}