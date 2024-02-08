
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

resource "kubernetes_config_map" "backup_script" {
  metadata {
    name      = "backup-script"
    namespace = var.deployment_namespace
  }
  data = {
    "backup.sh" = <<EOF
#!/bin/bash

# Check if the BGSAVE is in progress
if [ "$(kubectl exec ${var.deployment_name}-node-0 -n ${var.deployment_namespace} -- redis-cli -a '${var.falkordb_password}' INFO PERSISTENCE | grep rdb_bgsave_in_progress | awk -F: '{print $2}')" != "0" ]; then
  echo "BGSAVE is in progress, skipping backup"
  exit 0
fi

# Execute BGSAVE
kubectl exec ${var.deployment_name}-node-0 -n ${var.deployment_namespace} -- redis-cli -a '${var.falkordb_password}' BGSAVE

# Wait until the BGSAVE is done
while [ "$(kubectl exec ${var.deployment_name}-node-0 -n ${var.deployment_namespace} -- redis-cli -a '${var.falkordb_password}' INFO PERSISTENCE | grep rdb_bgsave_in_progress | awk -F: '{print $2}')" != "0" ]; do
  sleep 1
done

# Copy the dump.rdb to the pod
kubectl cp ${var.deployment_name}-node-0:/data/dump.rdb dump.rdb -c redis --namespace ${var.deployment_namespace}

# Copy the dump.rdb to the bucket
gsutil cp dump.rdb ${var.backup_location}/dump_$(date +%Y-%m-%d-%H-%M-%S).rdb
EOF
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
              name    = "backup"
              image   = "dudizimber/gcloud-kubectl-redis:latest"
              command = ["/scripts/backup.sh"]
              volume_mount {
                name       = kubernetes_config_map.backup_script.metadata.0.name
                mount_path = "/scripts"
              }

            }
            volume {
              name = kubernetes_config_map.backup_script.metadata.0.name
              config_map {
                name         = kubernetes_config_map.backup_script.metadata.0.name
                default_mode = 0774
              }
            }
          }
        }
      }
    }
  }
}
