locals {
  storage_location_name = "default"
}

resource "kubernetes_namespace" "velero" {
  metadata {
    name = "velero"
  }
}

resource "kubernetes_service_account" "velero" {
  metadata {
    namespace = kubernetes_namespace.velero.metadata.0.name
    name      = "velero"

    annotations = {
      "iam.gke.io/gcp-service-account" = var.velero_gcp_sa_email
    }
  }
}

# Bind SA with GCP SA thorugh workload identity
resource "google_service_account_iam_member" "velero" {
  service_account_id = var.velero_gcp_sa_id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.velero.metadata.0.name}/${kubernetes_service_account.velero.metadata.0.name}]"
}


resource "helm_release" "velero" {
  name      = "velero"
  namespace = kubernetes_namespace.velero.metadata.0.name

  repository = "https://vmware-tanzu.github.io/helm-charts"
  chart      = "velero"
  skip_crds  = false

  timeout = 600

  set {
    name  = "initContainers[0].name"
    value = "velero-plugin-for-gcp"
  }
  set {
    name  = "initContainers[0].image"
    value = "velero/velero-plugin-for-gcp:v1.9.0"
  }
  set {
    name  = "initContainers[0].volumeMounts[0].mountPath"
    value = "/target"
  }
  set {
    name  = "initContainers[0].volumeMounts[0].name"
    value = "plugins"
  }
  set {
    name  = "metrics.serviceMonitor.enabled"
    value = true
  }
  set {
    name  = "configuration.deployRestic"
    value = "true"
  }
  set {
    name  = "configuration.defaultVolumesToRestic"
    value = "true"
  }
  set {
    name  = "configuration.backupStorageLocation[0].name"
    value = local.storage_location_name
  }
  set {
    name  = "configuration.backupStorageLocation[0].provider"
    value = "gcp"
  }
  set {
    name  = "configuration.backupStorageLocation[0].bucket"
    value = var.backup_bucket_name
  }
  set {
    name  = "configuration.backupStorageLocation[0].prefix"
    value = "velero"
  }
  set {
    name  = "configuration.backupStorageLocation[0].config.serviceAccount"
    value = var.velero_gcp_sa_email
  }
  set {
    name  = "configuration.volumeSnapshotLocation[0].name"
    value = local.storage_location_name
  }
  set {
    name  = "configuration.volumeSnapshotLocation[0].provider"
    value = "gcp"
  }
  set {
    name  = "configuration.volumeSnapshotLocation[0].config.project"
    value = var.project_id
  }
  set {
    name  = "configuration.volumeSnapshotLocation[0].config.snapshotLocation"
    value = var.region
  }
  set {
    name  = "serviceAccount.server.create"
    value = false
  }
  set {
    name  = "serviceAccount.server.name"
    value = kubernetes_service_account.velero.metadata.0.name
  }
  set {
    name  = "serviceAccount.server.annotations.iam\\.gke\\.io/gcp-service-account"
    value = var.velero_gcp_sa_email
  }
  set {
    name  = "credentials.useSecret"
    value = false
  }
  set {
    name  = "nodeSelector.cloud\\.google\\.com/gke-nodepool"
    value = "default-pool"
  }
  set {
    name  = "nodeSelector.iam\\.gke\\.io/gke-metadata-server-enabled"
    value = "true"
    type  = "string"
  }

  # Scheduled backup
  dynamic "set" {
    for_each = var.cluster_backup_schedule != null ? [1] : []
    content {
      name  = "schedules.backup.disabled"
      value = "false"
    }
  }
  dynamic "set" {
    for_each = var.cluster_backup_schedule != null ? [1] : []
    content {
      name  = "schedules.backup.schedule"
      value = var.cluster_backup_schedule
    }
  }
  dynamic "set" {
    for_each = var.cluster_backup_schedule != null ? [1] : []
    content {
      name  = "schedules.backup.template.storageLocation"
      value = local.storage_location_name
    }
  }

}



resource "null_resource" "pod_monitoring" {
  provisioner "local-exec" {
    when    = create
    command = <<EOF
      kubectl apply -f - <<EOF2
apiVersion: monitoring.googleapis.com/v1
kind: PodMonitoring
metadata:
  name: velero
  namespace: ${kubernetes_namespace.velero.metadata.0.name}
  labels:
    app.kubernetes.io/name: velero
    app.kubernetes.io/part-of: google-cloud-managed-prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: velero
      app.kubernetes.io/instance: velero
  endpoints:
  - port: http-monitoring
    interval: 30s
EOF2
    EOF
  }

  depends_on = [helm_release.velero]
}
