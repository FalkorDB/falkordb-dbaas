output "pipelines_development_state_bucket_name" {
  value = length(module.pipelines_development) > 0 ? module.pipelines_development[0].state_bucket_name : null
}

output "pipelines_development_github_sa_email" {
  value = length(module.pipelines_development) > 0 ? module.pipelines_development[0].github_sa_email : null
}

output "pipelines_development_worload_identity_provider" {
  value = length(module.pipelines_development) > 0 ? module.pipelines_development[0].worload_identity_provider : null
}

output "pipelines_development_tenant_provision_sa" {
  value = length(module.pipelines_development) > 0 ? module.pipelines_development[0].tenant_provision_sa : null
}

output "velero_role_id" {
  value = local.velero_role_id
}

output "ctrl_plane_github_sa_email" {
  value = module.control_plane.github_sa_email
}

output "ctrl_plane_gh_workload_identity_provider" {
  value = module.control_plane.gh_workload_identity_provider
}

output "ctrl_plane_db_exporter_sa_email" {
  value = module.control_plane.db_exporter_sa_email
}
