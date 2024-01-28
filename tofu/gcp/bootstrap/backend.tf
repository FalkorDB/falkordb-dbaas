terraform {

  backend "local" {
    path = "terraform.tfstate"
  }

  # backend "gcs" {
  #   bucket = var.state_bucket_name
  #   prefix = "bootstrap"
  # }
  
}
