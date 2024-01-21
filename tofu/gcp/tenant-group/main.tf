
provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

# VPC network

resource "google_compute_network" "vpc" {
  name                    = local.vpc_name
  auto_create_subnetworks = false
}

# Subnetwork

resource "google_compute_subnetwork" "subnet" {
  name          = local.subnet_name
  ip_cidr_range = var.subnet_cidr

  region = var.region

  network = google_compute_network.vpc.self_link
}


resource "google_compute_subnetwork" "proxy_only_subnet" {
  name          = "${var.tenant_group_name}-proxy-only-subnet"
  ip_cidr_range = var.subnet_proxy_only_cidr_range
  region        = var.region
  network       = google_compute_network.vpc.self_link
  purpose       = "REGIONAL_MANAGED_PROXY"
  role          = "ACTIVE"
}

# Firewall rules

# Firewall rule to enable traffic from the Load Balancer thorugh NEGs to the Cluster
resource "google_compute_firewall" "tenant-deployments" {
  name    = "allow-tenant-deployments"
  network = google_compute_network.vpc.name

  direction = "INGRESS"
  priority  = 1000

  allow {
    protocol = "tcp"
    # Array of var.tenant_group_size ports starting from 30000
    ports = ["30000-${var.tenant_group_size + 30000 - 1}"]
  }

  source_ranges = ["0.0.0.0/0"]

  target_tags = ["allow-tenant-deployments"]

  depends_on = [
    google_compute_subnetwork.subnet
  ]

}


# Cluster

resource "google_container_cluster" "cluster" {
  name               = local.cluster_name
  location           = var.region
  initial_node_count = 1

  network = google_compute_network.vpc.name

  subnetwork = google_compute_subnetwork.subnet.self_link

  ip_allocation_policy {}

  node_config {
    machine_type = var.node_pool_machine_type
    disk_size_gb = var.node_pool_disk_size
    tags         = ["allow-tenant-deployments"]
  }

  addons_config {
    horizontal_pod_autoscaling {
      disabled = false
    }
  }

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }


  depends_on = [
    google_compute_firewall.tenant-deployments
  ]
}

# Reserve premium IP Address for the Load Balancer

resource "google_compute_address" "lb-ip" {
  name         = "${var.tenant_group_name}-lb-ip"
  address_type = "EXTERNAL"
  region       = var.region
  network_tier = "PREMIUM"
}


# Create Health Check

resource "google_compute_region_health_check" "redis" {
  name                = "${var.tenant_group_name}-heatlh-check"
  check_interval_sec  = 5
  timeout_sec         = 5
  healthy_threshold   = 2
  unhealthy_threshold = 2
  region              = var.region

  tcp_health_check {
    port_specification = "USE_SERVING_PORT"
  }
}


# Allow healtlhcheck rule

resource "google_compute_firewall" "allow-healthcheck" {
  name    = "allow-healthcheck"
  network = google_compute_network.vpc.name

  direction = "INGRESS"
  priority  = 1000

  allow {
    protocol = "TCP"
  }

  source_ranges = ["35.191.0.0/16", "209.85.152.0/22", "209.85.204.0/22", ]

  depends_on = [
    google_compute_subnetwork.subnet
  ]

}
