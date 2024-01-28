locals {
  subnets = [
    {
      subnet_name           = "${var.tenant_group_name}-subnet"
      subnet_region         = var.region,
      subnet_ip             = var.subnet_cidr
      subnet_private_access = true
    },
    {
      subnet_name           = "${var.tenant_group_name}-subnet-proxy-only"
      subnet_region         = var.region,
      subnet_ip             = var.subnet_proxy_only_cidr
      subnet_private_access = true
      purpose               = "REGIONAL_MANAGED_PROXY"
      role                  = "ACTIVE"
    },
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
    "${var.tenant_group_name}-subnet-proxy-only" = [{
      range_name    = "pods"
      ip_cidr_range = var.ip_range_pods
      },
      {
        range_name    = "services"
        ip_cidr_range = var.ip_range_services
    }]
  }

  ingress_rules = [
    {
      name = "allow-tcp-for-deployments"

      allow = [
        {
          protocol = "tcp"
          ports    = ["30000-${var.tenant_group_size + 30000 - 1}"]
        }
      ]

      # How to block unknown customers?
      source_ranges = ["0.0.0.0/0"]

      target_tags = ["allow-tenant-deployments"]
    },
    {
      name = "allow-healthcheck"

      allow = [
        {
          protocol = "TCP"
          ports    = ["30000-${var.tenant_group_size + 30000 - 1}"]
        }
      ]

      source_ranges = ["35.191.0.0/16", "209.85.152.0/22", "209.85.204.0/22"]
    }
  ]

}

# Reserve premium IP Address for the Load Balancer
module "lb_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["${var.tenant_group_name}-ip"]
}
