# Observability Stack - Control Plane

Defines a GKE cluster that will centralize observability on all customer deployments.

The control plane for the observability stack is composed of the following components:

- GKE Cluster
  - ArgoCD: Sync all observability components in all clusters
  - VictoriaMetrics: Store and query metrics across all clusters
  - Grafana: Visualize metrics
  - Grafana Ingress: Expose Grafana to the internet
  - VMAuth Ingress: Proxy VictoriaMetrics requests
