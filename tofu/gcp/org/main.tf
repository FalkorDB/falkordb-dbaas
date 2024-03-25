
resource "random_bytes" "project_suffix" {
  length = 4
}

module "workloads_resources" {
  source = "./resources/workloads"

  org_id             = var.org_id
  billing_account_id = var.billing_account_id

  workloads_folder_name = var.workloads_folder_name
  parent_folder_id      = var.root_folder_id


  application_plane_project_id   = "${var.application_plane_project_id}-${random_bytes.project_suffix.hex}"
  application_plane_project_name = var.application_plane_project_name

  control_plane_project_id                = "${var.control_plane_project_id}-${random_bytes.project_suffix.hex}"
  control_plane_project_name              = var.control_plane_project_name
  state_bucket_name                       = var.state_bucket_name
  control_plane_public_network_name       = var.control_plane_public_network_name
  control_plane_public_network_subnets    = var.control_plane_public_network_subnets
  control_plane_cloud_build_push_endpoint = var.control_plane_cloud_build_push_endpoint

  create_pipelines_development       = var.create_pipelines_development
  pipelines_development_project_id   = "${var.pipelines_development_project_id}-${random_bytes.project_suffix.hex}"
  pipelines_development_project_name = var.pipelines_development_project_name
  pipelines_development_repo_name    = var.pipelines_development_repo_name

}

module "shared_resources" {
  source = "./resources/shared"

  org_id             = var.org_id
  billing_account_id = var.billing_account_id

  shared_resources_folder_name = var.shared_resources_folder_name
  parent_folder_id             = var.root_folder_id


  monitoring_project_id   = "${var.monitoring_project_id}-${random_bytes.project_suffix.hex}"
  monitoring_project_name = var.monitoring_project_name
  monitored_projects = [
    for project in var.monitored_projects :
    project == var.control_plane_project_id ? "${project}-${random_bytes.project_suffix.hex}" :
    project == var.application_plane_project_id ? "${project}-${random_bytes.project_suffix.hex}" :
    project
  ]
  alert_email_addresses = var.alert_email_addresses

  create_billing_project = var.create_billing_project
  billing_project_id     = "${var.billing_project_id}-${random_bytes.project_suffix.hex}"
  billing_project_name   = var.billing_project_name

  domains_to_allow = var.domains_to_allow
  enforce_policies = var.enforce_policies

  depends_on = [module.workloads_resources]
}
