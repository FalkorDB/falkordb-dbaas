variable "app_plane_account_id" {
  type        = string
  description = "The AWS account ID for the application plane"
}

variable "google_client_ids" {
  description = "The client IDs for Google authentication"
  type        = list(string)
}

variable "cluster_user_role_audience" {
  description = "The audience for the cluster user role"
  type        = string
} 
