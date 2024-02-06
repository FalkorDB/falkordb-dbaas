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

variable "create_k8s_resources" {
  type    = bool
  default = false
}

variable "subnet_cidr" {
  type    = string
  default = "10.130.1.0/24"
}

variable "subnet_proxy_only_cidr" {
  type    = string
  default = "10.130.2.0/24"
}

variable "ip_range_pods" {
  type    = string
  default = "10.130.10.0/24"
}

variable "ip_range_services" {
  type    = string
  default = "10.130.20.0/24"
}

variable "tenant_group_size" {
  type    = number
  default = 20
}

variable "cluster_name" {
  type = string
}

variable "node_pools" {
  type = list(map(any))

  default = [{
    name         = "simple-pool"
    machine_type = "e2-medium"
    disk_size_gb = 20
  }]
}

variable "tenant_provision_sa" {
  type        = string
  description = "The GCP Service Account to be used by the Tenant Provisioner. Format: projects/<project_id>/serviceAccounts/<service_account_name>@<project_id>.iam.gserviceaccount.com"
  validation {
    condition     = can(regex("projects/[^/]+/serviceAccounts/[^@]+@[^.]+\\.iam\\.gserviceaccount\\.com", var.tenant_provision_sa))
    error_message = "The tenant_provision_sa variable must be in the format: projects/<project_id>/serviceAccounts/<service_account_name>@<project_id>.iam.gserviceaccount.com"
  }
}

variable "force_destroy_backup_bucket" {
  type    = bool
  default = false
}

variable "deployment_port" {
  type    = number
  default = 6379
}

variable "dns_domain" {
  type    = string
  default = "cloud.falkordb.com"
}
