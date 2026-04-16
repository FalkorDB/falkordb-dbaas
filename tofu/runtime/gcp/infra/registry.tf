# Artifact Registry repositories and pull permissions.
#
# Three Docker repositories are created in the control-plane project:
#   frontend  — Next.js / React web app images
#   backend   — NestJS API service images
#   jobs      — background job runner images
#
# The GKE node service account gets artifactregistry.reader on the whole
# project so any node pool can pull from any repo.
# The db-exporter SA gets reader access specifically on the backend repo
# (it needs to pull the db-exporter sidecar image).

data "google_service_account" "db_exporter_sa" {
  account_id = var.db_exporter_sa_id
}

resource "google_artifact_registry_repository" "frontend" {
  project       = var.project_id
  location      = var.region
  repository_id = "frontend"
  format        = "DOCKER"
}

resource "google_artifact_registry_repository" "backend" {
  project       = var.project_id
  location      = var.region
  repository_id = "backend"
  format        = "DOCKER"
}

resource "google_artifact_registry_repository" "jobs" {
  project       = var.project_id
  location      = var.region
  repository_id = "jobs"
  format        = "DOCKER"
}

# Allow the GKE node SA to pull any image from this project's registries.
resource "google_project_iam_member" "frontend" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${module.gke.service_account}"
}

# Allow the db-exporter SA to pull specifically from the backend repo.
resource "google_artifact_registry_repository_iam_member" "db_exporter_sa" {
  repository = google_artifact_registry_repository.backend.id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.google_service_account.db_exporter_sa.email}"
}
