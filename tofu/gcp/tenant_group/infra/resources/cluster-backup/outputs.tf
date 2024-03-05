output "backup_bucket_name" {
  value = google_storage_bucket.cluster_backup_bucket.name
}

output "velero_sa_id" {
  value = google_service_account.velero.id
}

output "velero_sa_email" {
  value = google_service_account.velero.email
}
