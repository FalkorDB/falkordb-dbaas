terraform {
  backend "gcs" {
    prefix = "observability_stack_control_plane_k8s"
  }
}
