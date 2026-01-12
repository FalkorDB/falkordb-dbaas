output "provisioning_sa_email" {
  value = module.tenant_provision.provisioning_sa_email
}

output "github_sa_email" {
  value = google_service_account.github_action_sa.email
}

output "gh_workload_identity_provider" {
  value = module.gh_oidc.provider_name
}

output "db_exporter_sa_email" {
  value = google_service_account.db_exporter_sa.email
}

output "db_exporter_sa_id" {
  value = google_service_account.db_exporter_sa.id
}

output "db_exporter_sa_number" {
  value = google_service_account.db_exporter_sa.unique_id
}

output "argocd_sa_id" {
  value = google_service_account.argocd_sa.id
}

output "argocd_sa_email" {
  value = google_service_account.argocd_sa.email
}

output "customer_ldap_api_sa_id" {
  value = google_service_account.customer_ldap_api_sa.id
}

output "customer_ldap_api_sa_email" {
  value = google_service_account.customer_ldap_api_sa.email
}