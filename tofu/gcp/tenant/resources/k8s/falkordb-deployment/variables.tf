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
  type    = number
  default = 6379
}
variable "sentinel_port" {
  type    = number
  default = 26379
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
