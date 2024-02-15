variable "deployment_name" {
  type = string
}
variable "node_pool_name" {
  type    = string
  default = "default-pool"
}
variable "falkordb_version" {
  type    = string
  default = "v4.0.3"

  # Cannot be empty
  validation {
    condition     = length(var.falkordb_version) > 0
    error_message = "FalkorDB version cannot be empty"
  }
}

variable "falkordb_password" {
  type      = string
  sensitive = true
}

variable "falkordb_cpu" {
  type = string
}

variable "falkordb_memory" {
  type = string
}

variable "persistence_size" {
  type = string
}

variable "falkordb_replicas" {
  type    = number
  default = 2
}

variable "redis_port" {
  type = number
}

variable "sentinel_port" {
  type = number
}

variable "deployment_namespace" {
  type = string
}

variable "dns_ip_address" {
  type = string
}

variable "dns_hostname" {
  type = string
}

variable "dns_ttl" {
  type    = number
  default = 15
}

variable "storage_class_name" {
  type    = string
  default = "standard-rwo"
}
