# Resources split into focused files:
#   providers.tf  — required_providers, provider "google"
#   vpc.tf        — VPC, Cloud Router, NAT
#   gke.tf        — GKE cluster, node pools, backup plan
#   addresses.tf  — static external IP addresses
#   registry.tf   — Artifact Registry repos and pull permissions
#   iam.tf        — service accounts and Workload Identity bindings
#   workflows.tf  — Google Workflows alert automation
