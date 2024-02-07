output "pipelines_development_state_bucket_name" {
  value = nonsensitive(module.pipelines_development[0].state_bucket_name)
}

output "pipelines_development_github_sa_email" {
  value = module.pipelines_development[0].github_sa_email
}

output "pipelines_development_worload_identity_provider" {
  value = module.pipelines_development[0].worload_identity_provider
}

output "pipelines_development_tenant_provision_sa" {
  value = module.pipelines_development[0].tenant_provision_sa
}
