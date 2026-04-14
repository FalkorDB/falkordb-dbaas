# Terragrunt shim for bootstrap/gcp
# (was tofu/gcp/bootstrap)
#
# This stack is applied once to bootstrap the GCP seed project and state bucket.
# Apply manually; it is NOT part of the CI runtime pipeline.
#
# Note: the original backend.tf had backend "gcs" {} with no explicit prefix,
# meaning state was stored at the root of the bucket.  The canonical prefix is
# now set to "bootstrap/gcp".  If a prior state exists at "" (root), run:
#   tofu state pull > bootstrap.tfstate
#   tofu state push -lock=false bootstrap.tfstate  # after updating backend

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
        prefix = "bootstrap/gcp"
      }
    }
  EOF
}
