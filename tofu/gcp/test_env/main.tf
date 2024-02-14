module "tenant_group" {
  source = "../tenant_group"

  project_id                   = var.project_id
  region                       = var.region
  tenant_group_name            = var.tenant_group_name
  subnet_cidr                  = var.subnet_cidr
  ip_range_pods                = var.ip_range_pods
  ip_range_services            = var.ip_range_services
  cluster_deletion_protection  = var.cluster_deletion_protection
  node_pools                   = var.node_pools
  tenant_provision_sa          = var.tenant_provision_sa
  force_destroy_backup_bucket  = var.force_destroy_backup_bucket
  dns_domain                   = var.dns_domain
  backup_retention_policy_days = var.backup_retention_policy_days
}

module "standalone_tenant" {
  source = "../tenant"

  ip_address             = module.tenant_group.ip_address
  dns_domain             = var.dns_domain
  cluster_name           = module.tenant_group.cluster_name
  redis_port             = 30000
  sentinel_port          = 30001
  falkordb_memory        = var.falkordb_memory
  cluster_endpoint       = module.tenant_group.cluster_endpoint
  falkordb_password      = var.falkordb_password
  project_id             = var.project_id
  falkordb_version       = var.falkordb_version
  backup_bucket_name     = module.tenant_group.backup_bucket_name
  falkordb_cpu           = var.falkordb_cpu
  persistence_size       = var.persistence_size
  tenant_name            = "${var.tenant_name}-s"
  vpc_name               = module.tenant_group.vpc_name
  falkordb_replicas      = 0
  cluster_ca_certificate = module.tenant_group.cluster_ca_certificate
  falkordb_replication_configuration = {
    enable     = false,
    multi_zone = false
  }
}

module "single_zone_tenant" {
  source = "../tenant"

  ip_address             = module.tenant_group.ip_address
  dns_domain             = var.dns_domain
  cluster_name           = module.tenant_group.cluster_name
  redis_port             = 30002
  sentinel_port          = 30003
  falkordb_memory        = var.falkordb_memory
  cluster_endpoint       = module.tenant_group.cluster_endpoint
  falkordb_password      = var.falkordb_password
  project_id             = var.project_id
  falkordb_version       = var.falkordb_version
  backup_bucket_name     = module.tenant_group.backup_bucket_name
  falkordb_cpu           = var.falkordb_cpu
  persistence_size       = var.persistence_size
  tenant_name            = "${var.tenant_name}-sz"
  vpc_name               = module.tenant_group.vpc_name
  falkordb_replicas      = 2
  cluster_ca_certificate = module.tenant_group.cluster_ca_certificate
  falkordb_replication_configuration = {
    enable     = true,
    multi_zone = false
  }
}

module "multi_zone_tenant" {
  source = "../tenant"

  ip_address             = module.tenant_group.ip_address
  dns_domain             = var.dns_domain
  cluster_name           = module.tenant_group.cluster_name
  redis_port             = 30004
  sentinel_port          = 30005
  falkordb_memory        = var.falkordb_memory
  cluster_endpoint       = module.tenant_group.cluster_endpoint
  falkordb_password      = var.falkordb_password
  project_id             = var.project_id
  falkordb_version       = var.falkordb_version
  backup_bucket_name     = module.tenant_group.backup_bucket_name
  falkordb_cpu           = var.falkordb_cpu
  persistence_size       = var.persistence_size
  tenant_name            = "${var.tenant_name}-mz"
  vpc_name               = module.tenant_group.vpc_name
  falkordb_replicas      = 2
  cluster_ca_certificate = module.tenant_group.cluster_ca_certificate
  falkordb_replication_configuration = {
    enable     = true,
    multi_zone = true
  }
}