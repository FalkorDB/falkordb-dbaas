
locals {
  backup_write_sa_name = "${var.tenant_name}-backup-write-sa"

  backup_volume_size = "${ceil(regex("^[0-9]+", var.persistence_size) * (1 + var.backup_volume_size_overhead_pctg))}Gi"
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

resource "kubernetes_persistent_volume_claim" "backup_volume" {
  metadata {
    name      = "backup-volume"
    namespace = var.deployment_namespace
  }
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class_name
    resources {
      requests = {
        storage = local.backup_volume_size
      }
    }
  }

  wait_until_bound = false
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

# TODO: Choose pod according to zone
POD_NAME="${var.deployment_name}-node-0"

# Check if the BGSAVE is in progress
IS_IN_BACKUP=$(kubectl exec $POD_NAME -c ${var.container_name} -n ${var.deployment_namespace} -- redis-cli --no-auth-warning -p ${var.port} -a '${var.falkordb_password}' INFO PERSISTENCE | grep rdb_bgsave_in_progress | awk -F: '{print $2}')
if ["$IS_IN_BACKUP" != "0"]; then
  echo "BGSAVE is in progress, skipping backup"
  exit 0
fi

# Execute BGSAVE
kubectl exec $POD_NAME -c ${var.container_name} -n ${var.deployment_namespace} -- redis-cli --no-auth-warning -p ${var.port} -a '${var.falkordb_password}' BGSAVE

# Wait until the BGSAVE is done
IS_IN_BACKUP=$(kubectl exec $POD_NAME -c ${var.container_name} -n ${var.deployment_namespace} -- redis-cli --no-auth-warning -p ${var.port} -a '${var.falkordb_password}' INFO PERSISTENCE | grep rdb_bgsave_in_progress | awk -F: '{print $2}')
while ["$IS_IN_BACKUP" != "0"]; do
  echo "Backup not done yet, sleeping..."
  sleep 5
done

# Copy the dump.rdb to the pod
kubectl cp $POD_NAME:/data/dump.rdb /data/dump.rdb -c ${var.container_name} --namespace ${var.deployment_namespace}

# Copy the dump.rdb to the bucket
gsutil cp /data/dump.rdb ${var.backup_location}/dump_$(date +%Y-%m-%d-%H-%M-%S).rdb
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
          metadata {
            labels = {
              "app.kubernetes.io/instance" = "falkordb-backup"
            }
          }
          spec {
            service_account_name = kubernetes_service_account.backup_write_sa.metadata.0.name
            node_selector = {
              "iam.gke.io/gke-metadata-server-enabled" : "true"
              "cloud.google.com/gke-nodepool" : var.node_pool_name
            }
            container {
              name    = "backup"
              image   = "falkordb/gcloud-kubectl-falkordb:latest"
              command = ["/scripts/backup.sh"]
              volume_mount {
                name       = kubernetes_config_map.backup_script.metadata.0.name
                mount_path = "/scripts"
              }
              volume_mount {
                name       = kubernetes_persistent_volume_claim.backup_volume.metadata.0.name
                mount_path = "/data"
              }

            }
            volume {
              name = kubernetes_config_map.backup_script.metadata.0.name
              config_map {
                name         = kubernetes_config_map.backup_script.metadata.0.name
                default_mode = "0774"
              }
            }
            volume {
              name = kubernetes_persistent_volume_claim.backup_volume.metadata.0.name
              persistent_volume_claim {
                claim_name = kubernetes_persistent_volume_claim.backup_volume.metadata.0.name
              }
            }
          }
        }
      }
    }
  }
}
