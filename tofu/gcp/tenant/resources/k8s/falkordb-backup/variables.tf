variable "project_id" {
  type = string
}

variable "tenant_name" {
  type = string
}
variable "node_pool_name" {
  type    = string
  default = "backup-pool"
}
variable "deployment_namespace" {
  type = string
}

variable "deployment_name" {
  type = string
}

variable "backup_location" {
  type = string
}

variable "backup_schedule" {
  type     = string
  nullable = true
  default  = "0 0 * * *"
}

variable "falkordb_password" {
  type      = string
  sensitive = true
}

variable "container_name" {
  type    = string
  default = "redis"
}

variable "port" {
  type = number
}

variable "persistence_size" {
  type = string
}

variable "backup_volume_size_overhead_pctg" {
  type    = number
  default = 0.2
}

variable "storage_class_name" {
  type    = string
  default = "standard-rwo"
}

variable "replication" {
  type    = bool
  default = false
}
