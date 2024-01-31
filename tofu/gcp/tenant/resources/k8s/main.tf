resource "random_password" "falkordb_password" {
  length  = 8
  special = false
}

locals {
  falkordb_password = var.falkordb_password != null ? var.falkordb_password : random_password.falkordb_password.result
}

resource "kubernetes_namespace" "falkordb" {
  metadata {
    name = "${var.tenant_name}-falkordb"
  }
}


module "falkordb_monitoring" {
  source = "./falkordb-monitoring"

  tenant_name            = var.tenant_name
  deployment_namespace   = kubernetes_namespace.falkordb.metadata[0].name
  falkordb_password      = local.falkordb_password
  grafana_admin_password = var.grafana_admin_password
}


module "falkordb_deployment" {
  source = "./falkordb-deployment"

  tenant_name         = var.tenant_name
  falkordb_version    = var.falkordb_version
  falkordb_password   = local.falkordb_password
  falkordb_cpu        = var.falkordb_cpu
  falkordb_memory     = var.falkordb_memory
  persistance_size    = var.persistance_size
  falkordb_replicas   = var.falkordb_replicas
  deployment_port     = var.deployment_port
  deployment_neg_name = var.deployment_neg_name

  deployment_namespace            = kubernetes_namespace.falkordb.metadata[0].name
  deployment_monitoring_namespace = module.falkordb_monitoring.deployment_monitoring_namespace

  depends_on = [module.falkordb_monitoring]
}

module "falkordb_backup" {
  source = "./falkordb-backup"

  project_id           = var.project_id
  tenant_name          = var.tenant_name
  deployment_namespace = module.falkordb_deployment.deployment_namespace
  backup_bucket_name   = var.backup_bucket_name
  backup_schedule      = var.backup_schedule
  falkordb_password    = module.falkordb_deployment.falkordb_password
}
