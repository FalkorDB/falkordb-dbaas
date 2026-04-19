output "argocd_aad_application_client_id" {
  description = "Client ID for the ArgoCD Azure AD application."
  value       = azuread_application.argocd.client_id
}

output "argocd_service_principal_object_id" {
  description = "Object ID for the ArgoCD service principal."
  value       = azuread_service_principal.argocd.object_id
}

output "argocd_service_principal_client_secret" {
  description = "Client secret for the ArgoCD service principal."
  value       = azuread_service_principal_password.argocd.value
  sensitive   = true
}

output "cluster_discovery_env" {
  description = "Environment values required by cluster-discovery Azure integration and argocd-k8s-auth."
  value = {
    AZURE_SUBSCRIPTION_ID               = var.subscription_id
    AZURE_TENANT_ID                     = var.tenant_id
    AZURE_CLIENT_ID                     = azuread_application.argocd.client_id
    AZURE_CLIENT_SECRET                 = azuread_service_principal_password.argocd.value
    AAD_SERVER_APPLICATION_ID           = var.aad_server_application_id
    AAD_SERVICE_PRINCIPAL_CLIENT_ID     = azuread_application.argocd.client_id
    AAD_SERVICE_PRINCIPAL_CLIENT_SECRET = azuread_service_principal_password.argocd.value
    AAD_LOGIN_METHOD                    = "spn"
  }
  sensitive = true
}

output "github_actions_client_id" {
  description = "Client ID for the GitHub Actions Azure AD application (use as TF_AZURE_CLIENT_ID secret)."
  value       = try(azuread_application.github_actions[0].client_id, null)
}

output "github_actions_service_principal_object_id" {
  description = "Object ID for the GitHub Actions service principal."
  value       = try(azuread_service_principal.github_actions[0].object_id, null)
}

output "github_actions_workflow_auth" {
  description = "Values required by GitHub workflows for Azure OIDC login."
  value = {
    TF_AZURE_CLIENT_ID       = try(azuread_application.github_actions[0].client_id, null)
    TF_AZURE_TENANT_ID       = var.tenant_id
    TF_AZURE_SUBSCRIPTION_ID = var.subscription_id
  }
}
