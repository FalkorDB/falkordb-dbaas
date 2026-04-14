terraform {

  # backend "local" {
  #   path = "bootstrap.tfstate"
  # }

  backend "gcs" {
  }

}
