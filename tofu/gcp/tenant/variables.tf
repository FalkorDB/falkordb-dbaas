###### PROJECT ######
variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "me-west1"
}

variable "vpc_name" {
  type = string
}
variable "cluster_endpoint" {
  type = string
}
variable "cluster_ca_certificate" {
  type = string
}
variable "cluster_name" {
  type = string
}

variable "ip_address" {
  type = string
}
variable "tenant_name" {
  type = string
}
variable "node_pool_name" {
  type     = string
  nullable = true
}
variable "backup_bucket_name" {
  type = string
}

variable "falkordb_replication_configuration" {
  type = object({
    enable     = bool
    multi_zone = bool
  })

  default = {
    enable     = false
    multi_zone = false
  }
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
variable "falkordb_min_cpu" {
  type = string
}
variable "falkordb_min_memory" {
  type = string
}
variable "persistence_size" {
  type = string

  validation {
    condition     = can(regex("^[0-9]+Gi$", var.persistence_size)) && parseint(regex("^[0-9]+", var.persistence_size), 10) >= 10
    error_message = "Size must be equal or higher than 10Gi"
  }
}

variable "falkordb_replicas" {
  type = number
}
variable "redis_port" {
  type = number
  validation {
    condition     = var.redis_port >= 30000 && var.redis_port <= 32767
    error_message = "Port must be between 30000 and 32767"
  }
}
variable "redis_read_only_port" {
  type = number
  validation {
    condition     = var.redis_read_only_port >= 30000 && var.redis_read_only_port <= 32767
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
variable "dns_domain" {
  type = string
}

variable "multi_zone" {
  type     = bool
  nullable = true
  default  = false
}

variable "pod_zone" {
  type        = string
  nullable    = true
  description = "The zone in which the pods will be deployed. Ignored if multi_zone is true."
  default     = null
}

variable "labeler_image" {
  type    = string
}
