# Terragrunt shim for runtime/gcp/infra
# (was tofu/gcp/observability_stack/control_plane/infra)

include "root" {
  path   = find_in_parent_folders("terragrunt.hcl")
  expose = true
}

# Pin to the historical GCS prefix so no state migration is needed.
# The auto-computed path_relative_to_include() would resolve to
# "runtime/gcp/infra" (new path), but existing state lives at the old prefix.
generate "backend" {
  path      = "backend_override.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      backend "gcs" {
        bucket = "${include.root.locals.tf_state_bucket}"
        prefix = "observability_stack_control_plane_infra"
      }
    }
  EOF
}

inputs = {
  project_id                  = get_env("TF_CTRL_PLANE_DEV_PROJECT_ID")
  region                      = get_env("TF_CTRL_PLANE_DEV_REGION")
  zones                       = get_env("TF_CTRL_PLANE_DEV_ZONES")
  ip_range_subnet             = get_env("TF_CTRL_PLANE_IP_RANGE_SUBNET", "")
  ip_range_pods               = get_env("TF_CTRL_PLANE_IP_RANGE_PODS")
  ip_range_services           = get_env("TF_CTRL_PLANE_IP_RANGE_SERVICES")
  default_max_pods_per_node   = get_env("TF_DEFAULT_MAX_PODS_PER_NODE", "")
  db_exporter_sa_id           = get_env("TF_DB_EXPORTER_SA_ID", "")
  omnistrate_service_id       = get_env("TF_OMNISTRATE_SERVICE_ID", "")
  omnistrate_environment_id   = get_env("TF_OMNISTRATE_ENVIRONMENT_ID", "")
}
