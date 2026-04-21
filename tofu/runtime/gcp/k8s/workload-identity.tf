# Workload Identity bindings for GKE service accounts.
#
# Binds GCP service accounts to Kubernetes service accounts (KSA) using
# GKE Workload Identity Federation, so pods can call Google APIs without
# a static service-account key.
#
# Managed identities:
#   db-exporter-sa  (namespace: api)      → db_exporter_sa GCP SA
#   argocd-server   (namespace: argocd)   → argocd_sa GCP SA
#   argocd-application-controller         → argocd_sa GCP SA

# ── api namespace ────────────────────────────────────────────────────────────

data "google_service_account" "db_exporter_sa" {
  account_id = var.db_exporter_sa_id
}

resource "kubernetes_namespace" "api" {
  metadata {
    name = "api"
    labels = {
      "argocd.argoproj.io/instance" = "api-services"
    }
  }
}

resource "kubernetes_service_account" "db-exporter-sa" {
  metadata {
    name      = "db-exporter-sa"
    namespace = kubernetes_namespace.api.id

    annotations = {
      "iam.gke.io/gcp-service-account" = data.google_service_account.db_exporter_sa.email
    }
  }
}

# ── db-exporter Workload Identity ────────────────────────────────────────────

resource "google_service_account_iam_binding" "db-exporter-sa-iam" {
  service_account_id = var.db_exporter_sa_id
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.api.metadata.0.name}/${kubernetes_service_account.db-exporter-sa.metadata.0.name}]",
  ]
}

resource "google_service_account_iam_binding" "db-exporter-sa-token-creator" {
  service_account_id = var.db_exporter_sa_id
  role               = "roles/iam.serviceAccountTokenCreator"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.api.metadata.0.name}/${kubernetes_service_account.db-exporter-sa.metadata.0.name}]",
    "serviceAccount:${data.google_service_account.db_exporter_sa.email}",
    "serviceAccount:falkordb-provisioning-sa@${var.project_id}.iam.gserviceaccount.com"
  ]
}

# ── ArgoCD Workload Identity ──────────────────────────────────────────────────

resource "google_service_account_iam_binding" "argocd_sa" {
  service_account_id = var.argocd_sa_id
  role               = "roles/iam.serviceAccountUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.argocd.metadata.0.name}/argocd-server]",
    "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.argocd.metadata.0.name}/argocd-application-controller]",
  ]
}

resource "google_service_account_iam_binding" "argocd_sa_token_creator" {
  service_account_id = var.argocd_sa_id
  role               = "roles/iam.serviceAccountTokenCreator"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.argocd.metadata.0.name}/argocd-server]",
    "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.argocd.metadata.0.name}/argocd-application-controller]",
  ]
}
