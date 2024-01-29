
# Create serice account for backup
resource "google_service_account" "backup_writer" {
  account_id   = var.backup_writer_sa_name
  display_name = var.backup_writer_sa_name
}

# Give write permissions to the SA
resource "google_storage_bucket_iam_member" "backup_writer" {
  bucket = var.backup_bucket_name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${google_service_account.backup_writer.email}"
  
  condition {
    title = "Pod role with Identity Workload enabled"
    description = "Allow SA to write to bucket if identity.namespace is the name of the folder"
    expression = "resource.name.startsWith(\"projects/_/buckets/${var.backup_bucket_name}/objects/${var.tenant_name}/\")"
  }
}

# Bind SA with workload identity
resource "google_service_account_iam_binding" "name" {
  service_account_id = google_service_account.backup_writer.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[${var.tenant_name}/${var.backup_writer_sa_name}]",
  ]
}