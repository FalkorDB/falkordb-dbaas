# Create backup bucket
resource "google_storage_bucket" "backup_bucket" {
  name          = "${var.tenant_group_name}-backup-bucket"
  location      = var.region
  storage_class = "REGIONAL"
  force_destroy = var.force_destroy_bucket

  enable_object_retention = true

  retention_policy {
    retention_period = 302400
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }

    condition {
      age = 7
    }
  }
}