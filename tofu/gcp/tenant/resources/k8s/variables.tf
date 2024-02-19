variable "project_id" {
  type = string
}

variable "tenant_name" {
  type = string
}

variable "falkordb_replication_configuration" {
  type = object({
    enable     = bool
    multi_zone = bool
  })
}

variable "node_pool_name" {
  type     = string
  nullable = true
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
}
variable "falkordb_replicas" {
  type = number
}
variable "redis_port" {
  type = number
}
variable "redis_read_only_port" {
  type = number
}
variable "sentinel_port" {
  type = number
}
variable "dns_domain" {
  type = string
}
variable "dns_ip_address" {
  type = string
}
variable "backup_bucket_name" {
  type = string
}
variable "backup_schedule" {
  type    = string
  default = "0 0 * * *"
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
}

variable "cidr_blocks" {
  type    = list(string)
  default = []
}

variable "labeler_image" {
  type    = string
}
