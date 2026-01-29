# Cluster Discovery Service

A continuous service that discovers, registers, and manages Kubernetes clusters across multiple cloud providers (GCP, AWS, Azure) and BYOA (Bring Your Own Account) environments.

## Overview

The Cluster Discovery Service automatically:
- Discovers clusters from GCP, AWS, and Omnistrate (BYOA)
- Registers discovered clusters with ArgoCD
- Creates observability node pools
- Manages cluster secrets (PagerDuty, VMUser)
- Deregisters stale clusters

## Architecture

### Service Structure

```
src/
├── app.ts                    # Fastify application setup
├── index.ts                  # Server bootstrap
├── scanner.ts                # Discovery scanner entry point
├── constants.ts              # Application constants
├── logger.ts                 # Logger configuration
├── types.ts                  # TypeScript type definitions
├── providers/                # Cloud provider implementations
│   ├── index.ts             # Node pool orchestration
│   ├── aws/                 # AWS provider
│   │   ├── discovery.ts     # AWS cluster discovery
│   │   ├── nodepool.ts      # AWS node pool creation
│   │   ├── client.ts        # AWS SDK clients and credentials
│   │   └── index.ts
│   ├── gcp/                 # GCP provider
│   │   ├── discovery.ts     # GCP cluster discovery
│   │   ├── nodepool.ts      # GCP node pool creation
│   │   ├── client.ts        # GCP SDK clients and credentials
│   │   └── index.ts
│   ├── azure/               # Azure provider
│   │   ├── discovery.ts     # Azure cluster discovery
│   │   └── index.ts
│   ├── omnistrate/          # BYOA discovery
│   │   ├── client.ts        # Omnistrate API client
│   │   └── index.ts
│   └── byoa/                # BYOA credential exchange
│       ├── credentials.ts   # AWS/GCP credential exchange
│       ├── nodepool.ts      # BYOA node pool creation
│       └── index.ts
├── integrations/             # External service integrations
│   ├── argocd.ts            # ArgoCD cluster registration
│   ├── bastion.ts           # Bastion cluster utilities
│   └── index.ts
├── secrets/                  # Secret management
│   ├── pagerduty.ts         # PagerDuty integration key secrets
│   ├── vmuser.ts            # Victoria Metrics user secrets
│   └── index.ts
├── services/                 # Business logic layer
│   ├── ClusterDiscoveryService.ts    # Main orchestration
│   ├── DiscoveryService.ts           # Multi-provider discovery
│   ├── NodePoolService.ts            # Node pool management
│   ├── RegistrationService.ts        # Cluster registration
│   └── SecretManagementService.ts    # Secret lifecycle
├── errors/                   # Custom error hierarchy
│   └── index.ts             # Error classes
├── schemas/                  # Validation schemas
│   └── env.schema.ts        # Environment variable schema (Typebox)
└── utils/                    # Helper utilities
    ├── async.utils.ts       # Async patterns (retry, timeout, parallel)
    ├── cluster.utils.ts     # Cluster helpers
    ├── env.utils.ts         # Environment parsing
    ├── k8s.ts               # Kubernetes client configuration
    └── index.ts
```

### Key Components

#### Services Layer (Business Logic)

- **ClusterDiscoveryService**: Orchestrates the entire discovery and registration workflow
- **DiscoveryService**: Discovers clusters from all providers in parallel
- **RegistrationService**: Manages ArgoCD cluster secret lifecycle
- **NodePoolService**: Creates observability node pools in discovered clusters
- **SecretManagementService**: Manages PagerDuty and VMUser secrets

#### Providers Layer (Cloud-Specific)

Each provider is organized by feature:
- **discovery.ts**: Cluster discovery logic
- **nodepool.ts**: Node pool creation logic
- **client.ts**: SDK clients, credentials, and authentication

**GCP**: Uses Google Cloud Container API for GKE management
**AWS**: Uses AWS EKS API for cluster management
**Azure**: Uses Azure Container Service API
**Omnistrate**: Discovers BYOA clusters via Omnistrate API
**BYOA**: Credential exchange for customer account access

#### Integrations Layer

- **ArgoCD**: Cluster registration and secret management
- **Bastion**: Utilities for accessing bastion cluster pods

#### Secrets Layer

- **PagerDuty**: Creates integration key secrets in target clusters
- **VMUser**: Manages Victoria Metrics authentication secrets

## Configuration

### Environment Variables

#### Service Configuration
- `SERVICE_NAME`: Service name (default: cluster-discovery)
- `NODE_ENV`: Environment (development/production/test)
- `PORT`: HTTP server port (default: 3000)
- `REQUEST_TIMEOUT_MS`: Request timeout in milliseconds (default: 30000)

