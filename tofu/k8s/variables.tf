variable "falkordb_version" {
  type = string
}

variable "falkordb_password" {
  type = string
  sensitive = true
  nullable = true
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

variable "falkordb_eks_endpoint" {
  type = string
}

variable "falkordb_cluster_certificate_authority_data" {
  type = string
}

variable "falkordb_s3_backup_location" {
  type = string
}

variable "falkordb_eks_oidc_provider_arn" {
  type = string
}

variable "falkordb_eks_oidc_issuer" {
  type = string
}

variable "falkordb_domain" {
  type = string
}

variable "falkordb_hosted_zone_id" {
  type = string
}