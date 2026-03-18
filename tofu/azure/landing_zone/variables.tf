variable "subscription_id" {
  description = "Azure subscription ID where resources are provisioned."
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID used for AzureRM and AzureAD providers."
  type        = string
}

variable "environment" {
  description = "Environment name used for naming and tags (for example: dev, prod)."
  type        = string
}

variable "name_prefix" {
  description = "Resource name prefix for landing-zone resources."
  type        = string
  default     = "falkordb"
}

variable "argocd_aad_application_name" {
  description = "Optional explicit display name for the ArgoCD Azure AD application."
  type        = string
  default     = null
}

variable "aad_application_owner_object_ids" {
  description = "Optional owner object IDs for the Azure AD application and service principal."
  type        = list(string)
  default     = []
}

variable "client_secret_validity_hours" {
  description = "Service principal client secret validity period in hours."
  type        = number
  default     = 8760
}

variable "client_secret_rotation_token" {
  description = "Change this token to force service principal secret rotation."
  type        = string
  default     = "v1"
}

variable "aad_server_application_id" {
  description = "AAD server application ID used by argocd-k8s-auth for AKS token exchange."
  type        = string
  default     = "6dae42f8-4368-4678-94ff-3960e28e3630"
}

variable "aks_cluster_resource_ids" {
  description = "AKS managed cluster resource IDs used for optional cluster-scoped role assignments."
  type        = list(string)
  default     = []
}

variable "grant_subscription_reader_for_discovery" {
  description = "Grant Reader on the subscription for cluster discovery API calls."
  type        = bool
  default     = true
}

variable "grant_aks_cluster_user_role" {
  description = "Grant Azure Kubernetes Service Cluster User Role at subscription scope."
  type        = bool
  default     = true
}

variable "grant_aks_rbac_cluster_admin_role" {
  description = "Grant Azure Kubernetes Service RBAC Cluster Admin at subscription scope."
  type        = bool
  default     = true
}

variable "grant_aks_contributor_role" {
  description = "Grant Azure Kubernetes Service Contributor Role on AKS clusters."
  type        = bool
  default     = false
}

variable "extra_cluster_role_definition_names" {
  description = "Additional Azure role definition names to assign on all AKS cluster scopes."
  type        = list(string)
  default     = []
}

variable "create_github_actions_identity" {
  description = "Create a dedicated Azure AD app/service principal for GitHub Actions OIDC authentication."
  type        = bool
  default     = true
}

variable "github_actions_aad_application_name" {
  description = "Optional explicit display name for the GitHub Actions Azure AD application."
  type        = string
  default     = null
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format allowed to federate via OIDC."
  type        = string
  default     = "FalkorDB/falkordb-dbaas"
}

variable "github_oidc_issuer_url" {
  description = "OIDC issuer URL for GitHub Actions tokens."
  type        = string
  default     = "https://token.actions.githubusercontent.com"
}

variable "github_oidc_audience" {
  description = "OIDC audience expected by Azure federated credentials."
  type        = string
  default     = "api://AzureADTokenExchange"
}

variable "github_oidc_subjects" {
  description = "Optional explicit GitHub OIDC subjects. If empty, sensible defaults for this repo are used."
  type        = list(string)
  default     = []
}

variable "grant_github_actions_subscription_contributor" {
  description = "Grant Contributor at subscription scope to the GitHub Actions identity."
  type        = bool
  default     = true
}

variable "grant_github_actions_user_access_administrator" {
  description = "Grant User Access Administrator at subscription scope to the GitHub Actions identity (required for role assignment resources)."
  type        = bool
  default     = true
}
