# Root Terragrunt configuration
#
# Every stack that includes this root via `find_in_parent_folders()` gets:
#   - A generated backend.tf using the TF_STATE_BUCKET environment variable
#   - The GCS backend prefix is derived from the relative path, so each stack
#     gets an isolated state prefix (e.g. tofu/gcp/observability_stack/control_plane/infra)
#
# The per-stack terragrunt.hcl provides inputs{} that map CI environment
# variables to OpenTofu variable values, replacing the stacks.json variables
# mapping that was previously resolved at workflow run-time.

locals {
  tf_state_bucket = get_env("TF_STATE_BUCKET", "")
  # Use the path relative to this root file as the GCS prefix
  gcs_prefix = path_relative_to_include()
}

# Generate backend.tf at plan/apply time so stacks do not need to check in a
# backend.tf themselves (the empty `terraform { backend "gcs" {} }` files can
# be safely deleted from each stack once Terragrunt is fully adopted).
generate "backend" {
  path      = "backend_override.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<-EOF
    terraform {
      backend "gcs" {
        bucket = "${local.tf_state_bucket}"
        prefix = "${local.gcs_prefix}"
      }
    }
  EOF
}
