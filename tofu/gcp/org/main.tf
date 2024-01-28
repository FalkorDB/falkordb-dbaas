module "shared_resources" {
  source = "./resources/shared"

  org_id             = var.org_id
  billing_account_id = var.billing_account_id

  shared_resources_folder_name = var.shared_resources_folder_name
  parent_folder_id             = var.root_folder_id


  monitoring_project_id   = var.monitoring_project_id
  monitoring_project_name = var.monitoring_project_name
  monitored_projects      = var.monitored_projects

  domains_to_allow = var.domains_to_allow
  enforce_policies = var.enforce_policies

}

module "workloads_resources" {
  source = "./resources/workloads"

  org_id             = var.org_id
  billing_account_id = var.billing_account_id

  workloads_folder_name = var.workloads_folder_name
  parent_folder_id      = var.root_folder_id


  application_plane_project_id   = var.application_plane_project_id
  application_plane_project_name = var.application_plane_project_name

  control_plane_project_id   = var.control_plane_project_id
  control_plane_project_name = var.control_plane_project_name

}
