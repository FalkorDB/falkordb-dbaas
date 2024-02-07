###### ORGANIZATION ######
variable "org_id" {
  type = string
}
variable "billing_account_id" {
  type = string
}
variable "root_folder_id" {
  type = string
}

###### POLICIES ######
variable "domains_to_allow" {
  type = list(string)
}

variable "enforce_policies" {
  type = bool
}

###### WORKLOADS ######

variable "workloads_folder_name" {
  type = string
}

###### WORKLOADS: APPLICATION PLANE ######
variable "application_plane_project_id" {
  type = string
  validation {
    condition     = length(var.application_plane_project_id) < 22
    error_message = "Project ID must be less than 22 characters"
  }
}

variable "application_plane_project_name" {
  type = string
}

###### WORKLOADS: CONTROL PLANE ######
variable "control_plane_project_id" {
  type = string
  validation {
    condition     = length(var.control_plane_project_id) < 22
    error_message = "Project ID must be less than 22 characters"
  }
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

###### WORKLOADS: CONTROL PLANE ######
variable "create_pipelines_development" {
  type    = bool
  default = false
}

variable "pipelines_development_project_id" {
  type    = string
  default = "pipelines-development"
}

variable "pipelines_development_project_name" {
  type    = string
  default = "Pipelines Development"
}

variable "pipelines_development_repo_name" {
  type    = string
  default = "FalkorDB/falkordb-dbaas"
}

###### SHARED RESOURCES ######

variable "shared_resources_folder_name" {
  type = string
}

###### SHARED RESOURCES: MONITORING ######
variable "monitoring_project_id" {
  type = string
  validation {
    condition     = length(var.monitoring_project_id) < 22
    error_message = "Project ID must be less than 22 characters"
  }
}

variable "monitoring_project_name" {
  type = string
}

variable "monitored_projects" {
  type = set(string)
}
