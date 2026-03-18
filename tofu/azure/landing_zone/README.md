# Azure Landing Zone

This stack provisions a baseline Azure landing zone and creates an Azure AD application/service principal that ArgoCD (running in GKE) can use to authenticate to AKS clusters.

The same Terraform files are used for all environments. Environment-specific values are supplied through tfvars files.

## What This Creates

1. Azure AD application, service principal, and client secret for ArgoCD/cluster-discovery Azure auth.
2. Role assignments needed for discovery and AKS access by default (Reader, Cluster User, Cluster Admin, RBAC Cluster Admin, Contributor at subscription scope).
3. A dedicated Azure AD application/service principal for GitHub Actions OIDC.
4. Federated identity credentials for this repository (dev/prod environments, main/dev branches, pull requests).
5. Subscription-level permissions and directory roles for GitHub Actions Terraform applies (Contributor, User Access Administrator, Cloud Application Administrator).

## Authentication Model

The stack creates a service principal and outputs all values required by:

1. backend/services/cluster-discovery Azure provider.
2. argocd-k8s-auth exec plugin for AKS cluster registration.

Output cluster_discovery_env includes:

1. AZURE_SUBSCRIPTION_ID
2. AZURE_TENANT_ID
3. AZURE_CLIENT_ID
4. AZURE_CLIENT_SECRET
5. AAD_SERVER_APPLICATION_ID
6. AAD_SERVICE_PRINCIPAL_CLIENT_ID
7. AAD_SERVICE_PRINCIPAL_CLIENT_SECRET
8. AAD_LOGIN_METHOD

## Role Assignments

By default:

1. Reader is granted at subscription scope to allow discovery operations.
2. Azure Kubernetes Service Cluster User Role is granted at subscription scope.
3. Azure Kubernetes Service Cluster Admin Role is granted at subscription scope (required for cluster admin credential access).
4. Azure Kubernetes Service RBAC Cluster Admin is granted at subscription scope.
5. Azure Kubernetes Service Contributor Role is granted at subscription scope (required for cluster-discovery to provision node pools).

Optional toggles:

1. grant_aks_contributor_role (cluster-scoped, for granular per-cluster permissions)
2. extra_cluster_role_definition_names

## GitHub Actions OIDC

When create_github_actions_identity is true (default), this stack creates a GitHub OIDC identity and grants:

1. Contributor at subscription scope.
2. User Access Administrator at subscription scope.
3. Cloud Application Administrator Azure AD directory role (for managing this stack's Azure AD applications).

These permissions allow pipeline jobs to apply Terraform, manage role assignments, and update Azure AD applications for cluster auth bootstrapping.

Use output github_actions_workflow_auth to populate the workflow secrets:

1. TF_AZURE_CLIENT_ID
2. TF_AZURE_TENANT_ID
3. TF_AZURE_SUBSCRIPTION_ID

## Usage

Initialize:

tofu -chdir=tofu/azure/landing_zone init

Plan dev:

tofu -chdir=tofu/azure/landing_zone plan -var-file=terraform.dev.tfvars

Plan prod:

tofu -chdir=tofu/azure/landing_zone plan -var-file=terraform.prod.tfvars

Apply:

tofu -chdir=tofu/azure/landing_zone apply -var-file=terraform.dev.tfvars

## Notes

1. tfvars files are ignored by git in this repository. Keep real values in local terraform.dev.tfvars and terraform.prod.tfvars files.
2. Populate aks_cluster_resource_ids only when using optional cluster-scoped role assignments (grant_aks_contributor_role or extra_cluster_role_definition_names).
3. Rotate the service principal secret by changing client_secret_rotation_token.
4. Bootstrap run still requires an identity that can create Azure AD apps/service principals and assign subscription roles.
