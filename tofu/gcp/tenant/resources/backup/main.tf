
locals {
  deployment_namespace = "${var.tenant_name}-falkordb"
}
# Create serice account for backup
resource "google_service_account" "backup_writer" {
  account_id   = var.backup_writer_sa_name
  display_name = var.backup_writer_sa_name
}

# Give list permission in backup bucket
resource "google_storage_bucket_iam_member" "backup_reader" {
  bucket = var.backup_bucket_name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.backup_writer.email}"

  condition {
    title       = "Pod role with Identity Workload enabled"
    description = "Allow SA to list bucket if identity.namespace is the name of the folder"
    expression  = "resource.name.startsWith(\"projects/_/buckets/${var.backup_bucket_name}/objects/${local.deployment_namespace}/\") || resource.name == \"projects/_/buckets/${var.backup_bucket_name}\""
  }
}

# Give write permissions to the SA
resource "google_storage_bucket_iam_member" "backup_writer" {
  bucket = var.backup_bucket_name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${google_service_account.backup_writer.email}"

  condition {
    title       = "Pod role with Identity Workload enabled"
    description = "Allow SA to write to bucket if identity.namespace is the name of the folder"
    expression  = "resource.name.startsWith(\"projects/_/buckets/${var.backup_bucket_name}/objects/${local.deployment_namespace}/\")"
  }
}

# Bind SA with workload identity
resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = google_service_account.backup_writer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${local.deployment_namespace}/${var.backup_writer_sa_name}]"
}
