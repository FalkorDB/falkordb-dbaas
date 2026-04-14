# Terragrunt shim for org/cypago
# (was tofu/gcp/org/cypago)
#
# Manages Cypago-related GCP resources.
# Apply manually; it is NOT part of the CI runtime pipeline.
#
# Note: the original backend.tf had backend "gcs" {} with no explicit prefix.
# The canonical prefix is now set to "org/cypago".  If prior state exists at
# "" (root level), locate it and run state push with the new prefix configured.

include "root" {
  path   = find_in_parent_folders("terragrunt.hcl")
  expose = true
}

generate "backend" {
  path      = "backend_override.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      backend "gcs" {
        bucket = "${include.root.locals.tf_state_bucket}"
        prefix = "org/cypago"
      }
    }
  EOF
}
