# Override file to ignore node_locations drift caused by GCP zone changes
# This prevents OpenTofu from trying to revert zones that GCP manages automatically

resource "google_container_cluster" "primary" {
  lifecycle {
    ignore_changes = [
      node_locations,
      node_pool,
    ]
  }
}
