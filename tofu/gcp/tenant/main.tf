provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

# Get cluster data
data "google_container_cluster" "cluster" {
  name     = var.cluster_name
  location = var.region
}

data "google_client_config" "provider" {}

provider "kubernetes" {
  host  = "https://${data.google_container_cluster.cluster.endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = base64decode(
    data.google_container_cluster.cluster.master_auth[0].cluster_ca_certificate,
  )

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "gcloud"
    args = [
      "container",
      "clusters",
      "get-credentials",
      var.cluster_name,
      "--region",
      var.region,
    ]
  }
}

# Tenant namespace

resource "kubernetes_namespace" "tenant" {
  metadata {
    name = local.tenant_namespace
  }
}

# Tenant deployment

resource "kubernetes_deployment" "redis_deployment" {
  metadata {
    name      = local.deployment_name
    namespace = kubernetes_namespace.tenant.metadata.0.name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = local.deployment_name
      }
    }

    template {
      metadata {
        labels = {
          app = local.deployment_name
        }
      }

      spec {
        container {
          image = var.deployment_image
          name  = local.deployment_name
          port {
            container_port = var.deployment_port
            protocol       = "TCP"
          }
        }
      }
    }
  }
}


# Tenant service

resource "kubernetes_service" "redis_service" {
  metadata {
    name      = local.deployment_service_name
    namespace = kubernetes_namespace.tenant.metadata.0.name
    annotations = {
      "cloud.google.com/neg" : "{\"exposed_ports\": {\"${var.deployment_port}\": { \"name\": \"${local.deployment_neg}\"} }}"
    }
  }

  spec {
    type = "ClusterIP"
    selector = {
      app = local.deployment_name
    }

    port {
      port        = var.deployment_port
      target_port = var.deployment_port
      protocol    = "TCP"
    }
  }

  lifecycle {
    ignore_changes = [
      metadata[0].annotations
    ]
  }
  
}


# Wait 10 seconds

resource "time_sleep" "wait_30_seconds" {
  depends_on = [
    kubernetes_service.redis_service
  ]

  create_duration = "30s"
}

data "google_compute_zones" "region_zones" {
  region = var.region
}

# Get all negs with the same name
data "google_compute_network_endpoint_group" "redis_neg" {
  for_each = toset(data.google_compute_zones.region_zones.names)
  name = local.deployment_neg
  zone = each.value

  depends_on = [
    time_sleep.wait_30_seconds
  ]
}

locals {
  google_compute_region_health_check = "projects/${var.project}/regions/${var.region}/healthChecks/${var.tenant_group_name}-heatlh-check"
}

# Create backend service

resource "google_compute_region_backend_service" "redis_backend_service" {
  name        = local.deployment_neg
  region      = var.region
  timeout_sec = 10

  # For each NEG, create a backend
  dynamic "backend" {
    for_each = data.google_compute_network_endpoint_group.redis_neg
    content {
      group                        = backend.value.self_link
      capacity_scaler              = 1
      max_connections_per_endpoint = 9999
    }
  }

  health_checks = [
    local.google_compute_region_health_check
  ]

  load_balancing_scheme = "EXTERNAL_MANAGED"
  protocol              = "TCP"
  locality_lb_policy = "ROUND_ROBIN"

  log_config {
    enable = true
    sample_rate = 1
  }

  depends_on = [
    local.google_compute_region_health_check,
    time_sleep.wait_30_seconds
  ]
}


# Get reserved IP address

data "google_compute_address" "lb-ip" {
  name   = "${var.tenant_group_name}-lb-ip"
  region = var.region
}

# Create forwarding rule

resource "google_compute_forwarding_rule" "redis_forwarding_rule" {
  name                  = "${var.tenant_name}-forwarding-rule"
  region                = var.region
  ip_address            = data.google_compute_address.lb-ip.address
  port_range            = var.exposed_port
  network_tier          = "PREMIUM"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  ip_protocol           = "TCP"
  target                = google_compute_region_target_tcp_proxy.default.id
  network               = "projects/${var.project}/global/networks/${var.vpc_name}"

}

resource "google_compute_region_target_tcp_proxy" "default" {
  name            = "${var.tenant_name}-target-tcp-proxy"
  backend_service = google_compute_region_backend_service.redis_backend_service.id
  region          = var.region
}
