terraform {
  backend "gcs" {
    bucket = var.state_bucket_name
    prefix = "org"
  }
}
