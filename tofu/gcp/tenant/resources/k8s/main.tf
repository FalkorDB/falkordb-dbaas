# Tenant namespac
module "falkordb_deployment" {
  source = "./falkordb-deployment"

  tenant_name         = var.tenant_name
  falkordb_version    = var.falkordb_version
  falkordb_password   = var.falkordb_password
  falkordb_cpu        = var.falkordb_cpu
  falkordb_memory     = var.falkordb_memory
  persistance_size    = var.persistance_size
  falkordb_replicas   = var.falkordb_replicas
  deployment_port     = var.deployment_port
  deployment_neg_name = var.deployment_neg_name
}

module "falkordb_monitoring" {
  source = "./falkordb-monitoring"

  tenant_name            = var.tenant_name
  deployment_namespace   = module.falkordb_deployment.deployment_namespace
  falkordb_password      = module.falkordb_deployment.falkordb_password
  grafana_admin_password = var.grafana_admin_password
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
