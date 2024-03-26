
resource "random_bytes" "project_suffix" {
  length = 4
}

module "shared_resources" {
  source = "./shared"

  org_id             = var.org_id
  billing_account_id = var.billing_account_id

  shared_resources_folder_name = var.shared_resources_folder_name
  parent_folder_id             = var.root_folder_id


  monitoring_project_id   = "${var.monitoring_project_id}-${random_bytes.project_suffix.hex}"
  monitoring_project_name = var.monitoring_project_name
  monitored_projects = var.monitored_projects
  alert_email_addresses = var.alert_email_addresses

  create_billing_project = var.create_billing_project
  billing_project_id     = "${var.billing_project_id}-${random_bytes.project_suffix.hex}"
  billing_project_name   = var.billing_project_name

  domains_to_allow = var.domains_to_allow
  enforce_policies = var.enforce_policies

}
