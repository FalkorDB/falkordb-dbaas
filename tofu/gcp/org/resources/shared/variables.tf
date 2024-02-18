
###### PROJECT ######
variable "org_id" {
  type = string
}
variable "parent_folder_id" {
  type = string
}

variable "billing_account_id" {
  type = string
}

variable "shared_resources_folder_name" {
  type = string
}

###### MONITORING ######

variable "monitoring_project_id" {
  type = string
}

variable "monitoring_project_name" {
  type = string
}

variable "monitored_projects" {
  type = set(string)
}

###### BILLING ######

variable "billing_project_id" {
  type = string
}

variable "billing_project_name" {
  type = string
}


###### POLICIES ######

variable "domains_to_allow" {
  type = list(string)
}

variable "enforce_policies" {
  type = bool
}