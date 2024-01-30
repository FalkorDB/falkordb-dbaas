# Service account for the Cloud Build pipeline that will provision tenant groups and tenants
resource "google_service_account" "provisioning_sa" {
  project      = var.project_id
  account_id   = "falkordb-provisioning-sa"
  display_name = "FalkorDB Provisioning SA"
}


# Add Cloud Build Builder role to the service account
resource "google_project_iam_member" "provisioning_sa" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.provisioning_sa.email}"
}
