module "bootstrap" {
  source  = "terraform-google-modules/bootstrap/google"
  version = "~> 7.0"

  org_id         = var.org_id
  folder_id      = var.parent_folder_id
  project_id     = var.seed_project_id

  billing_account      = var.billing_account_id
  group_org_admins     = "gcp-organization-admins@falkordb.com"
  group_billing_admins = "gcp-billing-admins@falkordb.com"

  activate_apis = [
    "serviceusage.googleapis.com",
    "servicenetworking.googleapis.com",
    "compute.googleapis.com",
    "logging.googleapis.com",
    "bigquery.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudbilling.googleapis.com",
    "iam.googleapis.com",
    "admin.googleapis.com",
    "appengine.googleapis.com",
    "storage-api.googleapis.com",
    "monitoring.googleapis.com"
  ]

  create_terraform_sa = true
}

# State bucket
resource "google_storage_bucket" "state_bucket" {

  project = module.bootstrap.seed_project_id

  name     = var.state_bucket_name
  location = var.state_bucket_location

  force_destroy = var.state_bucket_force_destroy

  enable_object_retention = true

  retention_policy {
    retention_period = 604800
  }
}

# Allow terraform service account to write to state bucket
resource "google_storage_bucket_iam_member" "state_bucket_iam" {
  bucket = google_storage_bucket.state_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${module.bootstrap.terraform_sa_email}"
}
