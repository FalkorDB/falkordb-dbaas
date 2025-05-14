
###### PROJECT ######

variable "org_id" {
  type = string
}
variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "project_parent_id" {
  type = string
}

variable "billing_account_id" {
  type = string
}

variable "state_bucket_name" {
  type = string
}

variable "repo_name" {
  type = string
}

###### NETWORKING ######

variable "public_network_name" {
  type = string
}

variable "public_network_subnets" {
  type = set(
    object({
      subnet_name           = string
      subnet_region         = string
      subnet_ip             = string
      subnet_private_access = bool
    })
  )
}

###### PROVISIONER ######

variable "cloud_build_push_endpoint" {
  type     = string
  nullable = true
}

variable "artifact_registry_region" {
  type    = string
  default = "us-central1"
}

###### DB EXPORTER ######
variable "rdb_exports_bucket_name" {
  type = string
}

variable "rdb_exports_bucket_region" {
  type = string
}
