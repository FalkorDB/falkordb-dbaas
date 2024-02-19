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
  falkordb_min_cpu                   = var.falkordb_min_cpu
  falkordb_min_memory                = var.falkordb_min_memory
  falkordb_replicas                  = var.falkordb_replicas
  persistence_size                   = var.persistence_size

  backup_bucket_name = var.backup_bucket_name
  backup_schedule    = var.backup_schedule

  redis_port           = var.redis_port
  redis_read_only_port = var.redis_read_only_port
  sentinel_port        = var.sentinel_port

  dns_domain     = var.dns_domain
  dns_ip_address = var.ip_address

  multi_zone = var.multi_zone
  pod_zone   = var.pod_zone

  labeler_image = var.labeler_image

  # Required for test suite to wait for the tenant group to be ready
  depends_on = [var.cluster_endpoint, var.cluster_ca_certificate]
}

module "backup" {
  source = "./resources/backup"

  project_id = var.project_id

  tenant_name           = var.tenant_name
  backup_bucket_name    = var.backup_bucket_name
  backup_writer_sa_name = module.k8s.backup_writer_sa_name

  depends_on = [module.k8s]
}
