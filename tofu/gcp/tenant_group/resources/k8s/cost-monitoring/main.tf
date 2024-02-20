resource "kubernetes_namespace" "kubecost" {
  metadata {
    name = "kubecost"
  }
}

resource "kubernetes_service_account" "kubecost" {
  metadata {
    namespace = kubernetes_namespace.kubecost.metadata.0.name
    name      = "kubecost-cost-analyzer"

    annotations = {
      "iam.gke.io/gcp-service-account" = var.kubecost_gcp_sa_email
    }
  }
}

# Bind SA with GCP SA thorugh workload identity
resource "google_service_account_iam_member" "kubecost" {
  service_account_id = var.kubecost_gcp_sa_id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${kubernetes_namespace.kubecost.metadata.0.name}/${kubernetes_service_account.kubecost.metadata.0.name}]"
}


resource "helm_release" "kubecost" {
  name      = "kubecost"
  namespace = kubernetes_namespace.kubecost.metadata.0.name

  repository = "https://kubecost.github.io/cost-analyzer/"
  chart      = "cost-analyzer"
  skip_crds  = false

  timeout = 600

  set {
    name  = "kubecostToken"
    value = var.kubecost_token
  }
  set {
    name  = "serviceAccount.create"
    value = false
  }
  set {
    name  = "serviceAccount.name"
    value = kubernetes_service_account.kubecost.metadata.0.name
  }
  set {
    name  = "prometheus.server.global.external_labels.cluster_id"
    value = var.cluster_name
  }
  set {
    name  = "kubecostProductConfigs.clusterName"
    value = var.cluster_name
  }
  set {
    name  = "kubecostProductConfigs.projectID"
    value = var.project_id
  }
  set {
    name  = "kubecostProductConfigs.bigQueryBillingDataDataset"
    value = var.bigquery_billing_data_dataset
  }
  set {
    name  = "kubecostProductConfigs.bigQueryBillingDataTable"
    value = var.bigquery_billing_data_table
  }
  set {
    name  = "kubecostProductConfigs.bigQueryBillingDataProject"
    value = var.bigquery_billing_data_project
  }
  set {
    name  = "kubecostModel.containerStatsEnabled"
    value = "true"
  }
  set {
    name  = "kubecostModel.cloudCosts.enabled"
    value = "true"
  }
  set {
    name  = "kubecostModel.etlCloudAsset"
    value = "false"
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
  set {
    name  = "grafana.nodeSelector.cloud\\.google\\.com/gke-nodepool"
    value = "default-pool"
  }
  set {
    name  = "kubecostMetrics.nodeSelector.cloud\\.google\\.com/gke-nodepool"
    value = "default-pool"
  }
  set {
    name  = "prometheus.server.nodeSelector.cloud\\.google\\.com/gke-nodepool"
    value = "default-pool"
  }
  set {
    name  = "forecasting.nodeSelector.cloud\\.google\\.com/gke-nodepool"
    value = "default-pool"
  }
}
