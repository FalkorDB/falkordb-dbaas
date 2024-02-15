provider "google" {
  project = var.project_id
  region  = var.region
}


data "google_client_config" "provider" {}

provider "kubernetes" {
  host  = "https://${var.cluster_endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = base64decode(
    var.cluster_ca_certificate
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
    host  = "https://${var.cluster_endpoint}"
    token = data.google_client_config.provider.access_token
    cluster_ca_certificate = base64decode(
      var.cluster_ca_certificate
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

  project_id     = var.project_id
  tenant_name    = var.tenant_name
  node_pool_name = var.node_pool_name

  falkordb_replication_configuration = var.falkordb_replication_configuration
  falkordb_version                   = var.falkordb_version
  falkordb_password                  = var.falkordb_password
  falkordb_cpu                       = var.falkordb_cpu
  falkordb_memory                    = var.falkordb_memory
  falkordb_replicas                  = var.falkordb_replicas
  persistence_size                   = var.persistence_size

  backup_bucket_name = var.backup_bucket_name
  backup_schedule    = var.backup_schedule

  redis_port    = var.redis_port
  sentinel_port = var.sentinel_port

  dns_domain     = var.dns_domain
  dns_ip_address = var.ip_address

  multi_zone = var.multi_zone
  pod_zone   = var.pod_zone

  # Required for test suite to wait for the tenant group to be ready
  depends_on = [var.cluster_endpoint, var.cluster_ca_certificate]
}

# Wait 10 seconds for the NEGs to be created
# resource "time_sleep" "wait_30_seconds" {
#   depends_on = [
#     module.k8s.falkordb_deployment,
#   ]

#   create_duration = "30s"
# }

# module "networking" {
#   source = "./resources/networking"

#   project_id          = var.project_id
#   region              = var.region
#   tenant_name         = var.tenant_name
#   vpc_name            = var.vpc_name
#   deployment_neg_name = local.deployment_neg_name
#   health_check_name   = var.health_check_name
#   ip_address_name     = var.ip_address_name
#   exposed_port        = var.exposed_port
#   source_ip_ranges    = var.source_ip_ranges

#   depends_on = [time_sleep.wait_30_seconds]
# }


module "backup" {
  source = "./resources/backup"

  project_id = var.project_id

  tenant_name           = var.tenant_name
  backup_bucket_name    = var.backup_bucket_name
  backup_writer_sa_name = module.k8s.backup_writer_sa_name

  depends_on = [module.k8s]
}

# Required only for proxy LB
# module "dns" {
#   source = "./resources/dns"

#   tenant_name   = var.tenant_name
#   dns_zone_name = var.dns_zone_name
#   dns_domain    = var.dns_domain

#   ip_address = var.ip_address

#   depends_on = [module.networking]
# }
