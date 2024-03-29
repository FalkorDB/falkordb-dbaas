locals {
  pod_name_prefix = "falkordb-redis"
  deployment_name = "falkordb"
  metrics_port    = 9121
}

module "standalone" {
  count  = var.replication_configuration.enable == false ? 1 : 0
  source = "./falkordb-deployment-standalone"

  node_pool_name       = var.node_pool_name
  deployment_name      = local.deployment_name
  falkordb_version     = var.falkordb_version
  falkordb_password    = var.falkordb_password
  falkordb_cpu         = var.falkordb_cpu
  falkordb_memory      = var.falkordb_memory
  falkordb_min_cpu     = var.falkordb_min_cpu
  falkordb_min_memory  = var.falkordb_min_memory
  persistence_size     = var.persistence_size
  redis_port           = var.redis_port
  deployment_namespace = var.deployment_namespace
  dns_ip_address       = var.dns_ip_address
  storage_class_name   = var.storage_class_name
}

module "single_zone" {
  count  = var.replication_configuration.enable == true && var.replication_configuration.multi_zone == false ? 1 : 0
  source = "./falkordb-deployment-single-zone"

  node_pool_name       = var.node_pool_name
  deployment_name      = local.deployment_name
  falkordb_version     = var.falkordb_version
  falkordb_password    = var.falkordb_password
  falkordb_cpu         = var.falkordb_cpu
  falkordb_memory      = var.falkordb_memory
  falkordb_min_cpu     = var.falkordb_min_cpu
  falkordb_min_memory  = var.falkordb_min_memory
  persistence_size     = var.persistence_size
  redis_port           = var.redis_port
  redis_read_only_port = var.redis_read_only_port
  sentinel_port        = var.sentinel_port
  deployment_namespace = var.deployment_namespace
  dns_ip_address       = var.dns_ip_address
  storage_class_name   = var.storage_class_name
}


module "multi_zone" {
  count  = var.replication_configuration.enable == true && var.replication_configuration.multi_zone == true ? 1 : 0
  source = "./falkordb-deployment-multi-zone"

  node_pool_name       = var.node_pool_name
  deployment_name      = local.deployment_name
  falkordb_version     = var.falkordb_version
  falkordb_password    = var.falkordb_password
  falkordb_replicas    = var.falkordb_replicas
  falkordb_cpu         = var.falkordb_cpu
  falkordb_memory      = var.falkordb_memory
  falkordb_min_cpu     = var.falkordb_min_cpu
  falkordb_min_memory  = var.falkordb_min_memory
  persistence_size     = var.persistence_size
  redis_port           = var.redis_port
  redis_read_only_port = var.redis_read_only_port
  sentinel_port        = var.sentinel_port
  deployment_namespace = var.deployment_namespace
  dns_ip_address       = var.dns_ip_address
  storage_class_name   = var.storage_class_name
}


module "labeler" {
  count  = var.replication_configuration.enable == true ? 1 : 0
  source = "./labeler"

  deployment_namespace = var.deployment_namespace
  deployment_name      = local.deployment_name
  sentinel_port        = var.sentinel_port
  labeler_image        = var.labeler_image

  depends_on = [module.standalone, module.single_zone, module.multi_zone]
}
