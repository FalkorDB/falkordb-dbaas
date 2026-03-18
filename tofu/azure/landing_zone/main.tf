provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
}

provider "azuread" {
  tenant_id = var.tenant_id
}

data "azurerm_subscription" "current" {
  subscription_id = var.subscription_id
}

locals {
  base_name        = lower(replace("${var.name_prefix}-${var.environment}", "/[^0-9a-z-]/", "-"))
  aad_display_name = coalesce(var.argocd_aad_application_name, "${local.base_name}-argocd-aks-access")
  github_aad_display_name = coalesce(
    var.github_actions_aad_application_name,
    "${local.base_name}-github-tofu"
  )

  github_oidc_subjects = length(var.github_oidc_subjects) > 0 ? var.github_oidc_subjects : [
    "repo:${var.github_repository}:environment:dev",
    "repo:${var.github_repository}:environment:prod",
    "repo:${var.github_repository}:ref:refs/heads/dev",
    "repo:${var.github_repository}:ref:refs/heads/main",
    "repo:${var.github_repository}:pull_request",
  ]

  aks_cluster_scopes = toset(distinct(var.aks_cluster_resource_ids))

  extra_role_bindings = {
    for binding in flatten([
      for role_name in var.extra_cluster_role_definition_names : [
        for cluster_scope in local.aks_cluster_scopes : {
          key       = "${cluster_scope}::${role_name}"
          scope     = cluster_scope
          role_name = role_name
        }
      ]
    ]) : binding.key => binding
  }
}

resource "azuread_application" "argocd" {
  display_name     = local.aad_display_name
  sign_in_audience = "AzureADMyOrg"
  owners           = var.aad_application_owner_object_ids
}

resource "azuread_service_principal" "argocd" {
  client_id = azuread_application.argocd.client_id
  owners    = var.aad_application_owner_object_ids
}

resource "time_static" "argocd_sp_password_anchor" {
  triggers = {
    rotation_token = var.client_secret_rotation_token
    validity_hours = tostring(var.client_secret_validity_hours)
  }
}

resource "azuread_service_principal_password" "argocd" {
  service_principal_id = azuread_service_principal.argocd.id
  end_date             = timeadd(time_static.argocd_sp_password_anchor.rfc3339, "${var.client_secret_validity_hours}h")

  rotate_when_changed = {
    rotation = var.client_secret_rotation_token
  }
}

resource "azuread_application" "github_actions" {
  count = var.create_github_actions_identity ? 1 : 0

  display_name     = local.github_aad_display_name
  sign_in_audience = "AzureADMyOrg"
  owners           = var.aad_application_owner_object_ids
}

resource "azuread_service_principal" "github_actions" {
  count = var.create_github_actions_identity ? 1 : 0

  client_id = azuread_application.github_actions[0].client_id
  owners    = var.aad_application_owner_object_ids
}

resource "azuread_application_federated_identity_credential" "github_actions" {
  for_each = var.create_github_actions_identity ? toset(local.github_oidc_subjects) : toset([])

  application_id = azuread_application.github_actions[0].id
  display_name   = "gha-${substr(md5(each.value), 0, 8)}"
  description    = "GitHub OIDC subject ${each.value}"
  audiences      = [var.github_oidc_audience]
  issuer         = var.github_oidc_issuer_url
  subject        = each.value
}

resource "azurerm_role_assignment" "subscription_reader" {
  count = var.grant_subscription_reader_for_discovery ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Reader"
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_cluster_user" {
  count = var.grant_aks_cluster_user_role ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Azure Kubernetes Service Cluster User Role"
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_cluster_admin" {
  count = var.grant_aks_cluster_admin_role ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Azure Kubernetes Service Cluster Admin Role"
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_rbac_cluster_admin" {
  count = var.grant_aks_rbac_cluster_admin_role ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Azure Kubernetes Service RBAC Cluster Admin"
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_contributor_subscription" {
  count = var.grant_aks_contributor_role_at_subscription ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Azure Kubernetes Service Contributor Role"
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_contributor" {
  for_each = var.grant_aks_contributor_role ? local.aks_cluster_scopes : toset([])

  scope                = each.value
  role_definition_name = "Azure Kubernetes Service Contributor Role"
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "aks_extra_roles" {
  for_each = local.extra_role_bindings

  scope                = each.value.scope
  role_definition_name = each.value.role_name
  principal_id         = azuread_service_principal.argocd.object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "github_actions_contributor" {
  count = var.create_github_actions_identity && var.grant_github_actions_subscription_contributor ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.github_actions[0].object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "github_actions_user_access_administrator" {
  count = var.create_github_actions_identity && var.grant_github_actions_user_access_administrator ? 1 : 0

  scope                = data.azurerm_subscription.current.id
  role_definition_name = "User Access Administrator"
  principal_id         = azuread_service_principal.github_actions[0].object_id
  principal_type       = "ServicePrincipal"

  skip_service_principal_aad_check = true
}

resource "azuread_directory_role_assignment" "github_actions_application_administrator" {
  count = var.create_github_actions_identity && var.grant_github_actions_application_administrator_role ? 1 : 0

  # Well-known template ID for "Cloud Application Administrator" — stable across all tenants.
  # Using a hardcoded template ID prevents unnecessary replacements from data source object_id drift.
  role_id             = "158c047a-c907-4556-b7ef-446551a6b5f7"
  principal_object_id = azuread_service_principal.github_actions[0].object_id
}
