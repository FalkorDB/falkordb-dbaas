module "gke" {
  source                            = "terraform-google-modules/kubernetes-engine/google"
  version                           = "~> 29.0.0"
  project_id                        = var.project_id
  name                              = "${var.tenant_group_name}-cluster"
  region                            = var.region
  zones                             = var.zones
  network                           = "${var.tenant_group_name}-vpc"
  subnetwork                        = var.subnetwork_name
  ip_range_pods                     = var.ip_range_pods
  ip_range_services                 = var.ip_range_services
  create_service_account            = false
  remove_default_node_pool          = false
  disable_legacy_metadata_endpoints = false
  deletion_protection               = false

  node_metadata = "GKE_METADATA"

  node_pools = var.node_pools
  node_pools_tags = {
    all = var.node_pools_tags
  }

  monitoring_enable_managed_prometheus = true
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

