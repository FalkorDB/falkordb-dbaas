locals {
  labels = {
    "tenant_group" = var.tenant_group_name
  }
}
provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_compute_zones" "zones" {
  region = var.region
}

module "networking" {
  source = "./resources/networking"

  project_id        = var.project_id
  tenant_group_name = var.tenant_group_name

  region = var.region

  subnet_cidr = var.subnet_cidr

  ip_range_pods     = var.ip_range_pods
  ip_range_services = var.ip_range_services
}

module "gke_cluster" {
  source = "./resources/cluster"

  project_id        = var.project_id
  tenant_group_name = var.tenant_group_name

  region = var.region
  zones  = data.google_compute_zones.zones.names

  vpc_name        = module.networking.network_name
  subnetwork_name = module.networking.subnets[0].subnet_name

  ip_range_pods     = "pods"
  ip_range_services = "services"

  enable_private_nodes = var.enable_private_nodes
  node_pools           = var.node_pools

  cluster_deletion_protection = var.cluster_deletion_protection

  labels = local.labels

  depends_on = [module.networking]
}


module "dns" {
  source = "./resources/dns"

  project_id        = var.project_id
  tenant_group_name = var.tenant_group_name
  dns_domain        = var.dns_domain
  labels            = local.labels

}

module "deployment_backup" {
  source = "./resources/deployment-backup"

  project_id        = var.project_id
  region            = var.region
  tenant_group_name = var.tenant_group_name

  retention_policy_days = var.backup_retention_policy_days

  force_destroy_bucket = var.force_destroy_backup_bucket

  labels = local.labels
}

module "cluster_backup" {
  source = "./resources/cluster-backup"

  project_id        = var.project_id
  region            = var.region
  tenant_group_name = var.tenant_group_name

  retention_policy_days = var.cluster_backup_retention_policy_days

  force_destroy_bucket = var.force_destroy_backup_bucket

  labels = local.labels
}