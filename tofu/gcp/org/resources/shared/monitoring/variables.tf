
###### PROJECT ######

variable "org_id" {
  type = string
}
variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "project_parent_id" {
  type = string
}

variable "billing_account_id" {
  type = string
}

###### MONITORING ######

variable "monitored_projects" {
  type = set(string)
}
