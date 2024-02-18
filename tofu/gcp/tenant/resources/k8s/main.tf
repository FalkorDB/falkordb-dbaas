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

  replication_configuration = var.falkordb_replication_configuration
  node_pool_name            = var.node_pool_name

  falkordb_version    = var.falkordb_version
  falkordb_password   = local.falkordb_password
  falkordb_cpu        = var.falkordb_cpu
  falkordb_memory     = var.falkordb_memory
  falkordb_min_cpu    = var.falkordb_min_cpu
  falkordb_min_memory = var.falkordb_min_memory
  persistence_size    = var.persistence_size
  falkordb_replicas   = var.falkordb_replicas
  redis_port          = var.redis_port
  sentinel_port       = var.sentinel_port

  deployment_namespace = kubernetes_namespace.falkordb.metadata[0].name

  dns_ip_address = var.dns_ip_address
  dns_hostname   = local.dns_hostname

}

module "falkordb_backup" {
  source = "./falkordb-backup"

  project_id           = var.project_id
  tenant_name          = var.tenant_name
  deployment_namespace = kubernetes_namespace.falkordb.metadata[0].name
  deployment_name      = module.falkordb_deployment.pod_name_prefix
  backup_location      = "gs://${var.backup_bucket_name}/${kubernetes_namespace.falkordb.metadata[0].name}"
  backup_schedule      = var.backup_schedule
  falkordb_password    = local.falkordb_password
  port                 = var.redis_port
}


module "falkordb_policies" {
  source = "./policies"

  deployment_name      = module.falkordb_deployment.deployment_name
  deployment_namespace = kubernetes_namespace.falkordb.metadata[0].name
  allow_ports_pod = [
    var.redis_port,
    var.sentinel_port,
    module.falkordb_deployment.metrics_port
  ]
  cidr_blocks = var.cidr_blocks
}
