# Terragrunt shim for org/workloads
# (was tofu/gcp/org/workloads)
#
# Manages GCP workloads folder structure: control plane, application plane,
# and optional pipelines-development projects.
# Apply manually; it is NOT part of the CI runtime pipeline.

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
        prefix = "org/workloads"
      }
    }
  EOF
}
