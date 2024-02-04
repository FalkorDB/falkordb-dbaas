variable "project_id" {
  type = string
}

variable "external_dns_sa_name" {
  type    = string
  default = "external-dns-sa"
}

variable "external_dns_namespace" {
  type    = string
  default = "external-dns"
}
