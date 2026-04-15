variable "project_id" {
  type        = string
  description = "GCP project ID of the control-plane project."
}

variable "region" {
  type        = string
  description = "GCP region where the control-plane GKE cluster is deployed."
}

variable "cluster_endpoint" {
  type        = string
  description = "GKE cluster API server endpoint (host IP or DNS name)."
}

variable "cluster_ca_certificate" {
  type        = string
  sensitive   = true
  description = "Base64-encoded PEM certificate authority data for the GKE cluster."
}

variable "cluster_name" {
  type        = string
  description = "Name of the GKE cluster."
}

variable "github_organization" {
  type        = string
  default     = "FalkorDB"
  description = "GitHub organisation owning the ArgoCD application repositories."
}

variable "github_repository" {
  type        = string
  default     = "falkordb-observability-cluster"
  description = "GitHub repository containing the observability cluster ArgoCD app definitions."
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment. Must be 'production' or 'development'."

  validation {
    condition     = var.environment == "production" || var.environment == "development"
    error_message = "Environment must be either 'production' or 'development'"
  }
}

variable "argocd_admin_password" {
  type        = string
  sensitive   = true
  description = "Bcrypt-hashed admin password for the ArgoCD UI."
}

variable "dex_google_client_id" {
  type        = string
  sensitive   = true
  description = "Google OAuth2 client ID used by Dex for SSO authentication."
}

variable "dex_google_client_secret" {
  type        = string
  sensitive   = true
  description = "Google OAuth2 client secret used by Dex for SSO authentication."
}

variable "dex_google_admin_email" {
  type        = string
  description = "Google Workspace admin email address for Dex group enumeration."
}

variable "argocd_groups_sa_json" {
  type        = string
  sensitive   = true
  description = "JSON key for the service account used by ArgoCD to enumerate Google Workspace groups."
}

variable "grafana_google_client_id" {
  type        = string
  sensitive   = true
  description = "Google OAuth2 client ID for Grafana SSO authentication."
}

variable "grafana_google_client_secret" {
  type        = string
  sensitive   = true
  description = "Google OAuth2 client secret for Grafana SSO authentication."
}

variable "db_exporter_sa_id" {
  type        = string
  description = "Email address of the db-exporter GCP service account for Workload Identity binding."
}

variable "argocd_sa_id" {
  type        = string
  description = "Email address of the ArgoCD GCP service account for Workload Identity binding."
}
