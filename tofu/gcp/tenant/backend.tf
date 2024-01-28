terraform {
  backend "gcs" {
    bucket = var.state_bucket_name
    prefix = "tenant/${var.tenant_name}"
  }
}
