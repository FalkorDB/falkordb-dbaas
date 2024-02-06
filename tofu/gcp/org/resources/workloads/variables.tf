
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
