module "project" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 14.4.0"

  project_id      = var.project_id
  name            = var.project_name
  folder_id       = var.project_parent_id
  org_id          = var.org_id
  billing_account = var.billing_account_id
  lien            = true

  create_project_sa = false

  activate_apis = [
    "container.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "cloudbuild.googleapis.com",
    "pubsub.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "identitytoolkit.googleapis.com",
    "logging.googleapis.com",
  ]
}

module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 9.0"

  project_id = var.project_id

  network_name            = var.public_network_name
  routing_mode            = "REGIONAL"
  auto_create_subnetworks = false

  subnets    = var.public_network_subnets
  depends_on = [module.project]
}

module "tenant_provision" {
  source = "./control_plane_provision"

  project_id        = var.project_id
  state_bucket_name = var.state_bucket_name

  cloud_build_push_endpoint = var.cloud_build_push_endpoint

  depends_on = [module.project]
}


resource "google_artifact_registry_repository" "backend_services" {
  project       = var.project_id
  location      = var.artifact_registry_region
  repository_id = "backend"
  format        = "DOCKER"
  description   = "Backend services container images"
}


resource "google_secret_manager_secret" "mongodb_uri" {
  project = var.project_id
  replication {
    auto {
    }
  }

  rotation {
    rotation_period    = "15552000s"
    next_rotation_time = "2025-05-21T21:00:00Z"
  }

  topics {
    name = "projects/${var.project_id}/topics/secrets-changes"
  }

  secret_id = "MONGODB_URI"

  depends_on = [module.project]
}

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

# Add SA user role to the service account for the provisioning SA
resource "google_service_account_iam_member" "provisioning_sa_user" {
  service_account_id = google_service_account.backend_sa.id
  role               = "roles/iam.serviceAccountUser"

  member = "serviceAccount:${module.tenant_provision.provisioning_sa_email}"
}
# Create SA for github action pipeline
resource "google_service_account" "github_action_sa" {
  project      = module.project.project_id
  account_id   = "falkordb-github-action-sa"
  display_name = "FalkorDB Github Action SA"
}

# Add service account owne role to the service account
resource "google_project_iam_member" "github_action_sa" {
  project = module.project.project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.github_action_sa.email}"
}

# Add kubernetes admin role to the service account
resource "google_project_iam_member" "github_action_sa_k8s_admin" {
  project = module.project.project_id
  role    = "roles/container.admin"
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
