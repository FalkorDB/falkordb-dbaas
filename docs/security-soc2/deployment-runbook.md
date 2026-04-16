# Deployment Runbook — Security & SOC 2 Evidence Engine

First-time deployment procedure. Deploy to **dev first**, validate, then repeat for prod.

---

## Prerequisites

Before starting, ensure the following are available:

- [ ] `tofu` / `terragrunt` CLI installed
- [ ] `kubectl` access to the control-plane GKE cluster
- [ ] `kubeseal` CLI for creating SealedSecrets
- [ ] `argocd` CLI or ArgoCD UI access
- [ ] `gcloud` CLI authenticated with the GCP project
- [ ] A Slack incoming webhook URL for Wazuh alerts
- [ ] Access to AWS console (if deploying to AWS spokes)
- [ ] Access to Azure portal (if deploying to Azure spokes)

---

## Step 1 — Infrastructure (OpenTofu)

### 1.1 GCP Control Plane

This creates the Wazuh static IP, GCS evidence locker bucket, Prowler service account, Workload Identity binding, and firewall rules.

```bash
cd tofu/runtime/gcp/infra

# Set the spoke NAT CIDRs in your tfvars file.
# These are the NAT gateway IPs of your spoke clusters that need to
# reach the Wazuh Manager. Leave empty initially if spokes don't exist yet.
#
# spoke_nat_cidrs = ["34.x.x.x/32", "35.x.x.x/32"]

tofu plan
tofu apply
```

Capture outputs — you will need these in Step 2:

```bash
tofu output wazuh_ip                # → Static IP for Wazuh Manager LoadBalancer
tofu output evidence_locker_bucket  # → GCS bucket name
tofu output prowler_uploader_email  # → Prowler GCP service account email
```

The `security` node pool in GKE (e2-standard-4, 0–10 autoscale) is created as part of `gke.tf`. No separate step needed.

### 1.2 AWS IAM Role (if you have AWS spokes)

Creates an IAM role with `SecurityAudit` + `ViewOnlyAccess` policies, trusted by the EKS OIDC provider for IRSA.

```bash
cd tofu/org/aws/org

# Ensure these variables are set in your tfvars:
#   eks_oidc_issuer = "oidc.eks.us-east-1.amazonaws.com/id/EXAMPLE123"
#   environment     = "dev"  # or "prod"

tofu plan
tofu apply
```

Capture the output:
```bash
tofu output prowler_role_arn  # → ARN for the prowler-aws-credentials Secret
```

### 1.3 Azure Service Principal (if you have Azure spokes)

Creates an Azure AD application + service principal with `Reader` and `Security Reader` roles.

```bash
cd tofu/runtime/azure

tofu plan
tofu apply
```

Capture outputs:
```bash
tofu output prowler_client_id
tofu output -raw prowler_client_secret  # sensitive
tofu output prowler_tenant_id
tofu output prowler_subscription_id
```

---

## Step 2 — Replace Placeholders

Three sets of placeholders must be replaced before deploying ArgoCD apps.

### 2.1 Wazuh Static IP

Replace `${WAZUH_STATIC_IP}` with the IP from Step 1.1 in these files:

| File | Purpose |
|------|---------|
| `argocd/apps/ctrl-plane/dev/wazuh.yaml` | LoadBalancer IP |
| `argocd/apps/ctrl-plane/prod/wazuh.yaml` | LoadBalancer IP |
| `argocd/kustomize/wazuh-agent/overlays/dev/kustomization.yaml` | Agent → Manager IP |
| `argocd/kustomize/wazuh-agent/overlays/prod/kustomization.yaml` | Agent → Manager IP |
| `argocd/kustomize/wazuh-agent/overlays/app-plane-dev/kustomization.yaml` | Agent → Manager IP |
| `argocd/kustomize/wazuh-agent/overlays/app-plane-prod/kustomization.yaml` | Agent → Manager IP |

### 2.2 Slack Webhook URL

Replace `${WAZUH_SLACK_WEBHOOK_URL}` with your Slack incoming webhook:

| File |
|------|
| `argocd/apps/ctrl-plane/dev/wazuh.yaml` |
| `argocd/apps/ctrl-plane/prod/wazuh.yaml` |

### 2.3 GCP Project ID

Replace `PROJECT_ID` in the Workload Identity annotation with your actual GCP project ID (e.g., `falkordb-prod`):

| File |
|------|
| `argocd/kustomize/prowler/overlays/dev/wi-patch.yaml` |
| `argocd/kustomize/prowler/overlays/prod/wi-patch.yaml` |
| `argocd/kustomize/prowler/overlays/gcp-dev/wi-patch.yaml` |
| `argocd/kustomize/prowler/overlays/gcp-prod/wi-patch.yaml` |

