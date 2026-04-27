# Observability namespace and credentials for Grafana Google OAuth.
#
# The observability namespace hosts VictoriaMetrics, Grafana, Alertmanager
# and related monitoring workloads deployed by ArgoCD.

resource "kubernetes_namespace" "observability" {
  metadata {
    name = "observability"
  }
}

resource "kubernetes_secret" "grafana-google-credentials" {
  metadata {
    name      = "grafana-google-credentials"
    namespace = kubernetes_namespace.observability.metadata.0.name
  }

  data = {
    "client-id"     = var.grafana_google_client_id
    "client-secret" = var.grafana_google_client_secret
  }
}
