# Root Terragrunt configuration
#
# All stacks under tofu/runtime/ inherit this config automatically via
# find_in_parent_folders("terragrunt.hcl"). Bootstrap and org stacks also
# include this root and get the same shared locals.
#
# State buckets (GCS):
#   dev  → falkordb-dev-state-4620
#   prod → falkordb-prod-state-c49b
#
# Each child stack generates its own backend_override.tf with the canonical
# GCS bucket (selected by TF_ENVIRONMENT) and an explicit gcs_prefix that
# preserves the historical state location so no migration is needed.
#
# AWS stacks (bootstrap/aws, org/aws-org, org/aws-app-plane) use S3 and do
# NOT include this root — they keep their own backend.tf intact. State will
# be centralized to GCS in a future migration.

locals {
  environment = get_env("TF_ENVIRONMENT", "dev")

  state_buckets = {
    dev  = "falkordb-dev-state-4620"
    development = "falkordb-dev-state-4620" # alias for backward compatibility
    prod = "falkordb-prod-state-c49b"
    production = "falkordb-prod-state-c49b" # alias for backward compatibility
  }

  # TF_STATE_BUCKET overrides the env-mapped bucket for backward compatibility
  # with any scripts that still set it explicitly.
  explicit_bucket = get_env("TF_STATE_BUCKET", "")
  tf_state_bucket = local.explicit_bucket != "" ? local.explicit_bucket : local.state_buckets[local.environment]
}