The annotation should read:
```yaml
iam.gke.io/gcp-service-account: prowler-uploader@<YOUR_PROJECT_ID>.iam.gserviceaccount.com
```

---

## Step 3 — ArgoCD Cluster Labels

Spoke clusters registered in ArgoCD must have the following labels for ApplicationSets to target them:

```bash
# For each spoke cluster:
argocd cluster set <CLUSTER_NAME> \
  --label role=app-plane \
  --label cloud=gcp      # or "aws" or "azure"
```

| Label | Required By | Values |
|-------|-------------|--------|
| `role: app-plane` | All spoke ApplicationSets | `app-plane` |
| `cloud` | Prowler ApplicationSet (routes to cloud-specific overlay) | `gcp`, `aws`, `azure` |

Without these labels, the ApplicationSets will not generate any Applications for the cluster.

---

## Step 4 — Create Secrets

All secrets go in the `security` namespace. Use SealedSecrets for GitOps:

```bash
# Create the secret locally, seal it, then commit the SealedSecret
kubectl create secret generic <NAME> -n security \
  --from-literal=<KEY>=<VALUE> \
  --dry-run=client -o yaml \
  | kubeseal --format yaml > sealed-<NAME>.yaml
```

### 4.1 Wazuh Agent Enrollment Key (all clusters)

The Wazuh Manager generates an enrollment password on first boot. Retrieve it from the Manager config or set one explicitly in the Wazuh Helm values.

```bash
kubectl create secret generic wazuh-agent-key -n security \
  --from-literal=enrollment-key=<ENROLLMENT_PASSWORD>
```

This secret must exist on **every cluster** where Wazuh agents run (control plane + all spokes).

### 4.2 ThreatMapper Sensor API Key (all clusters)

The API key is generated from the ThreatMapper Console UI after first boot (Step 5.3). Create this secret **after** the Console is running.

```bash
kubectl create secret generic threatmapper-sensor-key -n security \
  --from-literal=api-key=<API_KEY>
```

This secret must exist on **every cluster** where ThreatMapper sensors run.

### 4.3 Prowler AWS Credentials (AWS spokes only)

```bash
kubectl create secret generic prowler-aws-credentials -n security \
  --from-literal=role-arn=arn:aws:iam::123456789012:role/prowler-soc2-scanner \
  --from-literal=region=us-east-1
```

### 4.4 Prowler Azure Credentials (Azure spokes only)

```bash
kubectl create secret generic prowler-azure-credentials -n security \
  --from-literal=client-id=<CLIENT_ID> \
  --from-literal=client-secret=<CLIENT_SECRET> \
  --from-literal=tenant-id=<TENANT_ID> \
  --from-literal=subscription-id=<SUBSCRIPTION_ID>
```

### 4.5 Prowler GCS Credentials (AWS + Azure spokes only)

Non-GCP spokes need a GCS service account key to upload scan results to the evidence locker. GCP spokes use Workload Identity instead.

```bash
# Generate a key for the Prowler uploader SA
gcloud iam service-accounts keys create /tmp/prowler-gcs-key.json \
  --iam-account=$(tofu -chdir=tofu/runtime/gcp/infra output -raw prowler_uploader_email)

kubectl create secret generic prowler-gcs-credentials -n security \
  --from-file=sa-key.json=/tmp/prowler-gcs-key.json

# Clean up local key
rm /tmp/prowler-gcs-key.json
```

### Secret Summary

| Secret | Clusters | Keys |
|--------|----------|------|
| `wazuh-agent-key` | All | `enrollment-key` |
| `threatmapper-sensor-key` | All | `api-key` |
| `prowler-aws-credentials` | AWS spokes | `role-arn`, `region` |
| `prowler-azure-credentials` | Azure spokes | `client-id`, `client-secret`, `tenant-id`, `subscription-id` |
| `prowler-gcs-credentials` | AWS + Azure spokes | `sa-key.json` |

TLS secrets (`wazuh-dashboard-tls`, `threatmapper-tls`) are auto-provisioned by cert-manager via the `letsencrypt-prod` ClusterIssuer.

---

## Step 5 — Deploy ArgoCD Applications (Ordered)

Deploy in this order. Wait for each component to be healthy before proceeding.

### 5.1 Wazuh Manager

```bash
kubectl apply -f argocd/apps/ctrl-plane/dev/wazuh.yaml
```

Wait until:
- Wazuh Manager pod is `Running`
- Wazuh Indexer cluster is green (3 replicas)
- Wazuh Dashboard is accessible
- LoadBalancer has the static IP assigned

