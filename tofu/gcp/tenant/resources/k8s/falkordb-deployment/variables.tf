variable "falkordb_version" {
  type = string
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

variable "persistance_size" {
  type = string
}

variable "falkordb_replicas" {
  type = number
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

variable "multi_zone" {
  type     = bool
  nullable = true
  default  = false
}

variable "pod_zone" {
  type        = string
  description = "The zone in which the pods will be deployed. Ignored if multi_zone is true."
  default = ""
}

variable "storage_class_name" {
  type    = string
  default = "standard-rwo"
}
