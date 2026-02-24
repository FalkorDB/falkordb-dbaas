provider "google" {
  project = var.project_id
  region  = var.region
}

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
  network_policy                       = false
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
}

# Public node pool
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

# ArgoCD IP Address
module "argocd_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["argocd-ip"]
}

# Grafana IP address
module "grafana_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["grafana-ip"]
}

# VMAuth IP address
module "vmauth_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = true
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["vmauth-ip"]
}

# ArgoCD DWD Service account
resource "google_service_account" "argocd_dwd" {
  account_id   = "argocd-dwd"
  display_name = "ArgoCD DWD Service Account"
  project      = var.project_id
}

# SA Json Key
resource "google_service_account_key" "argocd_dwd_key" {
  service_account_id = google_service_account.argocd_dwd.name
}

# Create frontend artifact registry
resource "google_artifact_registry_repository" "frontend" {
  project       = var.project_id
  location      = var.region
  repository_id = "frontend"
  format        = "DOCKER"
}

# Create backend artifact registry
resource "google_artifact_registry_repository" "backend" {
  project       = var.project_id
  location      = var.region
  repository_id = "backend"
  format        = "DOCKER"
}

# Create jobs artifact registry
resource "google_artifact_registry_repository" "jobs" {
  project       = var.project_id
  location      = var.region
  repository_id = "jobs"
  format        = "DOCKER"
}

# add permission to pull images from artifact registry
resource "google_project_iam_member" "frontend" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${module.gke.service_account}"
}

data "google_service_account" "db_exporter_sa" {
  account_id = var.db_exporter_sa_id
}

resource "google_artifact_registry_repository_iam_member" "db_exporter_sa" {
  repository = google_artifact_registry_repository.backend.id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.google_service_account.db_exporter_sa.email}"
}

module "customer_observability_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = false
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["customer-observability-ip"]
}

resource "google_service_account" "alert_reaction_actions" {
  account_id   = "alert-reaction-actions"
  display_name = "Alert Reaction Actions Service Account"
  project      = var.project_id
}

resource "google_service_account_iam_member" "alert_reaction_actions_workload" {
  service_account_id = google_service_account.alert_reaction_actions.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[observability/alert-reaction-actions-sa]"
}
resource "google_service_account_iam_member" "alert_reaction_actions_token" {
  service_account_id = google_service_account.alert_reaction_actions.id
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[observability/alert-reaction-actions-sa]"
}

resource "google_workflows_workflow" "memory_threshold_exceeded" {
  name        = "falkordb-instance-memory-threshold-exceeded"
  description = "Workflow to handle memory threshold exceeded alerts from GKE"
  project     = var.project_id
  region      = var.region

  service_account = google_service_account.alert_reaction_actions.email

  source_contents = <<-EOF
main:
  params: [args]
  steps:
    # 1. Extract instanceId from the incoming Pub/Sub message
    - extract_instance_id:
        assign:
          - instance_id: $${args.labels.namespace}
          - threshold: $${args.annotations.threshold}

    # 2. Retrieve credentials from Secret Manager
    - retrieve_email:
        call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
        args:
          project_id: ${var.project_id}
          secret_id: OMNISTRATE_EMAIL
        result: email_secret
    - retrieve_password:
        call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
        args:
          project_id: ${var.project_id}
          secret_id: OMNISTRATE_PASSWORD
        result: password_secret

    # 3. Call Auth API to retrieve the JWT
    - authenticate_api:
        call: http.post
        args:
          url: "https://api.omnistrate.cloud/2022-09-01-00/signin"
          body:
            email: $${email_secret}
            password: $${password_secret}
          headers:
            Content-Type: "application/json"
        result: auth_response
    - extract_jwt:
        assign:
          - jwt_token: $${auth_response.body.jwtToken}
          - auth_header: $${"Bearer " + jwt_token}

    # 4. Get instance details and subscriptionId
    - get_subscription_id:
        call: http.get
        args:
          url: $${"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/${var.omnistrate_service_id}/environment/${var.omnistrate_environment_id}/instance/" + instance_id}
          headers:
            Authorization: $${auth_header}
        result: instance_details_response
    - extract_subscription_id:
        assign:
          - subscription_id: $${instance_details_response.body.subscriptionId}

    # 5. Get list of users
    - get_users_list:
        call: http.get
        args:
          url: $${"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/${var.omnistrate_service_id}/environment/${var.omnistrate_environment_id}/users?subscriptionId=" + subscription_id}
          headers:
            Authorization: $${auth_header}
        result: users_response
    - extract_users_emails:
        assign:
          - users: $${users_response.body.users}

    # 6. Retrieve Brevo API Key from Secret Manager
    - retrieve_brevo_key:
        call: googleapis.secretmanager.v1.projects.secrets.versions.accessString
        args:
          project_id: ${var.project_id}
          secret_id: BREVO_API_KEY
        result: brevo_secret

    # 6. Iterate through users and call the Application Integration flow
    - send_emails_to_users:
        for:
          value: user
          in: $${users}
          steps:
            - call_brevo_api:
                call: http.post
                args:
                  url: "https://api.brevo.com/v3/smtp/email"
                  headers:
                    Content-Type: "application/json"
                    # Brevo uses the 'api-key' header for authentication
                    api-key: $${brevo_secret}
                  body:
                    # Sender details (must be a verified Brevo sender)
                    sender:
                      name: "FalkorDB Cloud"
                      email: "no-reply@falkordb.cloud"
                    # Recipient details
                    to:
                      - email: $${user.email}
                    templateId: 1
                    params:
                      instance_id: $${instance_id}
                      threshold: $${threshold}
                result: brevo_call_result
                
    - final_success:
        return: "Alert processed successfully for instance: $${instance_id}"
EOF

}

# invoker role for the workflow
resource "google_project_iam_member" "invoker" {
  project = var.project_id
  role    = "roles/workflows.invoker"
  member  = "serviceAccount:${google_service_account.alert_reaction_actions.email}"
}

resource "google_service_account" "ldap_api_admin_sa" {
  project = var.project_id
  account_id = "ldap-api-admin"
  display_name = "LDAP API Admin Service Account"
}