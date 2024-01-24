variable "region" {
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

variable "grafana_admin_password" {
  type = string
}

variable "backup_schedule" {
  type = string
}

variable "falkordb_eks_cluster_name" {
  type = string
}

variable "falkordb_s3_backup_name" {
  type = string
}

variable "falkordb_domain" {
  type = string
}

variable "falkordb_hosted_zone_id" {
  type = string
}

variable "backup_retention_period" {
  type = number
}
