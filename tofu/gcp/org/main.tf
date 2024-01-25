
module "bootstrap_resources" {
  source = "./resources/bootstrap"
}

module "shared_resources" {
  source = "./resources/shared"
}

module "workloads_resources" {
  source = "./resources/workloads"

  org_id                = var.org_id
  
  root_folder_name      = var.root_folder_name
  root_folder_parent_id = var.root_folder_parent_id
  billing_account_id    = var.billing_account_id


  application_plane_project_id   = var.application_plane_project_id
  application_plane_project_name = var.application_plane_project_name

  control_plane_project_id   = var.control_plane_project_id
  control_plane_project_name = var.control_plane_project_name

}
