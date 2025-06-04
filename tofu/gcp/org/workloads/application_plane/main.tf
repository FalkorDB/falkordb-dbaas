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
}

resource "google_storage_bucket_iam_member" "omnistrate_metering_data" {
  bucket = google_storage_bucket.omnistrate_metering_data.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:omnistrate-billing@omnistrate-prod.iam.gserviceaccount.com"
}
