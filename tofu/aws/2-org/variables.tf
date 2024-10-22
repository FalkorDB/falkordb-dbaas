variable "workloads_ou_name" {
  type        = string
  description = "Name of the OU for workloads"
}

variable "workloads_ou_parent_id" {
  type        = string
  description = "Parent OU ID for workloads"
}

variable "app_plane_account_name" {
  type        = string
  description = "Name of the application plane account"
}

variable "app_plane_account_email" {
  type        = string
  description = "Email of the application plane account"
}
