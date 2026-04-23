# Private GKE cluster, node pools, and daily backup plan.
#
# Node pools:
#   default-pool               — general workloads (0-100 nodes, e2-medium)
#   observability-resources    — observability stack pods (0-20, e2-standard-2)
#   observability-resources-large — Grafana/heavy pods (0-20, e2-standard-4)
#   backend                    — backend API pods (0-20, e2-standard-2)
#   security                   — Wazuh Manager (0-10, e2-standard-4)
#   public-pool                — internet-facing workloads (0-220, e2-standard-2,
#                                 private_nodes=false for L4 LoadBalancer IPs)
#
# All internal pools use private nodes; the public-pool has enable_private_nodes=false
# so customer-facing LoadBalancer services receive external IPs.
# Maintenance window: Mon-Sun 22:00-02:00 UTC (off-peak for EU/US).

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
  zones                                = var.zones
  network                              = module.vpc.network_name
  subnetwork                           = "observability-stack-subnet"
  ip_range_pods                        = "pods"
  ip_range_services                    = "services"
  regional                             = true
  create_service_account               = true
  service_account_name                 = "gke-obs-${random_string.cluster_suffix.result}-nodes-sa"
  remove_default_node_pool             = true
  gce_pd_csi_driver                    = true
  network_policy                       = true
  monitoring_enable_managed_prometheus = false
  enable_cost_allocation               = false
  horizontal_pod_autoscaling           = false
  filestore_csi_driver                 = false
  disable_legacy_metadata_endpoints    = false
  deletion_protection                  = false
  enable_private_endpoint              = false
  enable_private_nodes                 = true
  http_load_balancing                  = true
  gcs_fuse_csi_driver                  = true
  monitoring_service                   = null
  logging_service                      = null

  maintenance_start_time = "1970-01-01T22:00:00Z"
  maintenance_end_time   = "1970-01-02T02:00:00Z"
  maintenance_recurrence = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU"

  default_max_pods_per_node = var.default_max_pods_per_node

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
      max_pods_per_node  = 25
    },
    {
      name               = "observability-resources"
      machine_type       = "e2-standard-2"
      disk_size_gb       = 30
      min_count          = 0
      max_count          = 20
      image_type         = "COS_CONTAINERD"
      initial_node_count = 0
      max_pods_per_node  = 25
    },
    {
      name               = "observability-resources-large"
      machine_type       = "e2-standard-4"
      disk_size_gb       = 30
      min_count          = 0
      max_count          = 20
      image_type         = "COS_CONTAINERD"
      initial_node_count = 0
      max_pods_per_node  = 25
    },
    {
      name               = "backend"
      machine_type       = "e2-standard-2"
      disk_size_gb       = 30
      min_count          = 0
      max_count          = 20
      image_type         = "COS_CONTAINERD"
      initial_node_count = 0
      max_pods_per_node  = 25
    },
  ]
  node_pools_resource_labels = {
    "default-pool" = {
      "goog-gke-node-pool-provisioning-model" = "on-demand"
    }
    "observability-resources" = {
      "goog-gke-node-pool-provisioning-model" = "on-demand"
    }
    "observability-resources-large" = {
      "goog-gke-node-pool-provisioning-model" = "on-demand"
    }
    "backend" = {
      "goog-gke-node-pool-provisioning-model" = "on-demand"
    }
  }

  node_pools_labels = {
    "default-pool" = {
      "node_pool" = "default"
    }
    "observability-resources" = {
      "node_pool" = "observability"
    }
    "observability-resources-large" = {
      "node_pool" = "observability-large"
    }
    "backend" = {
      "node_pool" = "backend"
    }
    "security" = {
      "node_pool" = "security"
    }
  }

  # OpenSearch / Wazuh Indexer requires vm.max_map_count >= 262144.
  # Set at node pool level so it persists across reboots and pod restarts.
  node_pools_linux_node_configs_sysctls = {
    "security" = {
      "net.core.somaxconn"    = "65535"
      "vm.max_map_count"      = "262144"
    }
  }
}

# Public node pool — separate resource so enable_private_nodes can be false.
# Used by customer-facing services that need an external IP on their LB.
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
    resource_labels = {
      "goog-gke-node-pool-provisioning-model" = "on-demand"
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

# Daily backup of critical namespaces at 01:00 UTC, retained for 3 days.
resource "google_gke_backup_backup_plan" "backup_plan" {
  name     = "ctrl-plane-backup-plan"
  project  = var.project_id
  location = var.region
  cluster  = module.gke.cluster_id

  backup_config {
    include_volume_data = true
    include_secrets     = true
    selected_namespaces {
      namespaces = [
        "api",
        "observability",
        "argocd",
        "customer-observability",
        "crossplane-system",
        "sealed-secrets",
      ]
    }
  }

  backup_schedule {
    cron_schedule = "0 1 * * *" # Daily at 1 AM UTC
  }
  retention_policy {
    backup_retain_days      = 3
    backup_delete_lock_days = 1
  }
}
