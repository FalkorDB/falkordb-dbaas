

variable "ou_name" {
  type        = string
  description = "The name of the OU to create."
}

variable "ou_parent_id" {
  type        = string
  description = "The ID of the parent OU."
}

variable "account_name" {
  type        = string
  description = "The name of the account to create."
}

variable "account_email" {
  type        = string
  description = "The email of the account to create."
}

variable "region" {
  type        = string
  description = "The region to create the bucket in."
}
