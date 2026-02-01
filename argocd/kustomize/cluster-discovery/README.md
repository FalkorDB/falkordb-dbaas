# Cluster Discovery Service

Kubernetes manifests for the cluster-discovery service using Kustomize.

## Overview

The cluster-discovery service automatically discovers Kubernetes clusters across GCP, AWS, and BYOA (Bring Your Own Account) environments, registers them with ArgoCD, and manages observability node pools.

## Structure

```
cluster-discovery/
├── base/                           # Base manifests
│   ├── deployment.yaml            # Base deployment configuration
│   ├── service.yaml               # Service definition
│   ├── ingress.yaml               # Ingress for webhook endpoint
│   └── kustomization.yaml         # Base kustomization
└── overlays/
    ├── dev/                       # Development environment
    │   └── kustomization.yaml     # Dev-specific patches
    └── prod/                      # Production environment
        └── kustomization.yaml     # Prod-specific patches
```

## Features

- **Multi-cloud discovery**: Automatically discovers clusters in GCP, AWS, and BYOA environments
- **ArgoCD integration**: Registers/deregisters clusters with ArgoCD
- **Node pool management**: Creates and deletes observability node pools
- **Webhook endpoint**: `/omnistrate/cell-delete-started` for handling cell deletion events
- **Public ingress**: Exposes webhook endpoint at `https://api.{env}.falkordb.cloud/omnistrate/cell-delete-started`
- **Health checks**: `/health` and `/ready` endpoints

## Configuration

The service requires a secret named `cluster-discovery-env` with the following variables:

### Required Environment Variables

```bash
# Service Configuration
SERVICE_NAME=cluster-discovery
NODE_ENV=production
PORT=3000
SCAN_INTERVAL_MS=120000

# GCP Configuration
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT=your-app-plane-project-id

# AWS Configuration
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/YourRole
AWS_TARGET_AUDIENCE=your-target-audience

# Bastion Configuration
BASTION_CLUSTER_NAME=your-bastion-cluster
BASTION_CLUSTER_REGION=us-east-1
BASTION_NAMESPACE=bootstrap

# Omnistrate Configuration
OMNISTRATE_USER=your-omnistrate-user@example.com
OMNISTRATE_PASSWORD=your-omnistrate-password
OMNISTRATE_SERVICE_ID=s-xxxxxxxxx
OMNISTRATE_ENVIRONMENT_ID=se-xxxxxxxxx
OMNISTRATE_BYOC_PRODUCT_TIER_ID=pt-xxxxxxxxx
OMNISTRATE_WEBHOOK_TOKEN=your-secure-webhook-token

# PagerDuty Configuration
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-key
```

## Deployment

### Development

The dev overlay uses:
- Image: `us-central1-docker.pkg.dev/ctrl-plane-dev-f7a2434f/backend/cluster-discovery:latest`
- ImagePullPolicy: `Always`
- Namespace: `argocd`
- Ingress: `https://api.dev.falkordb.cloud/omnistrate/cell-delete-started`

### Production

The prod overlay uses:
- Image: `us-central1-docker.pkg.dev/ctrl-plane-prod-b1b92df2/backend/cluster-discovery:1.0.0`
- ImagePullPolicy: `IfNotPresent`
- Namespace: `argocd`
- Ingress: `https://api.falkordb.cloud/omnistrate/cell-delete-started`

## ArgoCD Application

The service is deployed via ArgoCD Applications:
- Dev: `argocd/ctrl_plane/dev/cluster-discovery.yaml`
- Prod: `argocd/ctrl_plane/prod/cluster-discovery.yaml`

## Resource Requirements

- **Requests**: 100m CPU, 256Mi memory
- **Limits**: 500m CPU, 512Mi memory
- **Replicas**: 1
- **Node Selector**: `node_pool: observability-resources`

## Service Account

Uses the `argocd-server` service account for cluster access.

## Testing Locally

```bash
# Verify dev overlay
kubectl kustomize overlays/dev

# Verify prod overlay
kubectl kustomize overlays/prod

# Test webhook endpoint (replace with actual token)
curl -X POST https://api.dev.falkordb.cloud/omnistrate/cell-delete-started \
  -H "Authorization: Bearer YOUR_WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payload": {"deploymentCellId": "test-cell-id"}}'
```
