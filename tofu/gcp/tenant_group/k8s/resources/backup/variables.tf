variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "velero_gcp_sa_id" {
  type = string
}

variable "velero_gcp_sa_email" {
  type = string
}

variable "backup_bucket_name" {
  type = string
}

variable "cluster_backup_schedule" {
  type     = string
  nullable = true
}
