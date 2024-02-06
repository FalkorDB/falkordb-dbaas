resource "random_password" "falkordb_password" {
  length  = 8
  special = false
}

locals {
  falkordb_password = var.falkordb_password != null ? var.falkordb_password : random_password.falkordb_password.result
  dns_hostname      = "${var.tenant_name}.${var.dns_domain}"
}

resource "kubernetes_namespace" "falkordb" {
  metadata {
    name = "${var.tenant_name}-falkordb"
  }
}


module "falkordb_deployment" {
  source = "./falkordb-deployment"

  falkordb_version  = var.falkordb_version
  falkordb_password = local.falkordb_password
  falkordb_cpu      = var.falkordb_cpu
  falkordb_memory   = var.falkordb_memory
  persistance_size  = var.persistance_size
  falkordb_replicas = var.falkordb_replicas
  redis_port        = var.redis_port
  sentinel_port     = var.sentinel_port

  deployment_namespace = kubernetes_namespace.falkordb.metadata[0].name

  dns_ip_address = var.dns_ip_address
  dns_hostname   = local.dns_hostname

  multi_zone = var.multi_zone
  pod_zone   = var.pod_zone

}

module "falkordb_backup" {
  source = "./falkordb-backup"

  project_id           = var.project_id
  tenant_name          = var.tenant_name
  deployment_namespace = kubernetes_namespace.falkordb.metadata[0].name
  backup_bucket_name   = var.backup_bucket_name
  backup_schedule      = var.backup_schedule
  falkordb_password    = local.falkordb_password
}
