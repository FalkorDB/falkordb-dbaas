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
  source = "./monitoring"

  project_id   = var.project_id
  cluster_name = var.cluster_name
  region       = var.region
}

module "cluster_backup" {
  source = "./backup"

  project_id              = var.project_id
  region                  = var.region
  backup_bucket_name      = var.backup_bucket_name
  velero_gcp_sa_email     = var.velero_gcp_sa_email
  velero_gcp_sa_id        = var.velero_gcp_sa_id
  cluster_backup_schedule = var.cluster_backup_schedule
}

module "cluster_cost_monitoring" {
  source = "./cost-monitoring"

  project_id                    = var.project_id
  cluster_name                  = var.cluster_name
  kubecost_gcp_sa_id            = var.kubecost_gcp_sa_id
  kubecost_gcp_sa_email         = var.kubecost_gcp_sa_email
  kubecost_token                = var.kubecost_token
  bigquery_billing_data_project = var.bigquery_billing_data_project
  bigquery_billing_data_dataset = var.bigquery_billing_data_dataset
  bigquery_billing_data_table   = var.bigquery_billing_data_table
}
