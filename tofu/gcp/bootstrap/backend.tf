terraform {

  backend "local" {
    path = "bootstrap.tfstate"
  }

  # backend "gcs" {
  #   bucket = var.state_bucket_name
  #   prefix = "bootstrap"
  # }
  
}

# data "terraform_remote_state" "gcs_state" {
#   backend = "gcs"
#   config = {
#     bucket = var.state_bucket_name
#     prefix = "bootstrap"
#   }
# }