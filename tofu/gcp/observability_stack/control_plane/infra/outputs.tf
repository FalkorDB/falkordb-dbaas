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

output "argocd_ip" {
  value = module.argocd_ip.addresses[0]
}

output "grafana_ip" {
  value = module.grafana_ip.addresses[0]
}

output "vmauth_ip" {
  value = module.vmauth_ip.addresses[0]
}

output "argocd_dwd" {
  value = google_service_account.argocd_dwd.email
}

output "argocd_dwd_sa_key" {
  value     = google_service_account_key.argocd_dwd_key.private_key
  sensitive = true
}
