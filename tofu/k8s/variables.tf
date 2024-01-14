variable "falkordb_version" {
  type    = string
  default = "v4.0.3"
}

variable "falkordb_cpu" {
  type    = string
  default = "500m"
}

variable "falkordb_memory" {
  type    = string
  default = "1Gi"
}

variable "persistance_size" {
  type    = string
  default = "8Gi"
}

variable "falkordb_replicas" {
  type    = number
  default = 1
}

variable "grafana_admin_password" {
  type    = string
  default = "admin"
}

variable "backup_schedule" {
  type    = string
  default = "0 * * * *"
}

variable "falkordb_eks_cluster_name" {
  type = string
}

variable "falkordb_eks_endpoint" {
  type = string
}

variable "falkordb_cluster_certificate_authority_data" {
  type = string
}

variable "falkordb_s3_backup_location" {
  type = string
}