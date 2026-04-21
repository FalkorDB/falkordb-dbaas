variable "region" {
  description = "The AWS region"
  type        = string
}

variable "assume_role_arn" {
  description = "The ARN of the role to assume for AWS provider"
  type        = string
}

variable "google_client_ids" {
  description = "The client IDs for Google authentication"
  type        = list(string)
}

variable "account_id" {
  description = "The AWS account ID for the application plane"
  type        = string
}

variable "cluster_user_role_audience" {
  description = "The audience for the cluster user role"
  type        = string
}
