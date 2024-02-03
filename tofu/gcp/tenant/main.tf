provider "google" {
  project = var.project_id
  region  = var.region
}

# Get cluster data
data "google_container_cluster" "cluster" {
  name     = var.cluster_name
  location = var.region
}

data "google_client_config" "provider" {}

provider "kubernetes" {
  host  = "https://${data.google_container_cluster.cluster.endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = base64decode(
    data.google_container_cluster.cluster.master_auth[0].cluster_ca_certificate,
  )

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "gcloud"
    args = [
      "container",
      "clusters",
      "get-credentials",
      var.cluster_name,
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
    host  = "https://${data.google_container_cluster.cluster.endpoint}"
    token = data.google_client_config.provider.access_token
    cluster_ca_certificate = base64decode(
      data.google_container_cluster.cluster.master_auth[0].cluster_ca_certificate,
    )

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gcloud"
      args = [
        "container",
        "clusters",
        "get-credentials",
        var.cluster_name,
        "--region",
        var.region,
        "--project",
        var.project_id,
      ]
    }
  }
}

locals {
  deployment_neg_name = "${var.tenant_name}-neg"
}

module "k8s" {
  source = "./resources/k8s"

  project_id  = var.project_id
  tenant_name = var.tenant_name

  falkordb_version  = var.falkordb_version
  falkordb_password = var.falkordb_password
  falkordb_cpu      = var.falkordb_cpu
  falkordb_memory   = var.falkordb_memory
  falkordb_replicas = var.falkordb_replicas
  persistance_size  = var.persistance_size

  backup_bucket_name = var.backup_bucket_name
  backup_schedule    = var.backup_schedule

  deployment_port     = var.deployment_port
  deployment_neg_name = local.deployment_neg_name
}

# Wait 10 seconds for the NEGs to be created
resource "time_sleep" "wait_30_seconds" {
  depends_on = [
    module.k8s.falkordb_deployment,
  ]

  create_duration = "30s"
}

module "networking" {
  source = "./resources/networking"

  project_id          = var.project_id
  region              = var.region
  tenant_name         = var.tenant_name
  vpc_name            = var.vpc_name
  deployment_neg_name = local.deployment_neg_name
  health_check_name   = var.health_check_name
  ip_address_name     = var.ip_address_name
  exposed_port        = var.exposed_port
  source_ip_ranges    = var.source_ip_ranges

  depends_on = [time_sleep.wait_30_seconds]
}


module "backup" {
  source = "./resources/backup"

  project_id = var.project_id

  tenant_name           = var.tenant_name
  backup_bucket_name    = var.backup_bucket_name
  backup_writer_sa_name = module.k8s.backup_writer_sa_name

  depends_on = [module.k8s]
}

module "dns" {
  source = "./resources/dns"

  tenant_name   = var.tenant_name
  dns_zone_name = var.dns_zone_name
  dns_domain    = var.dns_domain

  ip_address = var.ip_address

  depends_on = [module.networking]
}
