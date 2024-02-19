resource "kubernetes_service_account" "labeler_sa" {
  metadata {
    name      = "labeler-sa"
    namespace = var.deployment_namespace
  }
}

resource "kubernetes_role" "role" {
  metadata {
    name      = "labeler-role"
    namespace = var.deployment_namespace
  }

  rule {
    api_groups = [""]
    resources  = ["pods"]
    verbs      = ["get", "list", "patch"]
  }

  rule {
    api_groups = [""]
    resources  = ["services"]
    verbs      = ["get", "list"]
  }

  # Read redis secret
  rule {
    api_groups = [""]
    resources  = ["secrets"]
    verbs      = ["get"]
  }
}

resource "kubernetes_role_binding" "labeler_role_binding" {
  metadata {
    name      = "labeler-role-binding"
    namespace = var.deployment_namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.role.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.labeler_sa.metadata[0].name
    namespace = var.deployment_namespace
  }
}

resource "kubernetes_deployment" "labeler" {
  count = 1
  metadata {
    name      = "labeler"
    namespace = var.deployment_namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        "app.kubernetes.io/name" : "labeler"
      }
    }

    template {
      metadata {
        labels = {
          "app.kubernetes.io/name" : "labeler"
        }
      }

      spec {
        service_account_name = kubernetes_service_account.labeler_sa.metadata[0].name

        node_selector = {
          "cloud.google.com/gke-nodepool" : "default-pool"
        }

        container {
          name              = "labeler"
          image             = var.labeler_image
          args = [
            "./redis-labeler.py",
            "--namespace",
            var.deployment_namespace,
            "--pod-selector",
            "app.kubernetes.io/instance=${var.deployment_name}",
            "--redis-cluster-name",
            "mymaster",
            "--redis-headless-svc-name",
            var.headless_name,
            "--redis-sentinel_port",
            var.sentinel_port,
            "--redis-password-name",
            "REDIS_MASTER_PASSWORD",
            "--cluster-domain",
            "cluster.local",
            "--company-domain",
            "cloud.falkordb.io",
            "--incluster-config",
            "--verbose",
            "--update-period",
            "${var.label_update_frequency}",
          ]
          env {
            name = "REDIS_MASTER_PASSWORD"
            value_from {
              secret_key_ref {
                name = "falkordb-redis"
                key  = "redis-password"
              }
            }
          }

          liveness_probe {
            exec {
              command = ["/bin/sh", "-c", "ps", "uaxw", "|", "egrep", "python", "|", "grep", "-v", "grep"]
            }
          }
          readiness_probe {
            exec {
              command = ["/bin/sh", "-c", "ps", "uaxw", "|", "egrep", "python", "|", "grep", "-v", "grep"]
            }
          }
        }
      }

    }
  }
}
