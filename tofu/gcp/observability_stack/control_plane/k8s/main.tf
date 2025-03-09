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

resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
    labels = {
      name = "argocd"
    }
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
    "admin.password"          = bcrypt(var.argocd_admin_password)
    "admin.passwordMtime"     = timestamp()
    "server.secretkey"        = random_id.argocd.hex
    "dex.google.clientId"     = var.dex_google_client_id
    "dex.google.clientSecret" = var.dex_google_client_secret
    "dex.google.adminEmail"   = var.dex_google_admin_email
  }

  lifecycle {
    ignore_changes = [data]
  }

  depends_on = [kubernetes_namespace.argocd]
}

resource "kubernetes_secret" "argocd-google-groups" {
  metadata {
    name      = "argocd-google-groups"
    namespace = kubernetes_namespace.argocd.metadata.0.name
  }

  data = {
    "googleAuth.json" = base64decode(var.argocd_groups_sa_json)
  }

  depends_on = [kubernetes_namespace.argocd]
}

resource "helm_release" "argocd" {
  name = "argocd"

  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "7.7.15"

  skip_crds = false

  values = var.environment == "development" ? [file("./values/dev/argocd.yaml")] : [file("./values/prod/argocd.yaml")]

  depends_on = [kubernetes_secret.argocd-secret]
}

resource "kubernetes_namespace" "observability" {
  metadata {
    name = "observability"
  }
}

resource "kubernetes_secret" "grafana-google-credentials" {
  metadata {
    name      = "grafana-google-credentials"
    namespace = kubernetes_namespace.observability.metadata.0.name
  }

  data = {
    "client-id"     = var.grafana_google_client_id
    "client-secret" = var.grafana_google_client_secret
  }
}


resource "kubernetes_secret" "google-cloud-logging-credentials" {
  metadata {
    name      = "google-cloud-logging-credentials"
    namespace = kubernetes_namespace.observability.metadata.0.name
  }

  data = {
    "GOOGLE_CLIENT_EMAIL" : var.app_plane_logging_read_sa_email,
    "GOOGLE_PRIVATE_KEY" : base64decode(var.app_plane_logging_read_sa_key),
    "GOOGLE_PROJECT_ID" : var.app_plane_project_id,
  }
}
