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

variable "external_dns_sa" {
  type = any
}

variable "dns_domain" {
  type = string
}
