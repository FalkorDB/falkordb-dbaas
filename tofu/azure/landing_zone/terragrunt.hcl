# Terragrunt shim for tofu/azure/landing_zone
#
# Replaces the stacks.json variable mapping for azure_landing_zone.
# Note: the existing backend.tf has a hardcoded prefix "azure_landing_zone".
# The root-generated backend_override.tf uses the relative path as prefix, which
# produces the same effective key: tofu/azure/landing_zone. This is intentional;
# if the bucket already has state at prefix "azure_landing_zone" (the old prefix),
# run `tofu state push` once to migrate, then remove the old backend.tf.

include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

inputs = {
  subscription_id = get_env("TF_AZURE_SUBSCRIPTION_ID")
  tenant_id       = get_env("TF_AZURE_TENANT_ID")
  environment     = get_env("TF_ENVIRONMENT")
}
