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

variable "cloudtrail_retention_days" {
  type        = number
  description = "Number of days to retain CloudTrail logs"
  default     = 90
}