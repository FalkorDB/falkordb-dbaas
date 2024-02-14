module "gke" {
  source                                  = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  version                                 = "~> 29.0.0"
  project_id                              = var.project_id
  name                                    = "${var.tenant_group_name}-cluster"
  region                                  = var.region
  zones                                   = var.zones
  network                                 = var.vpc_name
  subnetwork                              = var.subnetwork_name
  ip_range_pods                           = var.ip_range_pods
  ip_range_services                       = var.ip_range_services
  regional                                = true
  create_service_account                  = true
  remove_default_node_pool                = true
  gce_pd_csi_driver                       = true
  network_policy                          = true
  monitoring_enable_managed_prometheus    = true
  horizontal_pod_autoscaling              = false
  filestore_csi_driver                    = false
  disable_legacy_metadata_endpoints       = false
  deletion_protection                     = var.cluster_deletion_protection

  default_max_pods_per_node = var.default_max_pods_per_node

  enable_private_endpoint = false
  enable_private_nodes    = var.enable_private_nodes

  node_metadata = "GKE_METADATA"

  node_pools = var.node_pools

}

# Create Health Check
# Required only for proxy LB
# resource "google_compute_region_health_check" "redis" {
#   name                = "${var.tenant_group_name}-heatlh-check"
#   check_interval_sec  = 5
#   timeout_sec         = 5
#   healthy_threshold   = 2
#   unhealthy_threshold = 2
#   region              = var.region
#   log_config {
#     enable = true
#   }

#   tcp_health_check {
#     port_specification = "USE_SERVING_PORT"
#   }
# }

