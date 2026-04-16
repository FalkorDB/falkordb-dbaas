# VPC, subnet, Cloud Router and NAT for the control-plane cluster.
#
# All cluster nodes are private (no public IP). Outbound internet access
# for pulling images and calling Google APIs is provided through Cloud NAT.
# The cloudidentity API is enabled here because GKE Workload Identity
# relies on it at the project level.

resource "google_project_service" "cloud_identity" {
  project = var.project_id
  service = "cloudidentity.googleapis.com"
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
