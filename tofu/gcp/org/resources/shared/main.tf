resource "google_folder" "root_folder" {
  display_name = var.shared_resources_folder_name
  parent       = "folders/${var.parent_folder_id}"
}

module "monitoring" {
  source = "./monitoring"

  org_id             = var.org_id
  project_id         = var.monitoring_project_id
  project_name       = var.monitoring_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

  monitored_projects    = var.monitored_projects
  alert_email_addresses = var.alert_email_addresses

}

module "billing" {
  source = "./billing"

  org_id             = var.org_id
  project_id         = var.billing_project_id
  project_name       = var.billing_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

  budgets = []

}

module "policies" {
  source = "./policies"

  org_id           = var.org_id
  domains_to_allow = var.domains_to_allow
  enforce_policies = var.enforce_policies
}
