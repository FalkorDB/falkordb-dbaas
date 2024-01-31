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
  ]
}


# Give provisioning SA permissions to create resources in the project
resource "google_project_iam_member" "provisioning_sa" {
  project = var.project_id
  # TODO: Create a custom role with only the permissions needed
  role   = "roles/owner"
  member = "serviceAccount:${var.provisioning_sa}"

  depends_on = [ module.project ]
}

# Add service usage role to provisioning SA
resource "google_project_iam_member" "provisioning_sa_service_usage" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageAdmin"
  member  = "serviceAccount:${var.provisioning_sa}"

  depends_on = [ module.project ]
}