variable "org_id" {
  type = string
}

variable "root_folder_id" {
  type = string
}

variable "billing_account_id" {
  type = string
}


###### SEED PROJECT ######

variable "seed_project_id" {
  type = string
}

variable "state_bucket_name" {
  type = string
}

variable "state_bucket_location" {
  type = string
}

variable "state_bucket_force_destroy" {
  type = bool
}