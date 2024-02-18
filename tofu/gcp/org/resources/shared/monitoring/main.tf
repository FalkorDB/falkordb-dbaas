module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.4.0"

  project_id      = var.project_id
  name            = var.project_name
  folder_id       = var.project_parent_id
  org_id          = var.org_id
  billing_account = var.billing_account_id
  lien            = true

  create_project_sa = false

  activate_apis = [
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
  ]
}

# TODO: Issue https://github.com/hashicorp/terraform-provider-google/issues/15625
# Workaround: Add projects manually to the metrics scope

# resource "google_monitoring_monitored_project" "projects_monitored" {
#   for_each      = var.monitored_projects
#   metrics_scope = "locations/global/metricsScopes/${module.project.project_number}"
#   name          = each.value
# }
