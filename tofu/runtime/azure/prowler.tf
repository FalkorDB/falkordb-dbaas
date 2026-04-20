# Azure AD Service Principal for Prowler SOC 2 compliance scanning.
#
# Prowler needs read-only access to the Azure subscription to audit
# configuration against SOC 2 Trust Service Criteria.
#
# The SP credentials are injected into the Prowler CronJob via the
# prowler-azure-credentials Sealed Secret.

resource "azuread_application" "prowler" {
  display_name     = "${local.base_name}-prowler-soc2"
  sign_in_audience = "AzureADMyOrg"
  owners           = var.aad_application_owner_object_ids
}

resource "azuread_service_principal" "prowler" {
  client_id = azuread_application.prowler.client_id
  owners    = var.aad_application_owner_object_ids
}

resource "azuread_service_principal_password" "prowler" {
  service_principal_id = azuread_service_principal.prowler.id
  end_date             = timeadd(timestamp(), "${var.client_secret_validity_hours}h")

  lifecycle {
    ignore_changes = [end_date]
  }
}

# Read-only access to the subscription for compliance auditing
resource "azurerm_role_assignment" "prowler_reader" {
  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Reader"
  principal_id         = azuread_service_principal.prowler.object_id
}

# Security Reader for Azure Security Center / Defender findings
resource "azurerm_role_assignment" "prowler_security_reader" {
  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Security Reader"
  principal_id         = azuread_service_principal.prowler.object_id
}

output "prowler_client_id" {
  value       = azuread_application.prowler.client_id
  description = "Prowler Azure AD Application (client) ID"
}

output "prowler_client_secret" {
  value       = azuread_service_principal_password.prowler.value
  sensitive   = true
  description = "Prowler Azure AD Service Principal client secret"
}

output "prowler_tenant_id" {
  value       = var.tenant_id
  description = "Azure tenant ID for Prowler"
}

output "prowler_subscription_id" {
  value       = var.subscription_id
  description = "Azure subscription ID for Prowler"
}
