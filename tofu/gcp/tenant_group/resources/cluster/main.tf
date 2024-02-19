module "gke" {
  source                               = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  version                              = "~> 29.0.0"
  project_id                           = var.project_id
  name                                 = "${var.tenant_group_name}-cluster"
  region                               = var.region
  zones                                = var.zones
  network                              = var.vpc_name
  subnetwork                           = var.subnetwork_name
  ip_range_pods                        = var.ip_range_pods
  ip_range_services                    = var.ip_range_services
  regional                             = true
  create_service_account               = true
  remove_default_node_pool             = true
  gce_pd_csi_driver                    = true
  network_policy                       = true
  monitoring_enable_managed_prometheus = true
  enable_cost_allocation               = true
  horizontal_pod_autoscaling           = false
  filestore_csi_driver                 = false
  disable_legacy_metadata_endpoints    = false
  deletion_protection                  = var.cluster_deletion_protection

  default_max_pods_per_node = var.default_max_pods_per_node

  enable_private_endpoint = false
  enable_private_nodes    = var.enable_private_nodes

  node_pools = var.node_pools

  cluster_resource_labels = var.labels
}