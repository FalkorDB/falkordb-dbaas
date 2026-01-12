# Customer LDAP API Service - Kustomize Deployment

This directory contains Kubernetes manifests for deploying the customer-ldap-api service using Kustomize.

## Overview

The customer-ldap-api service is deployed to the **Control Plane** cluster in the `api` namespace. It provides REST API endpoints for managing LDAP users across FalkorDB instances deployed on multiple application plane clusters (GKE/EKS).

## Structure

```
customer-ldap/
├── base/                    # Base manifests (environment-agnostic)
│   ├── deployment.yaml     # Deployment (customer-ldap-api), ServiceAccount, RBAC
│   ├── service.yaml        # Service definition
│   ├── configmap.yaml      # Configuration
│   ├── secret.yaml         # Secret template (StringSecret)
│   ├── servicemonitor.yaml # Prometheus monitoring
│   └── kustomization.yaml  # Base kustomization
├── overlays/
│   ├── dev/                # Development environment
│   │   ├── kustomization.yaml
│   │   └── sealed-secret.yaml
│   └── prod/               # Production environment
│       ├── kustomization.yaml
│       ├── sealed-secret.yaml
│       ├── hpa.yaml        # Horizontal Pod Autoscaler
│       └── pdb.yaml        # Pod Disruption Budget
└── README.md
```

## Deployment Location

- **Cluster**: Control Plane
- **Namespace**: `api`
- **Service Name**: `customer-ldap-api`

## Prerequisites

1. **Kubernetes Cluster** with:
   - `sealed-secrets-controller` (for secret management)
   - `kubernetes-secret-generator` (for JWT secret generation)
   - `prometheus-operator` (optional, for monitoring)

2. **Tools**:
   - `kubectl`
   - `kustomize` (or `kubectl` with kustomize support)
   - `kubeseal` (for creating sealed secrets)

## Configuration

### Environment Variables

The service requires the following environment variables:

#### Required (via Secret):
- `OMNISTRATE_EMAIL` - Omnistrate API email
- `OMNISTRATE_PASSWORD` - Omnistrate API password
- `OMNISTRATE_SERVICE_ID` - Omnistrate service identifier
- `OMNISTRATE_ENVIRONMENT_ID` - Omnistrate environment identifier
- `JWT_SECRET` - Secret for signing JWT session tokens (auto-generated or provided)

#### Optional (via Secret):
- `APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT` - GCP project ID for GKE clusters
- `AWS_TARGET_AUDIENCE` - AWS IAM OIDC audience for EKS access
- `AWS_ROLE_ARN` - AWS IAM role ARN for EKS access

#### ConfigMap:
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `CORS_ORIGIN` - CORS allowed origins
- `REQUEST_TIMEOUT` - Request timeout in milliseconds

## Deployment

### Development Environment

1. **Create sealed secrets**:

```bash
# Navigate to the dev overlay directory
cd argocd/kustomize/customer-ldap/overlays/dev

# Create the secret (replace with actual values)
kubectl create secret generic customer-ldap-api-env \
  --from-literal=OMNISTRATE_EMAIL='your-email@example.com' \
  --from-literal=OMNISTRATE_PASSWORD='your-password' \
  --from-literal=OMNISTRATE_SERVICE_ID='your-service-id' \
  --from-literal=OMNISTRATE_ENVIRONMENT_ID='your-env-id' \
  --from-literal=JWT_SECRET='your-random-32-char-jwt-secret' \
  --from-literal=APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT='your-gcp-project' \
  --from-literal=AWS_TARGET_AUDIENCE='your-aws-audience' \
  --from-literal=AWS_ROLE_ARN='arn:aws:iam::123456789:role/YourRole' \
  --namespace=api \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets --controller-namespace=kube-system \
  -o yaml > sealed-secret.yaml
```

2. **Deploy using kustomize**:

```bash
# Apply directly
kubectl apply -k argocd/kustomize/customer-ldap/overlays/dev

# Or build and review first
kubectl kustomize argocd/kustomize/customer-ldap/overlays/dev
```

3. **Deploy via ArgoCD** (recommended):

```bash
kubectl apply -f argocd/ctrl_plane/dev/customer-ldap-api.yaml
```

### Production Environment

1. **Create sealed secrets** (same as dev, but in prod overlay):

```bash
cd argocd/kustomize/customer-ldap/overlays/prod

# Create production secrets
kubectl create secret generic customer-ldap-api-env \
  --from-literal=OMNISTRATE_EMAIL='prod-email@example.com' \
  --from-literal=OMNISTRATE_PASSWORD='prod-password' \
  --from-literal=OMNISTRATE_SERVICE_ID='prod-service-id' \
  --from-literal=OMNISTRATE_ENVIRONMENT_ID='prod-env-id' \
  --from-literal=JWT_SECRET='prod-random-32-char-jwt-secret' \
  --from-literal=APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT='prod-gcp-project' \
  --from-literal=AWS_TARGET_AUDIENCE='prod-aws-audience' \
  --from-literal=AWS_ROLE_ARN='arn:aws:iam::987654321:role/ProdRole' \
  --namespace=api \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets --controller-namespace=kube-system \
  -o yaml > sealed-secret.yaml
```

2. **Deploy via ArgoCD**:

```bash
kubectl apply -f argocd/ctrl_plane/prod/customer-ldap-api.yaml
```

## RBAC Permissions

The service requires cluster-level permissions to:
- Access GKE/EKS cluster information
- Read pods and secrets in the `ldap-auth` namespace
- Create port-forwards to ldap-auth pods

These permissions are configured in the `ClusterRole` and `ClusterRoleBinding` in `deployment.yaml`.

## Monitoring

The service exposes Prometheus metrics at `/metrics` endpoint. A `ServiceMonitor` is created automatically (disabled in dev by default).

## Health Checks

- **Liveness**: `GET /v1/health` (checks if service is running)
- **Readiness**: `GET /v1/health` (checks if service can handle requests)

## Scaling

### Development
- Fixed 1 replica

### Production
- Minimum 3 replicas
- Horizontal Pod Autoscaler (HPA) scales 3-10 replicas based on:
  - CPU utilization (target 70%)
  - Memory utilization (target 80%)
- Pod Disruption Budget (PDB) ensures minimum 2 replicas available during disruptions

## Troubleshooting

### View logs
```bash
kubectl logs -n api -l app=customer-ldap-api --tail=100 -f
```

### Check pod status
```bash
kubectl get pods -n api -l app=customer-ldap-api
kubectl describe pod -n api <pod-name>
```

### Test service endpoint
```bash
kubectl port-forward -n api svc/customer-ldap-api 8080:80
curl http://localhost:8080/v1/health
```

### Check secrets
```bash
kubectl get secrets -n api
kubectl describe secret customer-ldap-api-env -n api
```

## Security Considerations

1. **Secrets**: Always use sealed-secrets in production
2. **RBAC**: Service account has minimal required permissions
3. **Network**: Service is ClusterIP only (internal access)
4. **Container Security**: 
   - Runs as non-root user (UID 1001)
   - Read-only root filesystem
   - No privilege escalation
   - All capabilities dropped

## API Documentation

Once deployed, access the Swagger UI at:
```
http://customer-ldap-api.api.svc.cluster.local/documentation
```

Or port-forward:
```bash
kubectl port-forward -n api svc/customer-ldap-api 8080:80
open http://localhost:8080/documentation
```
