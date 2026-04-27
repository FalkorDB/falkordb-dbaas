# VPC network for the control-plane project.
#
# Creates a regional VPC with the subnets defined via var.public_network_subnets.
# The "public" naming here is a legacy convention — subnets have
# private_ip_google_access enabled. Actual public exposure is controlled at
# the GKE Ingress / LB level, not at the subnet level.

module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 9.0"

  project_id = var.project_id

  network_name            = var.public_network_name
  routing_mode            = "REGIONAL"
  auto_create_subnetworks = false

  subnets    = var.public_network_subnets
  depends_on = [module.project]
}
