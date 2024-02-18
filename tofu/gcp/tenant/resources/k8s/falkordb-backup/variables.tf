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

variable "port" {
  type = number
}
