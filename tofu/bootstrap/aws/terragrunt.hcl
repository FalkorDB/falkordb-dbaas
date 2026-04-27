# Terragrunt shim for bootstrap/aws
# (was tofu/aws/1-bootstrap)
#
# This stack is applied once to bootstrap the AWS org.
# Apply manually; it is NOT part of the CI runtime pipeline.
#
# AWS stacks use an S3 backend (credentials passed via -backend-config at init time).
# They do NOT include the root Terragrunt config so no GCS backend is generated.
# Future: add include "root" + generate backend when centralizing state to GCS.
