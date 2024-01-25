
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

  subnet_cidr                  = var.subnet_cidr
  subnet_proxy_only_cidr_range = var.subnet_proxy_only_cidr_range

  tenant_group_size = var.tenant_group_size
}

module "gke_cluster" {
  source = "./resources/cluster"

  project_id        = var.project_id
  tenant_group_name = var.tenant_group_name

  region = var.region
  zones  = data.google_compute_zones.zones.names

  vpc_name        = module.networking.network_name
  subnetwork_name = module.networking.subnets[0].subnet_name

  ip_range_pods     = module.networking.subnets[0].subnet_ip
  ip_range_services = module.networking.subnets[0].subnet_ip

  node_pools = var.node_pools 
  
  node_pools_tags = ["allow-tenant-deployments"]
}

data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${module.gke_cluster.cluster_endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke_cluster.cluster_ca_certificate)
}


module "backup" {
  source = "./resources/backup"

  project_id           = var.project_id
  region               = var.region
  tenant_group_name    = var.tenant_group_name
  
  force_destroy_bucket = var.force_destroy_bucket
}
