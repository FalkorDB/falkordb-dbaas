
locals {
  google_compute_region_health_check = "projects/${var.project_id}/regions/${var.region}/healthChecks/${var.health_check_name}"
}

data "google_compute_zones" "region_zones" {
  region = var.region
}

# Create backend service
resource "google_compute_region_backend_service" "backend_service" {
  name        = var.deployment_neg_name
  region      = var.region
  timeout_sec = 10

  # For each NEG, create a backend
  dynamic "backend" {
    for_each = data.google_compute_zones.region_zones.names
    content {
      group                        = "projects/${var.project_id}/zones/${backend.value}/networkEndpointGroups/${var.deployment_neg_name}"
      capacity_scaler              = 1
      max_connections_per_endpoint = var.max_connections_per_endpoint
    }
  }

  health_checks = [
    local.google_compute_region_health_check
  ]

  load_balancing_scheme = "EXTERNAL_MANAGED"
  protocol              = "TCP"
  locality_lb_policy    = "ROUND_ROBIN"

  log_config {
    enable      = true
    sample_rate = 1
  }

  depends_on = [
    local.google_compute_region_health_check,
  ]
}


# Get reserved IP address

data "google_compute_address" "lb" {
  name   = var.ip_address_name
  region = var.region
}

# Create forwarding rule

resource "google_compute_forwarding_rule" "forwarding_rule" {
  name                  = "${var.tenant_name}-forwarding-rule"
  region                = var.region
  ip_address            = data.google_compute_address.lb.self_link
  port_range            = var.exposed_port
  network_tier          = "PREMIUM"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  ip_protocol           = "TCP"
  target                = google_compute_region_target_tcp_proxy.default.id
  network               = "projects/${var.project_id}/global/networks/${var.vpc_name}"
  source_ip_ranges      = var.source_ip_ranges

}

resource "google_compute_region_target_tcp_proxy" "default" {
  name            = "${var.tenant_name}-target-tcp-proxy"
  backend_service = google_compute_region_backend_service.backend_service.id
  region          = var.region
  # proxy_header    = "PROXY_V1"
}
