provider "google" {
  project = var.project_id
  region  = var.region
}

module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 9.0"

  project_id = var.project_id

  network_name            = "observability-stack-network"
  routing_mode            = "REGIONAL"
  auto_create_subnetworks = false

  subnets = [{
    subnet_name           = "observability-stack-subnet"
    subnet_region         = var.region
    subnet_ip             = var.ip_range_subnet
    subnet_private_access = true
  }]

  secondary_ranges = {
    "observability-stack-subnet" = [{
      range_name    = "pods"
      ip_cidr_range = var.ip_range_pods
      },
      {
        range_name    = "services"
        ip_cidr_range = var.ip_range_services
    }],
  }

}

resource "google_compute_router" "router" {
  name    = "observability-stack-router"
  region  = var.region
  project = var.project_id

  network = module.vpc.network_name

  bgp {
    asn = 64514
  }
}

resource "google_compute_router_nat" "nat" {
  name    = "observability-stack-nat"
  region  = var.region
  project = var.project_id

  router = google_compute_router.router.name

  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

}

resource "random_string" "cluster_suffix" {
  keepers = {
    project_id = var.project_id
  }

  upper   = false
  special = false
  lower   = true

  length = 4
}

module "gke" {
  source                               = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  version                              = "~> 29.0.0"
  project_id                           = var.project_id
  name                                 = "observability-stack-${random_string.cluster_suffix.result}"
  region                               = var.region
  network                              = module.vpc.network_name
  subnetwork                           = "observability-stack-subnet"
  ip_range_pods                        = "pods"
  ip_range_services                    = "services"
  regional                             = true
  create_service_account               = true
  service_account_name                 = "gke-obs-${random_string.cluster_suffix.result}-nodes-sa"
  remove_default_node_pool             = true
  gce_pd_csi_driver                    = true
  network_policy                       = false
  monitoring_enable_managed_prometheus = false
  enable_cost_allocation               = false
  horizontal_pod_autoscaling           = false
  filestore_csi_driver                 = false
  disable_legacy_metadata_endpoints    = false
  deletion_protection                  = false
  enable_private_endpoint              = false
  enable_private_nodes                 = true
  http_load_balancing                  = true

  default_max_pods_per_node = 110

  monitoring_enabled_components = ["SYSTEM_COMPONENTS"]

  security_posture_mode               = "BASIC"
  security_posture_vulnerability_mode = "VULNERABILITY_BASIC"

  node_pools = [
    {
      name               = "default-pool"
      machine_type       = "e2-medium"
      disk_size_gb       = 30
      min_count          = 0
      max_count          = 100
      image_type         = "COS_CONTAINERD"
      initial_node_count = 0
    },
    {
      name               = "observability-resources"
      machine_type       = "e2-standard-2"
      disk_size_gb       = 30
      min_count          = 0
      max_count          = 20
      image_type         = "COS_CONTAINERD"
      initial_node_count = 0

    },
  ]
}

# Public node pool
resource "google_container_node_pool" "public" {
  project    = var.project_id
  name       = "public-pool"
  location   = var.region
  cluster    = module.gke.name
  node_count = 0

  node_config {
    machine_type    = "e2-standard-2"
    disk_size_gb    = 30
    image_type      = "COS_CONTAINERD"
    service_account = module.gke.service_account
    labels = {
      "node_pool" = "public-pool"
    }
  }

  autoscaling {
    min_node_count = 0
    max_node_count = 220

  }
  network_config {
    enable_private_nodes = false
  }

}

# Storage bucket for metrics
resource "google_storage_bucket" "metrics_bucket" {
  name                     = "falkordb-observability-metrics"
  location                 = var.region
  project                  = var.project_id
  force_destroy            = true
  public_access_prevention = "enforced"

  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
    condition {
      age = 30
    }
  }

  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
    condition {
      age = 90
    }
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
    }
  }
}


# ArgoCD IP Address
module "argocd_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["argocd-ip"]
}

# Grafana IP address
module "grafana_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["grafana-ip"]
}

# VMAuth IP address
module "vmauth_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["vmauth-ip"]
}

# ArgoCD DWD Service account
resource "google_service_account" "argocd_dwd" {
  account_id   = "argocd-dwd"
  display_name = "ArgoCD DWD Service Account"
  project      = var.project_id
}

# SA Json Key
resource "google_service_account_key" "argocd_dwd_key" {
  service_account_id = google_service_account.argocd_dwd.name
}
