# Add Workload Identity to the DNS Service account
resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = var.external_dns_sa.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${var.external_dns_namespace}/${var.external_dns_sa.name}]"
}

resource "kubernetes_namespace" "external_dns" {
  metadata {
    name = var.external_dns_namespace
  }
}

resource "kubernetes_service_account" "external_dns_sa" {
  metadata {
    name      = var.external_dns_sa.name
    namespace = kubernetes_namespace.external_dns.metadata.0.name
    labels = {
      "app.kubernetes.io/name" = "external-dns"
    }
  }
}

resource "kubernetes_cluster_role" "dns_role" {
  metadata {
    name = "external-dns"
    labels = {
      "app.kubernetes.io/name" = "external-dns"
    }
  }
  rule {
    api_groups = [""]
    resources  = ["services", "endpoints", "pods", "nodes"]
    verbs      = ["get", "watch", "list"]
  }
  rule {
    api_groups = ["extensions", "networking.k8s.io"]
    resources  = ["ingresses"]
    verbs      = ["get", "list", "watch"]
  }
}

resource "kubernetes_cluster_role_binding" "dns_role_binding" {
  metadata {
    name = "external-dns"
    labels = {
      "app.kubernetes.io/name" = "external-dns"
    }
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.dns_role.metadata.0.name
  }
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.external_dns_sa.metadata.0.name
    namespace = kubernetes_namespace.external_dns.metadata.0.name
  }
}

resource "kubernetes_deployment" "external_dns" {
  metadata {
    name      = "external-dns"
    namespace = kubernetes_namespace.external_dns.metadata.0.name
    labels = {
      "app.kubernetes.io/name" = "external-dns"
    }
  }
  spec {
    strategy {
      type = "Recreate"
    }
    selector {
      match_labels = {
        "app.kubernetes.io/name" = "external-dns"
      }
    }
    template {
      metadata {
        labels = {
          "app.kubernetes.io/name" = "external-dns"
        }
      }
      spec {
        service_account_name = kubernetes_service_account.external_dns_sa.metadata.0.name
        container {
          name  = "external-dns"
          image = "registry.k8s.io/external-dns/external-dns:v0.14.0"
          args = [
            "--source=service",
            "--source=ingress",
            "--provider=google",
            "--google-zone-visibility=public",
            "--policy=upsert-only",
            "--registry=txt",
            "--txt-owner-id=${var.project_id}",
            "--interval=30s",
            "--log-format=json"
          ]
        }
      }
    }
  }
}
