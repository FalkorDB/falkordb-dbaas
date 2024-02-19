# Create backup bucket
resource "google_storage_bucket" "cluster_backup_bucket" {
  name          = "${var.tenant_group_name}-cluster-backup"
  location      = var.region
  storage_class = "REGIONAL"
  force_destroy = var.force_destroy_bucket

  enable_object_retention     = true
  uniform_bucket_level_access = true

  dynamic "retention_policy" {
    for_each = var.retention_policy_days > 0 ? [1] : []
    content {
      retention_period = var.retention_policy_days * 24 * 60 * 60
    }
  }
  lifecycle_rule {
    action {
      type = "Delete"
    }

    condition {
      age = 7
    }
  }

  labels = var.labels
}


# Create velero SA
resource "google_service_account" "velero" {
  project    = var.project_id
  account_id = "${var.tenant_group_name}-velero"
}

resource "google_project_iam_custom_role" "velero_role" {
  role_id     = "velero"
  project     = var.project_id
  title       = "Velero"
  description = "Velero custom role"
  permissions = [
    "compute.disks.get",
    "compute.disks.create",
    "compute.disks.createSnapshot",
    "compute.projects.get",
    "compute.snapshots.get",
    "compute.snapshots.create",
    "compute.snapshots.useReadOnly",
    "compute.snapshots.delete",
    "compute.zones.get",
    "storage.objects.create",
    "storage.objects.delete",
    "storage.objects.get",
    "storage.objects.list",
    "iam.serviceAccounts.signBlob",
  ]
}

resource "google_project_iam_binding" "velero" {
  project = var.project_id
  role    = google_project_iam_custom_role.velero_role.id
  members = [
    "serviceAccount:${google_service_account.velero.email}",
  ]
}
