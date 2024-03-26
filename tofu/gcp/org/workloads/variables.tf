
###### PROJECT ######

variable "org_id" {
  type = string
}

variable "billing_account_id" {
  type = string
}

variable "workloads_folder_name" {
  type = string
}

variable "parent_folder_id" {
  type = string
}

###### APPLICATION PLANE ######
variable "application_plane_project_id" {
  type = string
}

variable "application_plane_project_name" {
  type = string
}


###### CONTROL PLANE ######

variable "control_plane_project_id" {
  type = string
}

variable "control_plane_project_name" {
  type = string
}

variable "state_bucket_name" {
  type = string
}
variable "control_plane_public_network_name" {
  type = string
}
variable "control_plane_public_network_subnets" {
  type = set(
    object({
      subnet_name           = string
      subnet_region         = string
      subnet_ip             = string
      subnet_private_access = bool
    })
  )
}

variable "control_plane_cloud_build_push_endpoint" {
  type     = string
  nullable = true
}

###### PIPELINES DEVELOPMENT ######
variable "create_pipelines_development" {
  type = bool
}

variable "pipelines_development_project_id" {
  type = string
}

variable "pipelines_development_project_name" {
  type = string
}

variable "pipelines_development_repo_name" {
  type = string
}
