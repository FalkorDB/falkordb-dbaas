resource "google_folder" "root_folder" {
  display_name = var.root_folder_name
  parent       = var.root_folder_parent_id
}


module "application_plane" {
  source = "./application_plane"

  org_id             = var.org_id
  project_id         = var.application_plane_project_id
  project_name       = var.application_plane_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

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

  public_network_name    = local.public_network_name
  public_network_subnets = local.public_network_subnets
}
