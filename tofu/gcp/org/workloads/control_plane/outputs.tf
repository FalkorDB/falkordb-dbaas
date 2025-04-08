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
