# Service accounts and IAM bindings for the control-plane project.
#
# backend-sa           — workload identity SA for the backend API pods.
#                        Gets secretmanager.secretAccessor on MONGODB_URI.
# falkordb-github-action-sa — CI/CD SA for GitHub Actions pipelines.
#                        Has editor + container.admin + projectIamAdmin roles.
#                        Federated via GitHub OIDC (no long-lived keys).
# db-exporter-sa       — reads RDB files + pushes metrics. Token-creator
#                        delegated to the provisioning SA.
# argocd-sa            — ArgoCD service account used by the runtime/gcp/k8s
#                        stack for Workload Identity Federation.

# ── Backend SA ────────────────────────────────────────────────────────────────

resource "google_service_account" "backend_sa" {
  project      = var.project_id
  account_id   = "backend-sa"
  display_name = "Backend SA"
}

resource "google_secret_manager_secret_iam_binding" "backend_sa" {
  secret_id = google_secret_manager_secret.mongodb_uri.id
  role      = "roles/secretmanager.secretAccessor"

  members = [
    "serviceAccount:${google_service_account.backend_sa.email}",
  ]
}

# Allow the provisioning SA to impersonate the backend SA during provisioning.
resource "google_service_account_iam_member" "provisioning_sa_user" {
  service_account_id = google_service_account.backend_sa.id
  role               = "roles/iam.serviceAccountUser"

  member = "serviceAccount:${module.tenant_provision.provisioning_sa_email}"
}

# ── GitHub Actions SA + OIDC federation ───────────────────────────────────────

resource "google_service_account" "github_action_sa" {
  project      = module.project.project_id
  account_id   = "falkordb-github-action-sa"
  display_name = "FalkorDB Github Action SA"
}

resource "google_project_iam_member" "github_action_sa" {
  project = module.project.project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.github_action_sa.email}"
}

resource "google_project_iam_member" "github_action_sa_k8s_admin" {
  project = module.project.project_id
  role    = "roles/container.admin"
  member  = "serviceAccount:${google_service_account.github_action_sa.email}"
}

resource "google_project_iam_member" "github_action_sa_iam_role_update" {
  project = module.project.project_id
  role    = "roles/resourcemanager.projectIamAdmin"
  member  = "serviceAccount:${google_service_account.github_action_sa.email}"
}

module "gh_oidc" {
  source                = "terraform-google-modules/github-actions-runners/google//modules/gh-oidc"
  project_id            = module.project.project_id
  pool_id               = "github-actions-pool"
  provider_id           = "github-actions"
  provider_display_name = "github-actions"
  sa_mapping = {
    "falkordb-github-action-sa" = {
      sa_name   = google_service_account.github_action_sa.name
      attribute = "attribute.repository/${var.repo_name}"
    }
  }
  attribute_condition = "assertion.repository_owner=='FalkorDB'"
}

# ── DB Exporter SA ────────────────────────────────────────────────────────────

resource "google_service_account" "db_exporter_sa" {
  project      = var.project_id
  account_id   = "db-exporter-sa"
  display_name = "DB Exporter SA"
}

resource "google_service_account_iam_member" "db_exporter_sa_token_creator" {
  service_account_id = google_service_account.db_exporter_sa.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${module.tenant_provision.provisioning_sa_email}"
}

resource "google_project_iam_member" "db_exporter_sa" {
  project = module.project.project_id
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.db_exporter_sa.email}"
}

# ── ArgoCD SA ─────────────────────────────────────────────────────────────────

resource "google_service_account" "argocd_sa" {
  project      = var.project_id
  account_id   = "argocd-sa"
  display_name = "ArgoCD SA"
}
