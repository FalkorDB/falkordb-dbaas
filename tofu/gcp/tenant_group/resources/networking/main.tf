locals {
  subnets = [
    {
      subnet_name           = "${var.tenant_group_name}-subnet"
      subnet_region         = var.region,
      subnet_ip             = var.subnet_cidr
      subnet_private_access = true
    }
  ]
}


# VPC network
module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 9.0"

  project_id = var.project_id

  network_name            = "${var.tenant_group_name}-network"
  routing_mode            = "REGIONAL"
  auto_create_subnetworks = false

  subnets = local.subnets

  secondary_ranges = {
    "${var.tenant_group_name}-subnet" = [{
      range_name    = "pods"
      ip_cidr_range = var.ip_range_pods
      },
      {
        range_name    = "services"
        ip_cidr_range = var.ip_range_services
    }],
  }

  # Required only for proxy LB
  # ingress_rules = [
  #   {
  #     name = "deployments-tcp-${var.tenant_group_name}"

  #     allow = [
  #       {
  #         protocol = "tcp"
  #         ports    = ["${var.deployment_port}"]
  #       }
  #     ]

  #     # How to block unknown customers?
  #     source_ranges = ["0.0.0.0/0"]

  #     target_tags = ["allow-tenant-deployments"]
  #     log_config = {
  #       metadata = "INCLUDE_ALL_METADATA"
  #     }
  #   }
  # ]


}

# Reserve premium IP Address for the Load Balancer
module "lb_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = false
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["${var.tenant_group_name}-ip"]
}


# Create NAT
resource "google_compute_router" "router" {
  name    = "${var.tenant_group_name}-router"
  region  = var.region
  project = var.project_id

  network = module.vpc.network_name

  bgp {
    asn = 64514
  }
}

resource "google_compute_router_nat" "nat" {
  name    = "${var.tenant_group_name}-nat"
  region  = var.region
  project = var.project_id

  router = google_compute_router.router.name

  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

}
