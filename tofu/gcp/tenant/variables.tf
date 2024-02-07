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

variable "backup_bucket_name" {
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

variable "persistance_size" {
  type = string
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
