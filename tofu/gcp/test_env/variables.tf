variable "tier_to_test" {
  type    = string
  default = "tier-m1"
}
###### PROJECT ######
variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "me-west1"
}

variable "tenant_group_name" {
  type = string
}

variable "subnet_cidr" {
  type    = string
  default = "10.130.1.0/24"
}

variable "ip_range_pods" {
  type    = string
  default = "10.130.10.0/24"
}

variable "ip_range_services" {
  type    = string
  default = "10.130.20.0/24"
}

variable "tenant_provision_sa" {
  type        = string
  description = "The GCP Service Account to be used by the Tenant Provisioner. Format: projects/<project_id>/serviceAccounts/<service_account_name>@<project_id>.iam.gserviceaccount.com"
  validation {
    condition     = can(regex("projects/[^/]+/serviceAccounts/[^@]+@[^.]+\\.iam\\.gserviceaccount\\.com", var.tenant_provision_sa))
    error_message = "The tenant_provision_sa variable must be in the format: projects/<project_id>/serviceAccounts/<service_account_name>@<project_id>.iam.gserviceaccount.com"
  }
}

variable "cluster_backup_schedule" {
  type    = string
  default = "0 0 * * *"
}

variable "force_destroy_backup_bucket" {
  type    = bool
  default = false
}

variable "dns_domain" {
  type    = string
  default = "cloud.falkordb.com"
}

variable "backup_retention_policy_days" {
  type    = number
  default = 0
}

###### PROJECT ######
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

variable "backup_schedule" {
  type    = string
  default = "0 0 * * *"
}