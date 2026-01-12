resource "random_id" "velero_role_suffix" {
  byte_length = 4
}

locals {
  velero_role_id = "velero_${random_id.velero_role_suffix.hex}"
}

resource "google_folder" "root_folder" {
  display_name = var.workloads_folder_name
  parent       = "folders/${var.parent_folder_id}"
}

module "control_plane" {
  source = "./control_plane"

  org_id             = var.org_id
  project_id         = var.control_plane_project_id
  project_name       = var.control_plane_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id
  repo_name          = var.pipelines_development_repo_name

  state_bucket_name = var.state_bucket_name

  public_network_name    = var.control_plane_public_network_name
  public_network_subnets = var.control_plane_public_network_subnets

  cloud_build_push_endpoint = var.control_plane_cloud_build_push_endpoint

  rdb_exports_bucket_name   = var.control_plane_rdb_exports_bucket_name
  rdb_exports_bucket_region = var.control_plane_rdb_exports_bucket_region
}


module "application_plane" {
  source = "./application_plane"

  org_id             = var.org_id
  project_id         = var.application_plane_project_id
  project_name       = var.application_plane_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

  provisioning_sa = module.control_plane.provisioning_sa_email

  velero_role_id = local.velero_role_id

  db_exporter_sa_email = module.control_plane.db_exporter_sa_email
  argocd_sa_email      = module.control_plane.argocd_sa_email
  customer_ldap_api_sa_email = module.control_plane.customer_ldap_api_sa_email

  metering_bucket_name = var.application_plane_metering_bucket_name
}

module "pipelines_development" {
  count = var.create_pipelines_development ? 1 : 0

  source = "./pipelines_development"

  org_id             = var.org_id
  project_id         = var.pipelines_development_project_id
  project_name       = var.pipelines_development_project_name
  project_parent_id  = google_folder.root_folder.id
  billing_account_id = var.billing_account_id

  repo_name = var.pipelines_development_repo_name

  velero_role_id = local.velero_role_id

}
