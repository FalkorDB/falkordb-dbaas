# Service accounts and Workload Identity bindings for cluster workloads.
#
# argocd-dwd         — Domain-Wide Delegation SA for ArgoCD Google Workspace
#                      group sync. A JSON key is created and exported as an
#                      output so it can be stored in a secret by the k8s stack.
#
# alert-reaction-actions — SA used by the Google Workflows workflow to call
#                          GKE / Omnistrate APIs when alert thresholds fire.
#                          Bound to the observability/alert-reaction-actions-sa KSA.
#
# ldap-api-admin     — SA for the customer LDAP API service (used by
#                      argocd/kustomize/customer-ldap-api).

# ── ArgoCD Domain-Wide Delegation ─────────────────────────────────────────────

resource "google_service_account" "argocd_dwd" {
  account_id   = "argocd-dwd"
  display_name = "ArgoCD DWD Service Account"
  project      = var.project_id
}

# Static JSON key — stored as a k8s secret by the k8s stack (argocd-google-groups).
# Rotate by tainting this resource and re-applying.
resource "google_service_account_key" "argocd_dwd_key" {
  service_account_id = google_service_account.argocd_dwd.name
}

# ── Alert Reaction Actions ─────────────────────────────────────────────────────

resource "google_service_account" "alert_reaction_actions" {
  account_id   = "alert-reaction-actions"
  display_name = "Alert Reaction Actions Service Account"
  project      = var.project_id
}

resource "google_service_account_iam_member" "alert_reaction_actions_workload" {
  service_account_id = google_service_account.alert_reaction_actions.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[observability/alert-reaction-actions-sa]"
}

resource "google_service_account_iam_member" "alert_reaction_actions_token" {
  service_account_id = google_service_account.alert_reaction_actions.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[observability/alert-reaction-actions-sa]"
}

# ── LDAP API Admin ─────────────────────────────────────────────────────────────

resource "google_service_account" "ldap_api_admin_sa" {
  project      = var.project_id
  account_id   = "ldap-api-admin"
  display_name = "LDAP API Admin Service Account"
}

# ── ArgoCD Image Updater ───────────────────────────────────────────────────────

resource "google_service_account" "argocd_image_updater" {
  project      = var.project_id
  account_id   = "argocd-image-updater"
  display_name = "ArgoCD Image Updater Service Account"
}

# Bind the KSA argocd/argocd-image-updater to this GSA via Workload Identity.
resource "google_service_account_iam_member" "argocd_image_updater_workload" {
  service_account_id = google_service_account.argocd_image_updater.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[argocd/argocd-image-updater]"
}
