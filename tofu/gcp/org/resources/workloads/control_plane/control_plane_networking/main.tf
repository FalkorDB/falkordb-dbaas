
resource "google_compute_network" "public_network" {
  project                 = var.project_id

  name                    = var.public_network_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public_network_subnets" {
  count = length(var.public_network_subnets)

  project                  = var.project_id
  region                   = var.public_network_subnets[count.index].region
  name                     = var.public_network_subnets[count.index].name
  ip_cidr_range            = var.public_network_subnets[count.index].cidr
  network                  = google_compute_network.public_network.self_link
  private_ip_google_access = true
}


