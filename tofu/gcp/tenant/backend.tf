terraform {
  backend "gcs" {}
}

data "terraform_remote_state" "tenant_group" {
  backend = "gcs"
  config = {
    bucket = var.state_bucket_name
    prefix = "tenant`${var.tenant_name}"
  }
}
