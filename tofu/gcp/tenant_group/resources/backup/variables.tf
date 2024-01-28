variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "tenant_group_name" {
  type = string
}

variable "force_destroy_bucket" {
  type    = bool
  default = false
}
