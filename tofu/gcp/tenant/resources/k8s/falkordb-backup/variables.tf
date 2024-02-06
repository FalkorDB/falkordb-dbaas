variable "project_id" {
  type = string
}

variable "tenant_name" {
  type = string
}

variable "deployment_namespace" {
  type = string
}

variable "backup_bucket_name" {
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
