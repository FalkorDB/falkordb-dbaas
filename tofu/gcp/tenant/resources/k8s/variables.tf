variable "project_id" {
  type = string
}

variable "tenant_name" {
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

variable "deployment_port" {
  type    = number
  default = 6379
}
variable "deployment_neg_name" {
  type = string
}

variable "backup_bucket_name" {
  type = string
}

variable "backup_schedule" {
  type    = string
  default = "0 0 * * *"
}

