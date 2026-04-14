# Resources split into focused files:
#   providers.tf        — required_providers, data sources, kubernetes + helm providers
#   argocd.tf           — ArgoCD namespace, secrets, Helm release
#   observability.tf    — observability namespace, Grafana credentials
#   workload-identity.tf — api namespace, KSAs, GKE Workload Identity bindings
