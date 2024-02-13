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

variable "node_pools" {
  type = list(map(any))

  default = [{
    name               = "simple-pool"
    machine_type       = "e2-medium"
    disk_size_gb       = 20
    initial_node_count = 3
  }]
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
    condition     = can(regex("^[0-9]+Gi$", var.persistence_size)) && parseint(regex("^[0-9]+", var.persistence_size), 10) >= 11
    error_message = "Size must be equal or higher than 11Gi"
  }
}

variable "redis_port" {
  type = number
  validation {
    condition     = var.redis_port >= 30000 && var.redis_port <= 32767
    error_message = "Port must be between 30000 and 32767"
  }
}
variable "sentinel_port" {
  type = number
  validation {
    condition     = var.sentinel_port >= 30000 && var.sentinel_port <= 32767
    error_message = "Port must be between 30000 and 32767"
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
