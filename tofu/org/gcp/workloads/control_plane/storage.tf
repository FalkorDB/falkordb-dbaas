# Storage buckets and Secret Manager secrets for the control-plane project.
#
# rdb-exports bucket   — stores RDB snapshots exported from customer clusters.
#                        Versioned, lifecycle-delete after 7 days, CORS for
#                        the app.falkordb.cloud domain.
# MONGODB_URI secret   — holds the MongoDB connection string for backend pods.
#                        Rotated every 180 days (6 months); rotation topic is
#                        wired to the secrets-changes pubsub topic.

resource "google_storage_bucket" "rdb_exports" {
  name     = var.rdb_exports_bucket_name
  location = var.rdb_exports_bucket_region
  project  = var.project_id

  lifecycle {
    prevent_destroy = true
  }
  versioning {
    enabled = true
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 7
    }
  }

  uniform_bucket_level_access = true

  cors {
    max_age_seconds = 3600
    method          = ["PUT", "GET"]
    origin          = ["https://app.falkordb.cloud"]
    response_header = ["*"]
  }

  depends_on = [module.project]
}

resource "google_storage_bucket_iam_member" "db_exporter_sa" {
  bucket = google_storage_bucket.rdb_exports.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.db_exporter_sa.email}"
}

resource "google_secret_manager_secret" "mongodb_uri" {
  project = var.project_id
  replication {
    auto {
    }
  }

  rotation {
    rotation_period    = "15552000s"
    next_rotation_time = "2026-05-16T21:00:00Z"
  }

  topics {
    name = "projects/${var.project_id}/topics/secrets-changes"
  }

  secret_id = "MONGODB_URI"

  depends_on = [module.project]
}
