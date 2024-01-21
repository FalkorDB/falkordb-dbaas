
provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

# Enable APIs

resource "google_project_service" "container" {
  project = var.project
  service = "container.googleapis.com"
}

resource "google_project_service" "compute" {
  project = var.project
  service = "compute.googleapis.com"
}

resource "google_project_service" "iam" {
  project = var.project
  service = "iam.googleapis.com"
}

resource "google_project_service" "cloudresourcemanager" {
  project = var.project
  service = "cloudresourcemanager.googleapis.com"
}

resource "google_project_service" "servicemanagement" {
  project = var.project
  service = "servicemanagement.googleapis.com"
}

resource "google_project_service" "serviceusage" {
  project = var.project
  service = "serviceusage.googleapis.com"
}

resource "google_project_service" "storage" {
  project = var.project
  service = "storage.googleapis.com"
}

