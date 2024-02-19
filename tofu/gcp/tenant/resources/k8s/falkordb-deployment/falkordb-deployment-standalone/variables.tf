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
variable "falkordb_min_cpu" {
  type = string
}

variable "falkordb_min_memory" {
  type = string
}
variable "persistence_size" {
  type = string
}

variable "redis_port" {
  type = number
}

variable "deployment_namespace" {
  type = string
}

variable "dns_ip_address" {
  type = string
}

variable "storage_class_name" {
  type    = string
  default = "standard-rwo"
}

variable "service_type" {
  type    = string
  default = "LoadBalancer"
  validation {
    condition     = var.service_type == "LoadBalancer" || var.service_type == "NodePort"
    error_message = "Service type must be either LoadBalancer or NodePort"
  }
}
