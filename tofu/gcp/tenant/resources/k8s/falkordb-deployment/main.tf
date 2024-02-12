locals {
  pod_name_prefix = "falkordb-redis"
  deployment_name = "falkordb"
  metrics_port    = 9121
}

module "standalone" {
  count  = var.replication_configuration.enable == false ? 1 : 0
  source = "./falkordb-deployment-standalone"

  deployment_name      = local.deployment_name
  falkordb_version     = var.falkordb_version
  falkordb_password    = var.falkordb_password
  falkordb_cpu         = var.falkordb_cpu
  falkordb_memory      = var.falkordb_memory
  persistance_size     = var.persistance_size
  redis_port           = var.redis_port
  deployment_namespace = var.deployment_namespace
  dns_ip_address       = var.dns_ip_address
  dns_hostname         = var.dns_hostname
  dns_ttl              = var.dns_ttl
  storage_class_name   = var.storage_class_name
}

module "single_zone" {
  count  = var.replication_configuration.enable == true && var.replication_configuration.multi_zone == false ? 1 : 0
  source = "./falkordb-deployment-single-zone"

  deployment_name      = local.deployment_name
  falkordb_version     = var.falkordb_version
  falkordb_password    = var.falkordb_password
  falkordb_cpu         = var.falkordb_cpu
  falkordb_memory      = var.falkordb_memory
  persistance_size     = var.persistance_size
  redis_port           = var.redis_port
  sentinel_port        = var.sentinel_port
  deployment_namespace = var.deployment_namespace
  dns_ip_address       = var.dns_ip_address
  dns_hostname         = var.dns_hostname
  dns_ttl              = var.dns_ttl
  storage_class_name   = var.storage_class_name
}


module "multi_zone" {
  count  = var.replication_configuration.enable == true && var.replication_configuration.multi_zone == true ? 1 : 0
  source = "./falkordb-deployment-multi-zone"

  deployment_name      = local.deployment_name
  falkordb_version     = var.falkordb_version
  falkordb_password    = var.falkordb_password
  falkordb_replicas    = var.falkordb_replicas
  falkordb_cpu         = var.falkordb_cpu
  falkordb_memory      = var.falkordb_memory
  persistance_size     = var.persistance_size
  redis_port           = var.redis_port
  sentinel_port        = var.sentinel_port
  deployment_namespace = var.deployment_namespace
  dns_ip_address       = var.dns_ip_address
  dns_hostname         = var.dns_hostname
  dns_ttl              = var.dns_ttl
  storage_class_name   = var.storage_class_name
}