#### Scanner Configuration
- `SCAN_INTERVAL_MS`: Time between scans in milliseconds (default: 120000 = 2 minutes)

#### Cloud Provider Configuration

**GCP:**
- `GOOGLE_CLOUD_PROJECT`: GCP project ID for control plane
- `APPLICATION_PLANE_GOOGLE_CLOUD_PROJECT`: GCP project ID for application plane

**AWS:**
- `AWS_ROLE_ARN`: IAM role ARN to assume
- `AWS_TARGET_AUDIENCE`: Target audience for token exchange

**Azure:**
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_CLIENT_ID`: Azure client ID
- `AZURE_CLIENT_SECRET`: Azure client secret

#### Bastion Configuration (for BYOA)
- `BASTION_CLUSTER_NAME`: Name of the bastion cluster
- `BASTION_CLUSTER_REGION`: Region of the bastion cluster
- `BASTION_NAMESPACE`: Namespace for bastion pods (default: bootstrap)
- `BASTION_POD_LABEL`: Label selector for bastion pods
- `BASTION_CONTAINER_NAME`: Container name in bastion pods

#### Omnistrate Configuration
- `OMNISTRATE_USER`: Omnistrate API username
- `OMNISTRATE_PASSWORD`: Omnistrate API password
- `OMNISTRATE_SERVICE_ID`: Omnistrate service ID
- `OMNISTRATE_ENVIRONMENT_ID`: Omnistrate environment ID
- `OMNISTRATE_BYOC_PRODUCT_TIER_ID`: BYOC product tier ID

#### Other Configuration
- `PAGERDUTY_INTEGRATION_KEY`: PagerDuty integration key
- `WHITELIST_CLUSTERS`: Comma-separated list of clusters to include (optional)
- `BLACKLIST_CLUSTERS`: Comma-separated list of clusters to exclude (optional)
- `DELETE_UNKNOWN_SECRETS`: Whether to delete unknown cluster secrets (default: false)
- `OTEL_ENABLED`: Enable OpenTelemetry (default: false)

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Readiness Check
```
GET /ready
```
Returns service readiness status.

### Metrics
```
GET /metrics
```
Returns basic service metrics.

## Development

### Prerequisites
- Node.js 18+
- pnpm
- Access to GCP, AWS, and Omnistrate APIs
- Kubernetes cluster access

### Setup
```bash
cd backend/services/cluster-discovery
pnpm install
cp .env.example .env
# Edit .env with your configuration
```

### Running Locally
```bash
pnpm start
```

### Building
```bash
pnpm build
```

### Testing
```bash
pnpm test
```

## Deployment

The service is deployed as a Kubernetes Deployment with:
- 1 replica
- Health and readiness probes
- Resource limits (100m-500m CPU, 256Mi-512Mi memory)
- Service account with ArgoCD permissions

### Kubernetes Manifests
- Dev: `argocd/ctrl_plane/dev/manifests/api-services/cluster-discovery.yaml`
- Prod: `argocd/ctrl_plane/prod/manifests/api-services/cluster-discovery.yaml`

## Workflow

1. **Discovery Phase**
   - Discovers clusters from GCP, AWS, and Omnistrate in parallel
   - Applies whitelist/blacklist filters
   - Combines results from all providers

2. **Registration Phase**
   - Retrieves existing cluster secrets from ArgoCD
   - For new clusters:
     - Creates observability node pool
     - Registers cluster with ArgoCD
     - Creates PagerDuty secret
   - For existing clusters:
     - Updates cluster secret if labels changed
   - Always updates VMUser secret

3. **Cleanup Phase**
   - Identifies stale cluster secrets
   - Deregisters clusters that no longer exist (if DELETE_UNKNOWN_SECRETS=true)

## Error Handling

The service includes custom error classes for different failure scenarios:
- `DiscoveryError`: Cluster discovery failures
- `RegistrationError`: Cluster registration failures
- `NodePoolError`: Node pool creation failures
- `SecretManagementError`: Secret management failures
- `K8sError`: Kubernetes operation failures
- `CredentialError`: Credential-related failures
- `ConfigurationError`: Configuration validation failures
- `TimeoutError`: Timeout errors

Errors are logged with full context and don't stop the entire discovery process.

## Monitoring

- Service logs are structured JSON using Pino
- All operations include duration metrics
- Failed operations include error details and stack traces
- Scan completion is logged with success/failure status

## Security

- Credentials are stored in Kubernetes secrets
- Service uses workload identity for cloud provider authentication
- BYOA clusters use short-lived tokens via credential exchange
- TLS client certificates for BYOA cluster authentication

## License

SSPL (Server Side Public License)
