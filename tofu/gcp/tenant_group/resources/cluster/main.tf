module "gke" {
  source                            = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  version                           = "~> 29.0.0"
  project_id                        = var.project_id
  name                              = "${var.tenant_group_name}-cluster"
  region                            = var.region
  zones                             = var.zones
  network                           = var.vpc_name
  subnetwork                        = var.subnetwork_name
  ip_range_pods                     = var.ip_range_pods
  ip_range_services                 = var.ip_range_services
  create_service_account            = true
  remove_default_node_pool          = true
  horizontal_pod_autoscaling        = true
  filestore_csi_driver              = false
  disable_legacy_metadata_endpoints = false
  deletion_protection               = false

  enable_private_endpoint = true
  enable_private_nodes    = true

  master_authorized_networks = []
  master_ipv4_cidr_block     = var.master_ipv4_cidr_block

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
  log_config {
    enable = true
  }

  tcp_health_check {
    port_specification = "USE_SERVING_PORT"
  }
}

