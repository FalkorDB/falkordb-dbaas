variable "project_id" {
  type = string
}

variable "tenant_group_name" {
  type = string
}

variable "dns_domain" {
  type = string
}

variable "dns_sa_name" {
  type    = string
  default = "external-dns-sa"
}
