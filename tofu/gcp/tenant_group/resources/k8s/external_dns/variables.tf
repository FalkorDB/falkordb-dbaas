variable "project_id" {
  type = string
}

variable "external_dns_namespace" {
  type    = string
  default = "external-dns"
}

variable "external_dns_sa" {
  type = string
}
