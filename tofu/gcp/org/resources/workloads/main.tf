resource "google_folder" "root_folder" {
  display_name = var.workloads_folder_name
  parent       = "folders/${var.parent_folder_id}"
}

locals {
  public_network_name = "falkordb-control-plane-public-network"

  public_network_subnets = []
}

module "control_plane" {
  source = "./control_plane"

  org_id             = var.org_id
  project_id         = var.control_plane_project_id
  project_name       = var.control_plane_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

  state_bucket_name = var.state_bucket_name

  public_network_name    = local.public_network_name
  public_network_subnets = local.public_network_subnets
}


module "application_plane" {
  source = "./application_plane"

  org_id             = var.org_id
  project_id         = var.application_plane_project_id
  project_name       = var.application_plane_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

  provisioning_sa = module.control_plane.provisioning_sa_email

}
