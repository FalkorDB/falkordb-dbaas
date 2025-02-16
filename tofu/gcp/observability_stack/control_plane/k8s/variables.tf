variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_ca_certificate" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "github_organization" {
  type    = string
  default = "FalkorDB"
}

variable "github_repository" {
  type    = string
  default = "falkordb-observability-cluster"
}

variable "environment" {
  type    = string
  default = "production"

  validation {
    condition     = var.environment == "production" || var.environment == "development"
    error_message = "Environment must be either 'production' or 'development'"
  }
}

variable "argocd_admin_password" {
  type = string
}

variable "dex_google_client_id" {
  type = string
}

variable "dex_google_client_secret" {
  type = string
}
