output "cluster_name" {
  value = module.gke.name
}

output "cluster_endpoint" {
  value = module.gke.endpoint
}

output "cluster_ca_certificate" {
  value = module.gke.ca_certificate
}

output "kubecost_gcp_sa_id" {
  value = google_service_account.kubecost.id
}

output "kubecost_gcp_sa_email" {
  value = google_service_account.kubecost.email
}