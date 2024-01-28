
###### STATE ######
variable "state_bucket_name" {
  type = string
}

###### ORGANIZATION ######
variable "org_id" {
  type = string
}

variable "billing_account_id" {
  type = string
}

variable "root_folder_name" {
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
}

variable "application_plane_project_name" {
  type = string
}

###### WORKLOADS: CONTROL PLANE ######
variable "control_plane_project_id" {
  type = string
}

variable "control_plane_project_name" {
  type = string
}


###### SHARED RESOURCES ######

variable "shared_resources_folder_name" {
  type = string
}

###### SHARED RESOURCES: MONITORING ######
variable "monitoring_project_id" {
  type = string
}

variable "monitoring_project_name" {
  type = string
}

variable "monitored_projects" {
  type = list(string)
}
