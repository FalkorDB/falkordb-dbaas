module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.4.0"

  org_id          = var.org_id
  project_id      = var.project_id
  name            = var.project_name
  folder_id       = var.project_parent_id
  billing_account = var.billing_account_id
  lien            = true

  create_project_sa = false

  activate_apis = [
    "container.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "cloudkms.googleapis.com",
    "dns.googleapis.com",
    "containersecurity.googleapis.com",
    "logging.googleapis.com",
  ]
}


# Give provisioning SA permissions to create resources in the project
resource "google_project_iam_member" "provisioning_sa" {
  project = var.project_id
  # TODO: Create a custom role with only the permissions needed
  role   = "roles/owner"
  member = "serviceAccount:${var.provisioning_sa}"

  depends_on = [module.project]
}

# Add service usage role to provisioning SA
resource "google_project_iam_member" "provisioning_sa_service_usage" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageAdmin"
  member  = "serviceAccount:${var.provisioning_sa}"

  depends_on = [module.project]
}

# Velero role for cluster backup
resource "google_project_iam_custom_role" "velero_role" {
  role_id     = var.velero_role_id
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

resource "google_project_iam_member" "db_exporter_sa_k8s_admin" {
  project = module.project.project_id
  role    = "roles/container.admin"
  member  = "serviceAccount:${var.db_exporter_sa_email}"
}

resource "google_storage_bucket" "omnistrate_metering_data" {
  name     = var.metering_bucket_name
  project  = module.project.project_id
  location = "US"

  uniform_bucket_level_access = true
  force_destroy               = false

  cors {
    max_age_seconds = 3600
    method = [
      "PUT",
    ]
    origin = [
      "https://app.falkordb.cloud",
    ]
    response_header = [
      "Content-Type",
    ]
  }
}

resource "google_storage_bucket" "customer_rdb_bucket" {
  name          = var.customer_rdb_bucket_name
  project       = module.project.project_id
  location      = "US"
  force_destroy = false

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 60 # 30 days in NEARLINE + 30 more = 60 days total from creation
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_iam_member" "customer_rdb_bucket" {
  bucket = google_storage_bucket.customer_rdb_bucket.name
  role   = "roles/storage.objectUser"
  member = "group:devops-oncall@falkordb.com"
}

resource "google_storage_bucket_iam_member" "omnistrate_metering_data" {
  bucket = google_storage_bucket.omnistrate_metering_data.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:omnistrate-billing@omnistrate-prod.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "argocd_sa_k8s_dev" {
  project = module.project.project_id
  role    = "roles/container.clusterAdmin"
  member  = "serviceAccount:${var.argocd_sa_email}"
}

# Dedicated SA for RDB bucket access (upload/download via rdb-uploader workflow)
resource "google_service_account" "rdb_bucket_sa" {
  account_id   = "rdb-bucket-sa"
  display_name = "RDB Bucket Service Account"
  description  = "Minimal SA for uploading and downloading customer RDB files. No project-level roles."
  project      = module.project.project_id
}

resource "google_storage_bucket_iam_member" "rdb_bucket_sa_object_user" {
  bucket = google_storage_bucket.customer_rdb_bucket.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.rdb_bucket_sa.email}"
}

# Allow GitHub Actions workload identity to impersonate rdb_bucket_sa
resource "google_service_account_iam_member" "rdb_bucket_sa_wi_user" {
  service_account_id = google_service_account.rdb_bucket_sa.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${var.gh_workload_identity_pool_name}/attribute.repository/${var.repo_name}"
}

# Allow rdb_bucket_sa to sign blobs (required for generating signed URLs via IAM API)
resource "google_service_account_iam_member" "rdb_bucket_sa_token_creator" {
  service_account_id = google_service_account.rdb_bucket_sa.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.rdb_bucket_sa.email}"
}

# Allow GitHub Actions WIF principal to generate access tokens for rdb_bucket_sa (required for impersonation)
resource "google_service_account_iam_member" "rdb_bucket_sa_wi_token_creator" {
  service_account_id = google_service_account.rdb_bucket_sa.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "principalSet://iam.googleapis.com/${var.gh_workload_identity_pool_name}/attribute.repository/${var.repo_name}"
}
