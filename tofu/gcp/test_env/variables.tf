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
variable "node_pools" {
  type = list(map(any))

  default = [
    {
      name            = "default-pool"
      machine_type    = "e2-medium"
      disk_size_gb    = 10
      total_min_count = 0
      total_max_count = 50
    },
    {
      name               = "backup-pool"
      machine_type       = "e2-medium"
      disk_size_gb       = 10
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
      spot               = true
    },

    {
      name               = "tier-m0"
      machine_type       = "e2-micro"
      disk_size_gb       = 10
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
    },
    {
      name               = "tier-m1"
      machine_type       = "e2-custom-1-1024"
      disk_size_gb       = 10
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
    },
    {
      name               = "tier-m2"
      machine_type       = "e2-custom-2-2048"
      disk_size_gb       = 10
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
    },
    {
      name               = "tier-m4"
      machine_type       = "e2-custom-2-4096"
      disk_size_gb       = 12
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
    },
    {
      name               = "tier-m8"
      machine_type       = "e2-custom-4-8192"
      disk_size_gb       = 24
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
    },
    {
      name               = "tier-m16"
      machine_type       = "e2-custom-8-16384"
      disk_size_gb       = 48
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
    },
    {
      name               = "tier-m32"
      machine_type       = "e2-custom-16-32768"
      disk_size_gb       = 96
      total_min_count    = 0
      total_max_count    = 50
      initial_node_count = 0
  }, ]
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

###### PROJECT ######
variable "tenant_name" {
  type = string
}

variable "falkordb_version" {
  type = string
}

variable "falkordb_password" {
  type      = string
  sensitive = true
  nullable  = true
}

variable "falkordb_cpu" {
  type = string
}

variable "falkordb_memory" {
  type = string
}

variable "persistence_size" {
  type = string

  validation {
    condition     = can(regex("^[0-9]+Gi$", var.persistence_size)) && parseint(regex("^[0-9]+", var.persistence_size), 10) >= 10
    error_message = "Size must be equal or higher than 10Gi"
  }
}
variable "backup_schedule" {
  type    = string
  default = "0 0 * * *"
}
variable "source_ip_ranges" {
  type    = list(string)
  default = []
}
