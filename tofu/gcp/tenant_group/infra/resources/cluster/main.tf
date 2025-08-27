resource "random_string" "cluster_suffix" {
  keepers = {
    tenant_group_name = var.tenant_group_name
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
  name                                 = "${var.tenant_group_name}-${random_string.cluster_suffix.result}"
  region                               = var.region
  zones                                = var.zones
  network                              = var.vpc_name
  subnetwork                           = var.subnetwork_name
  ip_range_pods                        = var.ip_range_pods
  ip_range_services                    = var.ip_range_services
  regional                             = true
  create_service_account               = true
  service_account_name                 = "${substr(var.tenant_group_name, 0, min(30, length(var.tenant_group_name)))}-${random_string.cluster_suffix.result}-sa"
  remove_default_node_pool             = true
  gce_pd_csi_driver                    = true
  network_policy                       = true
  monitoring_enable_managed_prometheus = true
  enable_cost_allocation               = true
  horizontal_pod_autoscaling           = false
  filestore_csi_driver                 = false
  disable_legacy_metadata_endpoints    = false
  deletion_protection                  = var.cluster_deletion_protection

  maintenance_start_time = "1970-01-01T22:00:00Z"
  maintenance_end_time   = "1970-01-02T02:00:00Z"
  maintenance_recurrence = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU"

  default_max_pods_per_node = var.default_max_pods_per_node

  enable_private_endpoint = false
  enable_private_nodes    = var.enable_private_nodes

  node_pools = var.node_pools

  monitoring_enabled_components = [
    "SYSTEM_COMPONENTS",
  ]

  security_posture_mode               = "BASIC"
  security_posture_vulnerability_mode = "VULNERABILITY_BASIC"

  cluster_resource_labels = var.labels
}
