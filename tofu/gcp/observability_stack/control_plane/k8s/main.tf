data "google_client_config" "default" {}

data "google_project" "this" {
  project_id = var.project_id
}

provider "kubernetes" {
  host                   = "https://${var.cluster_endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(var.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "gcloud"
    args = [
      "container",
      "clusters",
      "get-credentials",
      var.cluster_name,
      "--region",
      var.region,
      "--project",
      var.project_id,
    ]
  }
}

provider "helm" {
  kubernetes {
    host                   = "https://${var.cluster_endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(var.cluster_ca_certificate)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gcloud"
      args = [
        "container",
        "clusters",
        "get-credentials",
        var.cluster_name,
        "--region",
        var.region,
        "--project",
        var.project_id,
      ]
    }
  }
}

provider "github" {
  owner = var.github_organization
}

resource "github_repository" "this" {
  name                 = var.github_repository
  visibility           = "public"
  auto_init            = true
  vulnerability_alerts = true
}

resource "tls_private_key" "flux" {
  algorithm   = "ECDSA"
  ecdsa_curve = "P256"
}

resource "github_repository_deploy_key" "this" {
  title      = "Flux"
  repository = github_repository.this.name
  key        = tls_private_key.flux.public_key_openssh
  read_only  = "false"
}

resource "helm_release" "argocd" {
  name = "argocd"

  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true
  version          = "7.7.15"

  values = var.environment == "development" ? [file("./values/argocd-dev.yaml")] : [file("./values/argocd-prod.yaml")]
}

resource "kubernetes_namespace" "observability" {
  metadata {
    name = "observability"
  }
}

resource "kubernetes_manifest" "victoriametrics_service_attachment" {
  manifest = {
    "apiVersion" = "networking.gke.io/v1beta1"
    "kind"       = "ServiceAttachment"
    "metadata" = {
      "name"      = "victoriametrics"
      "namespace" = "observability"
    }
    "spec" = {
      "connectionPreference" = "ACCEPT_AUTOMATIC"
      "natSubnets"           = ["observability-stack-service-attachment"]
      "proxyProtocol"        = false
      "resourceRef" = {
        "kind" = "Service"
        "name" = "vmsingle-vm-additional-service"
      }
    }
  }

}
