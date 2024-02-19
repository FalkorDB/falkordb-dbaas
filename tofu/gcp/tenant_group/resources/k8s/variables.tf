variable "project_id" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "region" {
  type = string
}
variable "tenant_provision_sa" {
  type = string
}

variable "dns_domain" {
  type = string
}

variable "backup_bucket_name" {
  type = string
}

variable "velero_gcp_sa_id" {
  type = string
}

variable "velero_gcp_sa_email" {
  type = string
}

variable "cluster_backup_schedule" {
  type = string
}
