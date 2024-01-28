module "org_policy_domain_whitelist" {
  source  = "terraform-google-modules/org-policy/google"
  version = "~> 5.3.0"

  organization_id = var.org_id

  policy_for = "organization"

  constraint  = "constraints/iam.allowedPolicyMemberDomains"
  policy_type = "list"

  allow = var.domains_to_allow
  enforce = var.enforce_policies
}

module "org_policy_skip_default_network" {
  source  = "terraform-google-modules/org-policy/google"
  version = "~> 5.3.0"

  organization_id = var.org_id

  policy_for = "organization"

  constraint  = "constraints/compute.skipDefaultNetworkCreation"
  policy_type = "boolean"

  enforce = var.enforce_policies
}

module "org_policy_disable_sa_keys" {
  source  = "terraform-google-modules/org-policy/google"
  version = "~> 5.3.0"

  organization_id = var.org_id

  policy_for = "organization"

  constraint  = "constraints/iam.disableServiceAccountKeyUpload"
  policy_type = "boolean"

  enforce = var.enforce_policies
}

module "org_policy_storage_enforce_public_access_prevention" {
  source  = "terraform-google-modules/org-policy/google"
  version = "~> 5.3.0"

  organization_id = var.org_id

  policy_for = "organization"

  constraint  = "constraints/storage.publicAccessPrevention"
  policy_type = "boolean"

  enforce = var.enforce_policies
}




