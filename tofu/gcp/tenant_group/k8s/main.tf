
data "google_client_config" "default" {}

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
  debug = true

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

locals {
  service_account_email = reverse(split("/", var.tenant_provision_sa))[0]
  service_account_name  = split("@", local.service_account_email)[0]
}

resource "kubernetes_cluster_role" "tenant_provision_sa_role" {
  metadata {
    name = "provisioner-sa-role"
  }

  rule {
    api_groups = ["*"]
    resources  = ["*"]
    verbs      = ["*"]
  }
}

resource "kubernetes_service_account" "tenant_provision_sa" {
  metadata {
    name = local.service_account_name
    annotations = {
      "iam.gke.io/gcp-service-account" = local.service_account_email
    }
  }
}

resource "kubernetes_cluster_role_binding" "tenant_provision_sa_role_binding" {
  metadata {
    name = "provisioner-sa-role-binding"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.tenant_provision_sa_role.metadata[0].name
  }

  subject {
    kind = "ServiceAccount"
    name = kubernetes_service_account.tenant_provision_sa.metadata[0].name
  }
}

module "falkordb_monitoring" {
  source = "./resources/monitoring"

  project_id   = var.project_id
  cluster_name = var.cluster_name
  region       = var.region
}

module "cluster_backup" {
  source = "./resources/backup"

  project_id              = var.project_id
  region                  = var.region
  cluster_name            = var.cluster_name
  backup_bucket_name      = var.backup_bucket_name
  velero_gcp_sa_email     = var.velero_gcp_sa_email
  velero_gcp_sa_id        = var.velero_gcp_sa_id
  cluster_backup_schedule = var.cluster_backup_schedule
}
