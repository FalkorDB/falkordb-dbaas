
###### PROJECT ######

variable "project_id" {
  type = string
}

variable "state_bucket_name" {
  type = string
}

variable "cloud_build_push_endpoint" {
  type     = string
  nullable = true
}
