terraform {
  backend "gcs" {
    bucket = var.state_bucket_name
    prefix = "tenant_group/${var.tenant_group_name}"
  }
}
