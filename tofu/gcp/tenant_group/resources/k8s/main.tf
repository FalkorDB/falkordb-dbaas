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
}


module "external_dns" {
  source = "./external_dns"

  project_id      = var.project_id
  external_dns_sa = var.external_dns_sa
  dns_domain      = var.dns_domain
}
