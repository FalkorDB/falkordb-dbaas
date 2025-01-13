terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.45.0"
    }
    github = {
      source  = "integrations/github"
      version = ">= 6.1"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.12"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.27"
    }
    tls = {
      source  = "hashicorp/tls"
      version = ">= 4.0"
    }
    argocd = {
      source = "argoproj-labs/argocd"
      version = "7.3.0"
    }
  }
}
