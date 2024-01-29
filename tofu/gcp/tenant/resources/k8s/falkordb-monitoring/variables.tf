variable "tenant_name" {
  type = string
}

variable "falkordb_password" {
  type      = string
  sensitive = true
  nullable  = true
}

variable "grafana_admin_password" {
  type      = string
  sensitive = true
  nullable  = true
}

variable "deployment_namespace" {
  type = string
}
