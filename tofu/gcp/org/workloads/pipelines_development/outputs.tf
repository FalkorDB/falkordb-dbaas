output "state_bucket_name" {
  value     = google_storage_bucket.state_bucket.name
  sensitive = false
}

output "github_sa_email" {
  value = google_service_account.github_action_sa.email
}

output "worload_identity_provider" {
  value = module.gh_oidc.provider_name
}

output "tenant_provision_sa" {
  value = google_service_account.provisioning_sa.name
}