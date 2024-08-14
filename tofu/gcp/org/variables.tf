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

variable "alert_email_addresses" {
  type = set(string)
}


###### SHARED RESOURCES: BILLING ######
variable "create_billing_project" {
  type    = bool
  default = true
}

variable "billing_project_id" {
  type = string
  validation {
    condition     = length(var.billing_project_id) < 22
    error_message = "Project ID must be less than 22 characters"
  }
}

variable "billing_project_name" {
  type = string
}
