module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.4.0"

  org_id          = var.org_id
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
  ]
}
