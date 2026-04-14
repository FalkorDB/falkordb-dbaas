# Terragrunt shim for tofu/gcp/observability_stack/control_plane/k8s
#
# Replaces the stacks.json variable mapping for observability_stack_ctrl_plane_k8s.

include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

# The k8s stack depends on the infra stack (cluster must exist before k8s resources).
dependency "infra" {
  config_path = "../infra"
  # Skip in plan-only runs where the infra stack may not have been applied yet
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    cluster_endpoint       = "mock"
    cluster_ca_certificate = "mock"
    cluster_name           = "mock"
  }
}

inputs = {
  project_id               = get_env("TF_CTRL_PLANE_DEV_PROJECT_ID")
  region                   = get_env("TF_CTRL_PLANE_DEV_REGION")
  cluster_endpoint         = get_env("TF_CLUSTER_ENDPOINT", dependency.infra.outputs.cluster_endpoint)
  cluster_ca_certificate   = get_env("TF_CLUSTER_CA_CERTIFICATE", dependency.infra.outputs.cluster_ca_certificate)
  cluster_name             = get_env("TF_CLUSTER_NAME", dependency.infra.outputs.cluster_name)
  environment              = get_env("TF_ENVIRONMENT")
  argocd_admin_password    = get_env("TF_ARGOCD_ADMIN_PASSWORD")
  dex_google_client_id     = get_env("TF_DEX_GOOGLE_CLIENT_ID")
  dex_google_client_secret = get_env("TF_DEX_GOOGLE_CLIENT_SECRET")
  dex_google_admin_email   = get_env("TF_DEX_GOOGLE_ADMIN_EMAIL")
  argocd_groups_sa_json    = get_env("TF_ARGOCD_GROUPS_SA_JSON")
  grafana_google_client_id     = get_env("TF_GRAFANA_GOOGLE_CLIENT_ID")
  grafana_google_client_secret = get_env("TF_GRAFANA_GOOGLE_CLIENT_SECRET")
  db_exporter_sa_id        = get_env("TF_DB_EXPORTER_SA_ID", "")
  argocd_sa_id             = get_env("TF_ARGOCD_SA_ID", "")
}
