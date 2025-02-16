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

resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

resource "random_id" "argocd" {
  byte_length = 16
}

resource "kubernetes_secret" "argocd-secret" {
  metadata {
    name      = "argocd-secret"
    namespace = kubernetes_namespace.argocd.metadata.0.name
  }

  data = {
    "admin.password"      = base64encode(var.argocd_admin_password)
    "admin.passwordMtime" = base64encode(timestamp())
    "server.secretkey"    = base64encode(random_id.argocd.hex)
    "dex.google.clientId" : base64encode(var.dex_google_client_id)
    "dex.google.clientSecret" : base64encode(var.dex_google_client_secret)
  }

  depends_on = [kubernetes_namespace.argocd]
}

resource "helm_release" "argocd" {
  name = "argocd"

  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "7.7.15"

  values = var.environment == "development" ? [file("./values/dev/argocd.yaml")] : [file("./values/prod/argocd.yaml")]

  depends_on = [kubernetes_secret.argocd-secret]
}

resource "kubernetes_namespace" "observability" {
  metadata {
    name = "observability"
  }
}
