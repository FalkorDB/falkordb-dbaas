# Static external IP addresses for cluster ingress endpoints.
#
# Global IPs (Premium tier) are used with GKE Ingress / HTTPS LBs:
#   argocd-ip           — ArgoCD UI
#   grafana-ip          — Grafana UI
#   vmauth-ip           — VictoriaMetrics Auth proxy
#
# Regional IP (customer-observability-ip) is used with a regional TCP/UDP LB
# for per-customer observability endpoints.

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
