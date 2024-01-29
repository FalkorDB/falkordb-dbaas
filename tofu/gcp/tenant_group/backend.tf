terraform {
  backend "gcs" { }
}

# data "terraform_remote_state" "tenant_group" {
#   backend = "gcs"
#   config = {
#     bucket = var.state_bucket_name
#     prefix = "tenant_group/${var.tenant_group_name}"
#   }
# }
