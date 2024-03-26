resource "google_organization_iam_custom_role" "cypago" {
  org_id      = var.org_id
  role_id     = "cypago"
  title       = "Cypago"
  description = "Cypago custom role"
  permissions = [
    "resourcemanager.projects.get",
    "bigquery.datasets.get",
    "cloudsql.backupRuns.list",
    "cloudsql.instances.list",
    "cloudsql.instances.get",
    "resourcemanager.organizations.getIamPolicy",
    "resourcemanager.projects.getIamPolicy",
    "storage.buckets.list",
    "compute.disks.list",
    "compute.regions.list",
    "compute.zones.list",
    "compute.firewalls.list",
    "secretmanager.secrets.list",
  ]
}

resource "random_id" "project_suffix" {
  byte_length = 4
}

module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.4.0"

  project_id      = "cypago-gws-collector-${random_id.project_suffix.hex}"
  name            = "cypago-gws-collector"
  org_id          = var.org_id
  billing_account = var.billing_account_id
  lien            = true

  create_project_sa = false

  activate_apis = [
    // Admin SDK
    "iam.googleapis.com",
    // resource manager
    "cloudresourcemanager.googleapis.com",
    // cloud sql
    "sqladmin.googleapis.com",
    // compute engine
    "compute.googleapis.com",
  ]
}

resource "google_service_account" "cypago" {
  account_id   = "cypago"
  display_name = "Cypago GCP Integration Service Account"
  project      = module.project.project_id
}

// Assign org role to service account
resource "google_organization_iam_member" "cypago" {
  org_id = var.org_id
  role   = "organizations/${var.org_id}/roles/${google_organization_iam_custom_role.cypago.role_id}"
  member = "serviceAccount:${google_service_account.cypago.email}"
}

resource "google_service_account" "cypago_gws_collector" {
  account_id   = "cypago-gws-collector"
  display_name = "Cypago GWS Collector Service Account"
  project      = module.project.project_id
}