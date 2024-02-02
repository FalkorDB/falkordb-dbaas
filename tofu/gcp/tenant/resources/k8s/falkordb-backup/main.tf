
locals {
  backup_write_sa_name = "${var.tenant_name}-backup-write-sa"
}

resource "kubernetes_service_account" "backup_write_sa" {
  metadata {
    name      = local.backup_write_sa_name
    namespace = var.deployment_namespace

    annotations = {
      "iam.gke.io/gcp-service-account" = "${local.backup_write_sa_name}@${var.project_id}.iam.gserviceaccount.com"
    }
  }
}

resource "kubernetes_role" "falkordb_role" {
  metadata {
    name      = "falkordb-role"
    namespace = var.deployment_namespace
  }

  rule {
    api_groups = [""]
    resources  = ["pods"]
    verbs      = ["get", "watch", "list"]
  }
  rule {
    api_groups = [""]
    resources  = ["pods/exec"]
    verbs      = ["create"]
  }
}

resource "kubernetes_role_binding" "falkordb_role_binding" {
  metadata {
    name      = "falkordb-role-binding"
    namespace = var.deployment_namespace
  }
  role_ref {
    name      = kubernetes_role.falkordb_role.metadata.0.name
    kind      = "Role"
    api_group = "rbac.authorization.k8s.io"
  }
  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.backup_write_sa.metadata.0.name
    namespace = var.deployment_namespace
  }
}

resource "kubernetes_cron_job_v1" "falkorbd_backup" {
  metadata {
    name      = "falkordb-backup"
    namespace = var.deployment_namespace
  }
  spec {
    concurrency_policy = "Replace"
    schedule           = var.backup_schedule
    job_template {
      metadata {}
      spec {
        backoff_limit              = 2
        ttl_seconds_after_finished = 60
        template {
          metadata {}
          spec {
            service_account_name = kubernetes_service_account.backup_write_sa.metadata.0.name
            node_selector = {
              "iam.gke.io/gke-metadata-server-enabled" : "true"
            }
            container {
              name  = "backup"
              image = "dudizimber/gcloud-kubectl-redis:latest"
              command = [
                "/bin/bash",
                "-c",
                "kubectl exec falkordb-redis-node-0 -n ${var.deployment_namespace} -- redis-cli -a '${var.falkordb_password}' BGSAVE && kubectl cp falkordb-redis-node-0:/data/dump.rdb dump.rdb -c redis --namespace ${var.deployment_namespace} && gsutil cp dump.rdb gs://${var.backup_bucket_name}/${var.tenant_name}/dump_$(date +%Y-%m-%d-%H-%M-%S).rdb"
              ]

            }
          }
        }
      }
    }
  }
}
