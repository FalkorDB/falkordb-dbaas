variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "tenant_provision_sa" {
  type = string
}

variable "cluster_backup_schedule" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_ca_certificate" {
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
