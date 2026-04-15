
###### PROJECT ######

variable "org_id" {
  type        = string
  description = "GCP organization ID."
}

variable "billing_account_id" {
  type        = string
  description = "GCP billing account ID to associate with all workload projects."
}

variable "workloads_folder_name" {
  type        = string
  description = "Display name for the GCP folder that contains all workload projects."
}

variable "parent_folder_id" {
  type        = string
  description = "Folder ID of the parent folder under which the workloads folder is created."
}

###### APPLICATION PLANE ######
variable "application_plane_project_id" {
  type        = string
  description = "GCP project ID for the application-plane project."
}

variable "application_plane_project_name" {
  type        = string
  description = "Display name for the application-plane project."
}
variable "application_plane_metering_bucket_name" {
  type        = string
  description = "GCS bucket name for application-plane metering data."
}

variable "application_plane_customer_rdb_bucket_name" {
  type        = string
  description = "GCS bucket name for customer RDB exports in the application plane."
}

variable "application_plane_repo_name" {
  type        = string
  description = "Artifact Registry repository name for the application-plane container images."
}

###### CONTROL PLANE ######

variable "control_plane_project_id" {
  type        = string
  description = "GCP project ID for the control-plane project."
}

variable "control_plane_project_name" {
  type        = string
  description = "Display name for the control-plane project."
}

variable "state_bucket_name" {
  type        = string
  description = "GCS bucket name used as the Terraform/OpenTofu state backend."
}
variable "control_plane_public_network_name" {
  type        = string
  description = "Name of the public VPC network for the control plane."
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
  description = "Subnet definitions for the control-plane public VPC network."
}

variable "control_plane_cloud_build_push_endpoint" {
  type        = string
  nullable    = true
  description = "Cloud Build push trigger endpoint for the control plane. Null if not used."
}

variable "control_plane_rdb_exports_bucket_name" {
  type        = string
  description = "GCS bucket name for RDB exports from the control-plane project."
}

variable "control_plane_rdb_exports_bucket_region" {
  type        = string
  description = "GCS bucket region for RDB exports from the control-plane project."
}

###### PIPELINES DEVELOPMENT ######
variable "create_pipelines_development" {
  type        = bool
  description = "Whether to create the pipelines-development project and associated resources."
}

variable "pipelines_development_project_id" {
  type        = string
  description = "GCP project ID for the pipelines-development project."
}

variable "pipelines_development_project_name" {
  type        = string
  description = "Display name for the pipelines-development project."
}

variable "pipelines_development_repo_name" {
  type        = string
  description = "Artifact Registry repository name for pipelines-development container images."
}

