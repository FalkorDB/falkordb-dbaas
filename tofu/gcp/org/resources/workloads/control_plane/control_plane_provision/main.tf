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

# Add read/write permission to the state bucket
resource "google_storage_bucket_iam_member" "provisioning_sa" {
  bucket = var.state_bucket_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.provisioning_sa.email}"
}

# Add service usage consumer role to the service account
resource "google_project_iam_member" "provisioning_sa_service_usage" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageConsumer"
  member  = "serviceAccount:${google_service_account.provisioning_sa.email}"
}

# Add service account viewer role to the service account
resource "google_project_iam_member" "provisioning_sa_service_account_viewer" {
  project = var.project_id
  role    = "roles/iam.serviceAccountViewer"
  member  = "serviceAccount:${google_service_account.provisioning_sa.email}"
}

# Grant service account admin role permission to itself
resource "google_service_account_iam_member" "provisioning_sa" {
  service_account_id = google_service_account.provisioning_sa.name
  role               = "roles/iam.serviceAccountAdmin"

  member = "serviceAccount:${google_service_account.provisioning_sa.email}"

}
