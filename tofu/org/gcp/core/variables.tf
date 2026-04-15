###### ORGANIZATION ######
variable "org_id" {
  type        = string
  description = "GCP organization ID."
}
variable "billing_account_id" {
  type        = string
  description = "GCP billing account ID to associate with all managed projects."
}
variable "root_folder_id" {
  type        = string
  description = "Folder ID of the root GCP folder under which org resources are created."
}

###### POLICIES ######
variable "domains_to_allow" {
  type        = list(string)
  description = "Domain names permitted by the iam.allowedPolicyMemberDomains org policy."
}

variable "enforce_policies" {
  type        = bool
  description = "Whether to enforce org policies. Set false in development for looser constraints."
}


###### SHARED RESOURCES ######

variable "shared_resources_folder_name" {
  type        = string
  description = "Display name for the shared-resources GCP folder."
}

###### SHARED RESOURCES: MONITORING ######
variable "monitoring_project_id" {
  type        = string
  description = "GCP project ID for the shared monitoring project (max 22 chars)."
  validation {
    condition     = length(var.monitoring_project_id) < 22
    error_message = "Project ID must be less than 22 characters"
  }
}

variable "monitoring_project_name" {
  type        = string
  description = "Display name for the shared monitoring project."
}

variable "monitored_projects" {
  type        = set(string)
  description = "GCP project IDs to add as monitored scopes in the monitoring project."
}

variable "alert_email_addresses" {
  type        = set(string)
  description = "Email addresses for alert notification channels in the monitoring project."
}


###### SHARED RESOURCES: BILLING ######
variable "create_billing_project" {
  type        = bool
  default     = true
  description = "Whether to create a dedicated billing project for budget alerts."
}

variable "billing_project_id" {
  type        = string
  description = "GCP project ID for the billing project (max 22 chars)."
  validation {
    condition     = length(var.billing_project_id) < 22
    error_message = "Project ID must be less than 22 characters"
  }
}

variable "billing_project_name" {
  type        = string
  description = "Display name for the billing project."
}

