module "bootstrap" {
  source  = "terraform-google-modules/bootstrap/google"
  version = "~> 7.0"

  org_id     = var.org_id
  folder_id  = var.parent_folder_id
  project_id = var.seed_project_id

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

  state_bucket_name = var.state_bucket_name_prefix
}
