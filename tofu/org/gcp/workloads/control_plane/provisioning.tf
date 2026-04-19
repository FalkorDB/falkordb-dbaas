# Tenant provisioning infrastructure: Cloud Build pipeline and Pub/Sub.
#
# The provisioning SA (falkordb-provisioning-sa) is used by Cloud Build to
# apply per-tenant OpenTofu stacks. Pub/Sub receives build status events
# and forwards them to the provisioner service via push subscription.

module "tenant_provision" {
  source = "./control_plane_provision"

  project_id        = var.project_id
  state_bucket_name = var.state_bucket_name

  cloud_build_push_endpoint = var.cloud_build_push_endpoint

  depends_on = [module.project]
}
