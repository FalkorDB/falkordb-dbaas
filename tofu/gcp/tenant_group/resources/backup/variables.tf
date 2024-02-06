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

variable "retention_policy_days" {
  type    = number
  default = 0

  validation {
    condition     = var.retention_policy_days <= 365
    error_message = "retention_policy_days must be less than or equal to 365"
  }
}
