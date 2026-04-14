# Terragrunt shim for runtime/azure
# (was tofu/azure/landing_zone)

include "root" {
  path   = find_in_parent_folders("terragrunt.hcl")
  expose = true
}

# Pin to the historical GCS prefix so no state migration is needed.
generate "backend" {
  path      = "backend_override.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      backend "gcs" {
        bucket = "${include.root.locals.tf_state_bucket}"
        prefix = "azure_landing_zone"
      }
    }
  EOF
}

inputs = {
  subscription_id = get_env("TF_AZURE_SUBSCRIPTION_ID")
  tenant_id       = get_env("TF_AZURE_TENANT_ID")
  environment     = get_env("TF_ENVIRONMENT")
}
