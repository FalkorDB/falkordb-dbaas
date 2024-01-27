variable "region" {
  type = string
}

variable "assume_role_arn" {
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
  type    = string
  default = "cluster_name"
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

variable "key_administrators" {
  type    = list(string)
  default = []
}

variable "key_service_roles_for_autoscaling" {
  type    = list(string)
  default = []
}

variable "falkordb_eks_cluster_oidc_issuer_url" {
  type = string
}

variable "falkordb_eks_cluster_oidc_issuer_arn" {
  type = string
}

variable "falkordb_eks_cluster_endpoint" {
  type = string
}

variable "falkordb_eks_cluster_certificate_autority" {
  type = string
}
