# Service account for the Cloud Build pipeline that will provision tenant groups and tenants
resource "google_service_account" "provisioning_sa" {
  project      = var.project_id
  account_id   = "falkordb-provisioning-sa"
  display_name = "FalkorDB Provisioning SA"
}
