# Terragrunt shim for tofu/gcp/observability_stack/control_plane/infra
#
# Replaces the stacks.json variable mapping for observability_stack_ctrl_plane_infra.
# All TF_ environment variables are already exported by the CI workflow;
# inputs{} forwards them as OpenTofu variable values.

include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
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
