variable "region" {
  description = "The AWS region"
  type        = string
}

variable "assume_role_arn" {
  description = "The ARN of the role to assume for AWS provider"
  type        = string
}

variable "role_arn" {
  description = "The ARN of the role to assume for AWS provider"
  type        = string
}
