locals {
  tiers = {
    "tier-m0" = {
      persistence_size = "10Gi",
      replicas         = 0
      min_cpu          = "200m"
      max_cpu          = "250m"
      min_memory       = "200Mi"
      max_memory       = "1000Mi"
    },
    "tier-m1" = {
      persistence_size = "10Gi",
      replicas         = 2
      min_cpu          = "600m"
      max_cpu          = "1000m"
      min_memory       = "800Mi"
      max_memory       = "1Gi"
    },
    "tier-m2" = {
      persistence_size = "10Gi",
      replicas         = 2
      min_cpu          = "1200m"
      max_cpu          = "2000m"
      min_memory       = "1600Mi"
      max_memory       = "2Gi"
    },
    "tier-m4" = {
      persistence_size = "12Gi",
      replicas         = 2
      min_cpu          = "1200m"
      max_cpu          = "2000m"
      min_memory       = "3200Mi"
      max_memory       = "4Gi"
    },
    "tier-m8" = {
      persistence_size = "24Gi",
      replicas         = 2
      min_cpu          = "2400m"
      max_cpu          = "4000m"
      min_memory       = "7200Mi"
      max_memory       = "8Gi"
    },
    "tier-m16" = {
      persistence_size = "48Gi",
      replicas         = 2
      min_cpu          = "4800m"
      max_cpu          = "8000m"
      min_memory       = "15200Mi"
      max_memory       = "16Gi"
    },
    "tier-m32" = {
      persistence_size = "96Gi",
      replicas         = 2
      min_cpu          = "9600m"
      max_cpu          = "16000m"
      min_memory       = "31200Mi"
      max_memory       = "32Gi"
    },
  }
}

module "tenant_group" {
  source = "../tenant_group/infra"

  project_id                   = var.project_id
  region                       = var.region
  tenant_group_name            = var.tenant_group_name
  subnet_cidr                  = var.subnet_cidr
  ip_range_pods                = var.ip_range_pods
  ip_range_services            = var.ip_range_services
  cluster_deletion_protection  = false
  tenant_provision_sa          = var.tenant_provision_sa
  force_destroy_backup_bucket  = var.force_destroy_backup_bucket
  dns_domain                   = var.dns_domain
  backup_retention_policy_days = var.backup_retention_policy_days
}

module "tenant_group_k8s" {
  source = "../tenant_group/k8s"

  project_id              = var.project_id
  region                  = var.region
  cluster_name            = module.tenant_group.cluster_name
  cluster_endpoint        = module.tenant_group.cluster_endpoint
  cluster_ca_certificate  = module.tenant_group.cluster_ca_certificate
  cluster_backup_schedule = var.cluster_backup_schedule
  backup_bucket_name      = module.tenant_group.backup_bucket_name
  tenant_provision_sa     = var.tenant_provision_sa
  velero_gcp_sa_id        = module.tenant_group.velero_gcp_sa_id
  velero_gcp_sa_email     = module.tenant_group.velero_gcp_sa_email
}

module "standalone_tenant" {
  source = "../tenant"

  ip_address             = module.tenant_group.ip_address
  dns_domain             = var.dns_domain
  cluster_name           = module.tenant_group.cluster_name
  redis_port             = 30000
  redis_read_only_port   = 30001
  sentinel_port          = 30001
  node_pool_name         = var.tier_to_test
  falkordb_password      = var.falkordb_password
  falkordb_version       = var.falkordb_version
  falkordb_min_cpu       = local.tiers[var.tier_to_test].min_cpu
  falkordb_cpu           = local.tiers[var.tier_to_test].max_cpu
  falkordb_min_memory    = local.tiers[var.tier_to_test].min_memory
  falkordb_memory        = local.tiers[var.tier_to_test].max_memory
  persistence_size       = local.tiers[var.tier_to_test].persistence_size
  falkordb_replicas      = local.tiers[var.tier_to_test].replicas
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

  labeler_image = "falkordb/falkordb-pod-labeler:latest"

  depends_on = [ module.tenant_group_k8s ]
}

module "single_zone_tenant" {
  source = "../tenant"

  ip_address             = module.tenant_group.ip_address
  dns_domain             = var.dns_domain
  cluster_name           = module.tenant_group.cluster_name
  redis_port             = 30002
  redis_read_only_port   = 30003
  sentinel_port          = 30003
  node_pool_name         = var.tier_to_test
  falkordb_password      = var.falkordb_password
  falkordb_version       = var.falkordb_version
  falkordb_min_cpu       = local.tiers[var.tier_to_test].min_cpu
  falkordb_cpu           = local.tiers[var.tier_to_test].max_cpu
  falkordb_min_memory    = local.tiers[var.tier_to_test].min_memory
  falkordb_memory        = local.tiers[var.tier_to_test].max_memory
  persistence_size       = local.tiers[var.tier_to_test].persistence_size
  falkordb_replicas      = local.tiers[var.tier_to_test].replicas
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

  labeler_image = "falkordb/falkordb-pod-labeler:latest"

  depends_on = [ module.tenant_group_k8s ]
}

module "multi_zone_tenant" {
  source = "../tenant"

  ip_address             = module.tenant_group.ip_address
  dns_domain             = var.dns_domain
  cluster_name           = module.tenant_group.cluster_name
  redis_port             = 30004
  redis_read_only_port   = 30004
  sentinel_port          = 30005
  node_pool_name         = var.tier_to_test
  falkordb_password      = var.falkordb_password
  falkordb_version       = var.falkordb_version
  falkordb_min_cpu       = local.tiers[var.tier_to_test].min_cpu
  falkordb_cpu           = local.tiers[var.tier_to_test].max_cpu
  falkordb_min_memory    = local.tiers[var.tier_to_test].min_memory
  falkordb_memory        = local.tiers[var.tier_to_test].max_memory
  persistence_size       = local.tiers[var.tier_to_test].persistence_size
  falkordb_replicas      = local.tiers[var.tier_to_test].replicas
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
  labeler_image = "falkordb/falkordb-pod-labeler:latest"

  depends_on = [ module.tenant_group_k8s ]
}
