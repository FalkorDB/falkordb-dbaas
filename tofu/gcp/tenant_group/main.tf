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


data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${module.gke_cluster.cluster_endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke_cluster.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "gcloud"
    args = [
      "container",
      "clusters",
      "get-credentials",
      module.gke_cluster.cluster_name,
      "--region",
      var.region,
      "--project",
      var.project_id,
    ]
  }
}

provider "helm" {
  debug = true

  kubernetes {
    host                   = "https://${module.gke_cluster.cluster_endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(module.gke_cluster.cluster_ca_certificate)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gcloud"
      args = [
        "container",
        "clusters",
        "get-credentials",
        module.gke_cluster.cluster_name,
        "--region",
        var.region,
        "--project",
        var.project_id,
      ]
    }
  }
}

module "k8s" {
  source = "./resources/k8s"

  project_id              = var.project_id
  tenant_provision_sa     = var.tenant_provision_sa
  dns_domain              = module.dns.dns_name
  cluster_name            = module.gke_cluster.cluster_name
  region                  = var.region
  backup_bucket_name      = module.cluster_backup.backup_bucket_name
  velero_gcp_sa_id        = module.cluster_backup.velero_sa_id
  velero_gcp_sa_email     = module.cluster_backup.velero_sa_email
  cluster_backup_schedule = var.cluster_backup_schedule

  kubecost_token                = var.kubecost_token
  kubecost_gcp_sa_id            = module.gke_cluster.kubecost_gcp_sa_id
  kubecost_gcp_sa_email         = module.gke_cluster.kubecost_gcp_sa_email
  bigquery_billing_data_project = var.bigquery_billing_data_project
  bigquery_billing_data_dataset = var.bigquery_billing_data_dataset
  bigquery_billing_data_table   = var.bigquery_billing_data_table

  depends_on = [module.gke_cluster]
}