```bash
kubectl get pods -n security -l app=wazuh
kubectl get svc -n security -l app=wazuh-manager
```

### 5.2 Wazuh Custom Rules

```bash
kubectl apply -f argocd/apps/ctrl-plane/dev/wazuh-rules.yaml
```

Deploys the custom rules ConfigMap and dashboard saved objects. The Manager auto-reloads rules when the ConfigMap is mounted.

### 5.3 ThreatMapper Console

```bash
kubectl apply -f argocd/apps/ctrl-plane/dev/threatmapper.yaml
```

Wait until Console is accessible via ingress. Then:

1. Log in to the ThreatMapper Console UI
2. Navigate to **Settings → User Management → API Keys**
3. Generate a new API key for the sensor agents
4. Use this key to create the `threatmapper-sensor-key` secret (Step 4.2)

### 5.4 Wazuh Agents (Control Plane)

```bash
kubectl apply -f argocd/apps/ctrl-plane/dev/wazuh-agent.yaml
```

Verify agents register with the Manager:
```bash
# Check DaemonSet rollout
kubectl get ds wazuh-agent -n security

# Check agent registration on Manager
curl -k -u admin:admin \
  "https://$(kubectl get svc wazuh-manager -n security -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):55000/agents?status=active"
```

### 5.5 Wazuh Agents (Spoke Clusters)

```bash
kubectl apply -f argocd/apps/app-plane/dev/wazuh-agent.yaml
```

The ApplicationSet will generate one Application per cluster labeled `role: app-plane`.

### 5.6 ThreatMapper Sensors (Control Plane + Spokes)

```bash
kubectl apply -f argocd/apps/ctrl-plane/dev/threatmapper-sensor.yaml
kubectl apply -f argocd/apps/app-plane/dev/threatmapper-sensor.yaml
```

Verify sensors appear in the ThreatMapper Console UI under **Topology**.

### 5.7 Prowler (Spoke Clusters)

```bash
kubectl apply -f argocd/apps/app-plane/dev/prowler.yaml
```

The Prowler CronJob runs at 02:00 UTC daily. To trigger an immediate test:

```bash
# On a spoke cluster
kubectl create job --from=cronjob/prowler-soc2-scan prowler-test -n security
kubectl logs -f job/prowler-test -n security
```

Verify results appear in the evidence locker:
```bash
gsutil ls "gs://$(tofu -chdir=tofu/runtime/gcp/infra output -raw evidence_locker_bucket)/prowler/"
```

---

## Step 6 — Verify End-to-End

### Observability

```bash
# VMRule alerts are loaded
kubectl get vmrules -n observability | grep soc2

# Check Grafana dashboard exists
# Navigate to Grafana → Dashboards → "SOC 2 Compliance"
```

### Evidence Report

Run the on-demand evidence collection script:

```bash
export WAZUH_API_URL="https://wazuh.security.dev.internal.falkordb.cloud:55000"
export WAZUH_API_TOKEN="<TOKEN>"
export THREATMAPPER_API_URL="https://threatmapper.security.dev.internal.falkordb.cloud"
export THREATMAPPER_API_KEY="<API_KEY>"
export WAZUH_CA_BUNDLE="/path/to/wazuh-ca.pem"         # optional
export THREATMAPPER_CA_BUNDLE="/path/to/threatmapper-ca.pem"  # optional

./scripts/generate_compliance_report.sh \
  --bucket "$(tofu -chdir=tofu/runtime/gcp/infra output -raw evidence_locker_bucket)" \
  --output-dir ./reports
```

### Checklist

- [ ] Wazuh Manager healthy, LoadBalancer IP assigned
- [ ] Wazuh Dashboard accessible via ingress
- [ ] Wazuh Agents registered from all clusters
- [ ] ThreatMapper Console accessible, sensors connected
- [ ] Prowler CronJob completed at least one run
- [ ] Prowler results visible in GCS evidence locker
- [ ] Grafana SOC 2 dashboard showing data
- [ ] VMRule alerts loaded (no `ProwlerScanStale` firing)
- [ ] Slack integration receives Wazuh alerts

---

## Deploying to Production

Repeat Steps 2–6 using the `prod` variants:

- Replace placeholders in prod files
- Use `argocd/apps/ctrl-plane/prod/*.yaml`
- Use `argocd/apps/app-plane/prod/*.yaml`

Key differences in prod:
- Wazuh Manager: `ssl_verify_host: "yes"` (strict mTLS)
- ThreatMapper Console: 2 replicas (HA)
- Domain: `*.security.internal.falkordb.cloud` (no `dev` subdomain)
