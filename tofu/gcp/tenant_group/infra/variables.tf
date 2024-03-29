###### PROJECT ######
variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "me-west1"
}

variable "tenant_group_name" {
  type = string
}

variable "subnet_cidr" {
  type    = string
  default = "10.130.1.0/24"
}

variable "ip_range_pods" {
  type    = string
  default = "10.130.10.0/24"
}

variable "ip_range_services" {
  type    = string
  default = "10.130.20.0/24"
}

variable "cluster_deletion_protection" {
  type    = bool
  default = true
}

variable "enable_private_nodes" {
  type    = bool
  default = true
}

variable "node_pools" {
  type = list(map(any))

  default = [
    {
      name            = "default-pool"
      machine_type    = "e2-medium"
      disk_size_gb    = 30
      total_min_count = 3
      total_max_count = 50
      node_metadata   = "GKE_METADATA"
    },
    {
      name               = "backup-pool"
      machine_type       = "e2-medium"
      disk_size_gb       = 20
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      spot               = true
      node_metadata      = "GKE_METADATA"
    },

    {
      name               = "tier-m0"
      machine_type       = "e2-micro"
      disk_size_gb       = 10
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
      enable_gcfs        = true
      image_type         = "COS_CONTAINERD"
    },
    {
      name               = "tier-m1"
      machine_type       = "e2-custom-2-3072"
      disk_size_gb       = 10
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
    },
    {
      name               = "tier-m2"
      machine_type       = "e2-custom-4-6144"
      disk_size_gb       = 20
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
    },
    {
      name               = "tier-m4"
      machine_type       = "e2-custom-4-11264"
      disk_size_gb       = 24
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
    },
    {
      name               = "tier-m8"
      machine_type       = "e2-custom-8-19456"
      disk_size_gb       = 48
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
    },
    {
      name               = "tier-m16"
      machine_type       = "e2-custom-16-36864"
      disk_size_gb       = 96
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
    },
    {
      name               = "tier-m32"
      machine_type       = "e2-custom-32-71680"
      disk_size_gb       = 192
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      node_metadata      = "GCE_METADATA"
    },
  ]
}

variable "tenant_provision_sa" {
  type        = string
  description = "The GCP Service Account to be used by the Tenant Provisioner. Format: projects/<project_id>/serviceAccounts/<service_account_name>@<project_id>.iam.gserviceaccount.com"
  validation {
    condition     = can(regex("projects/[^/]+/serviceAccounts/[^@]+@[^.]+\\.iam\\.gserviceaccount\\.com", var.tenant_provision_sa))
    error_message = "The tenant_provision_sa variable must be in the format: projects/<project_id>/serviceAccounts/<service_account_name>@<project_id>.iam.gserviceaccount.com"
  }
}

variable "force_destroy_backup_bucket" {
  type    = bool
  default = false
}

variable "dns_domain" {
  type    = string
  default = "cloud.falkordb.com"
}

variable "backup_retention_policy_days" {
  type    = number
  default = 0
}

variable "cluster_backup_retention_policy_days" {
  type    = number
  default = 0
}

variable "cluster_backup_schedule" {
  type     = string
  nullable = true
  default  = null
}

variable "velero_role_id" {
  type = string
}
