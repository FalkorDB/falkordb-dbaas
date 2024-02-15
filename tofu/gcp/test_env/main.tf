locals {
  tiers = {
    "tier-m0" = {
      persistence_size = "10Gi",
      replicas         = 0
    },
    "tier-m1" = {
      persistence_size = "10Gi",
      replicas         = 2
    },
    "tier-m2" = {
      persistence_size = "10Gi",
      replicas         = 2
    },
    "tier-m4" = {
      persistence_size = "12Gi",
      replicas         = 2
    },
    "tier-m8" = {
      persistence_size = "24Gi",
      replicas         = 2
    },
    "tier-m16" = {
      persistence_size = "48Gi",
      replicas         = 2
    },
    "tier-m32" = {
      persistence_size = "96Gi",
      replicas         = 2
    },
  }
}

module "tenant_group" {
  source = "../tenant_group"

  project_id                   = var.project_id
  region                       = var.region
  tenant_group_name            = var.tenant_group_name
  subnet_cidr                  = var.subnet_cidr
  ip_range_pods                = var.ip_range_pods
  ip_range_services            = var.ip_range_services
  cluster_deletion_protection  = false
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
  node_pool_name         = "tier-m1"
  falkordb_password      = var.falkordb_password
  falkordb_version       = var.falkordb_version
  falkordb_memory        = var.falkordb_memory
  falkordb_cpu           = var.falkordb_cpu
  persistence_size       = local.tiers["tier-m1"].persistence_size
  falkordb_replicas      = local.tiers["tier-m1"].replicas
  cluster_endpoint       = module.tenant_group.cluster_endpoint
  project_id             = var.project_id
  backup_bucket_name     = module.tenant_group.backup_bucket_name
  tenant_name            = "${var.tenant_name}-s"
  vpc_name               = module.tenant_group.vpc_name
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
  node_pool_name         = "tier-m1"
  falkordb_password      = var.falkordb_password
  falkordb_version       = var.falkordb_version
  falkordb_memory        = var.falkordb_memory
  falkordb_cpu           = var.falkordb_cpu
  persistence_size       = local.tiers["tier-m1"].persistence_size
  falkordb_replicas      = local.tiers["tier-m1"].replicas
  cluster_endpoint       = module.tenant_group.cluster_endpoint
  project_id             = var.project_id
  backup_bucket_name     = module.tenant_group.backup_bucket_name
  tenant_name            = "${var.tenant_name}-sz"
  vpc_name               = module.tenant_group.vpc_name
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
  node_pool_name         = "tier-m1"
  falkordb_password      = var.falkordb_password
  falkordb_version       = var.falkordb_version
  falkordb_memory        = var.falkordb_memory
  falkordb_cpu           = var.falkordb_cpu
  persistence_size       = local.tiers["tier-m1"].persistence_size
  falkordb_replicas      = local.tiers["tier-m1"].replicas
  cluster_endpoint       = module.tenant_group.cluster_endpoint
  project_id             = var.project_id
  backup_bucket_name     = module.tenant_group.backup_bucket_name
  tenant_name            = "${var.tenant_name}-mz"
  vpc_name               = module.tenant_group.vpc_name
  cluster_ca_certificate = module.tenant_group.cluster_ca_certificate
  falkordb_replication_configuration = {
    enable     = true,
    multi_zone = true
  }
}
