variable "org_id" {
  type        = string
  description = "GCP organization ID under which the seed project is created."
}

variable "root_folder_id" {
  type        = string
  description = "Folder ID of the root GCP folder where the seed project is placed."
}

variable "billing_account_id" {
  type        = string
  description = "GCP billing account ID to associate with the seed project."
}


###### SEED PROJECT ######

variable "seed_project_id" {
  type        = string
  description = "Project ID for the GCP seed bootstrap project (must be globally unique)."
}

variable "state_bucket_name_prefix" {
  type        = string
  description = "Prefix for the GCS bucket name that will store Terraform/OpenTofu state."
}

