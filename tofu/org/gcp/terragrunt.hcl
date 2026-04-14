# Terragrunt shim for org/gcp
# (was tofu/gcp/org)
#
# Manages org-level GCP resources: shared projects, billing, policies, monitoring.
# Apply manually; it is NOT part of the CI runtime pipeline.
# Calls the ./shared module internally for shared resource creation.

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
        prefix = "org"
      }
    }
  EOF
}
