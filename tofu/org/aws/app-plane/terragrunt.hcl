# Terragrunt shim for org/aws/app-plane
# (was tofu/aws/3-application_plane)
#
# Manages AWS application-plane resources (EKS clusters, VPCs, IAM).
# Apply manually; it is NOT part of the CI runtime pipeline.
#
# AWS stacks use an S3 backend (credentials and config passed via -backend-config
# at init time).  They do NOT include the root Terragrunt config so no GCS backend
# is generated.  Future: add include "root" + generate backend when centralizing
# state to GCS.
