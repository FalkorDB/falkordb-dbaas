# Resources split into focused files:
#   project.tf      — GCP project creation (project-factory)
#   networking.tf   — VPC and subnets
#   provisioning.tf — Cloud Build tenant-provisioning SA and Pub/Sub
#   iam.tf          — backend-sa, github-action-sa, db-exporter-sa, argocd-sa
#   storage.tf      — RDB exports GCS bucket, MONGODB_URI secret
