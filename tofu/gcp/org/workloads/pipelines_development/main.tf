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
    "serviceusage.googleapis.com",
    "servicenetworking.googleapis.com",
    "logging.googleapis.com",
    "container.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "cloudkms.googleapis.com",
    "dns.googleapis.com",
  ]

}

resource "random_id" "state_bucket_name" {
  byte_length = 8
  keepers = {
    project_id = var.project_id
  }
}

resource "google_storage_bucket" "state_bucket" {
  project                     = module.project.project_id
  name                        = "state-${module.project.project_id}-${random_id.state_bucket_name.hex}"
  storage_class               = "REGIONAL"
  location                    = "me-west1"
  force_destroy               = true
  uniform_bucket_level_access = true
}

# Service account for the Cloud Build pipeline that will provision tenant groups and tenants
resource "google_service_account" "provisioning_sa" {
  project      = module.project.project_id
  account_id   = "falkordb-provisioning-sa"
  display_name = "FalkorDB Provisioning SA"
}

# Give provisioning SA permissions to create resources in the project
resource "google_project_iam_member" "provisioning_sa" {
  project = module.project.project_id
  # TODO: Create a custom role with only the permissions needed
  role   = "roles/owner"
  member = "serviceAccount:${google_service_account.provisioning_sa.email}"
}

# Add service usage role to provisioning SA
resource "google_project_iam_member" "provisioning_sa_service_usage" {
  project = module.project.project_id
  role    = "roles/serviceusage.serviceUsageAdmin"
  member  = "serviceAccount:${google_service_account.provisioning_sa.email}"
}

# Create SA for github action pipeline
resource "google_service_account" "github_action_sa" {
  project      = module.project.project_id
  account_id   = "falkordb-github-action-sa"
  display_name = "FalkorDB Github Action SA"
}

# Add service account owne role to the service account
resource "google_project_iam_member" "github_action_sa" {
  project = module.project.project_id
  role    = "roles/owner"
  member  = "serviceAccount:${google_service_account.github_action_sa.email}"
}

module "gh_oidc" {
  source      = "terraform-google-modules/github-actions-runners/google//modules/gh-oidc"
  project_id  = module.project.project_id
  pool_id     = "github-actions-pool"
  provider_id = "github-actions"
  sa_mapping = {
    "falkordb-github-action-sa" = {
      sa_name   = google_service_account.github_action_sa.name
      attribute = "attribute.repository/${var.repo_name}"
    }
  }
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
