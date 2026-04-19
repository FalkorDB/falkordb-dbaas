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
- [ ] A Google Chat space webhook URL for Wazuh alerts
- [ ] Access to AWS console (if deploying to AWS spokes)
- [ ] Access to Azure portal (if deploying to Azure spokes)

---

## Step 1 — Infrastructure (OpenTofu)

### 1.1 GCP Control Plane

This creates the Wazuh static IP, GCS evidence locker bucket, Prowler service account, Workload Identity binding, and firewall rules.

```bash
cd tofu/runtime/gcp/infra

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

Two sets of placeholders must be replaced before deploying ArgoCD apps.

### 2.1 Wazuh Static IP (Helm values only)

Replace `${WAZUH_STATIC_IP}` with the IP from Step 1.1 in the Wazuh Manager Helm Application files:

| File | Purpose |
|------|---------|
| `argocd/apps/ctrl-plane/dev/wazuh.yaml` | LoadBalancer IP |
| `argocd/apps/ctrl-plane/prod/wazuh.yaml` | LoadBalancer IP |

> **Note:** The agent `manager-ip` is now a SealedSecret (see Step 4). Only the Helm LoadBalancer IP requires a direct placeholder replacement — Helm values cannot reference K8s secrets.

### 2.2 Google Chat Webhook URL

The webhook URL is now managed as a SealedSecret (see Step 4). You no longer need to edit the Wazuh Helm values directly — the integration script reads `GOOGLE_CHAT_WEBHOOK_URL` from the sealed secret mounted as an environment variable.

To create a webhook: Google Chat space → Apps & integrations → Webhooks → Create.

### 2.3 GCP Project ID

Replace `PROJECT_ID` in the Workload Identity annotation with your actual GCP project ID (e.g., `falkordb-prod`):

| File |
|------|
| `argocd/kustomize/prowler/overlays/gcp-dev/wi-patch.yaml` |
| `argocd/kustomize/prowler/overlays/gcp-prod/wi-patch.yaml` |

The annotation should read:
```yaml
iam.gke.io/gcp-service-account: prowler-uploader@<YOUR_PROJECT_ID>.iam.gserviceaccount.com
```

---

## Step 3 — ArgoCD Cluster Labels

Spoke clusters registered in ArgoCD must have the following labels for ApplicationSets to target them:

The ArgoCD cluster secrets already carry `cloud_provider` and `host_mode` labels. Verify they are set:

```bash
# Check existing labels on a cluster
argocd cluster get <CLUSTER_NAME> -o json | jq '.labels'

# Expected labels:
#   role: app-plane
#   cloud_provider: gcp   (or aws, azure)
#   host_mode: managed    (or byoa)
```

| Label | Required By | Values |
|-------|-------------|--------|
| `role: app-plane` | All spoke ApplicationSets | `app-plane` |
| `cloud_provider` | Prowler ApplicationSet (routes to cloud-specific overlay) | `gcp`, `aws`, `azure` |
| `host_mode` | Informational (not used by security stack selectors) | `managed`, `byoa` |

Without `role: app-plane` and `cloud_provider`, the ApplicationSets will not generate Applications for the cluster.

---

## Step 3.5 — IAP (Identity-Aware Proxy) for Security Dashboards

The Wazuh Dashboard and ThreatMapper Console are internet-facing via nginx ingress. Access is restricted to the `devops@falkordb.com` Google Group through **oauth2-proxy** with Google OIDC.

> **App-plane security services** (agents, sensors, Prowler) have **no** ingress or LoadBalancer — they are outbound-only and require no IAP.

### 3.5.1 Google Cloud Console — OAuth Client

Create the OAuth2 client manually in the Google Cloud Console:

1. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Name: `security-oauth2-proxy`
4. Authorized redirect URIs:
   - Dev: `https://auth.security.dev.internal.falkordb.cloud/oauth2/callback`
   - Prod: `https://auth.security.internal.falkordb.cloud/oauth2/callback`
5. Copy the **Client ID** and **Client Secret** — these go into `secrets.env`

> **Note:** The `google_iap_brand` / `google_iap_client` Terraform resources were removed because the IAP OAuth Admin APIs were permanently shut down on 2026-03-19.

### 3.5.2 Google Workspace Admin — Service Account

oauth2-proxy needs a Google Workspace admin API service account to verify group membership. In the Google Cloud Console:

1. Create a service account (e.g., `oauth2-proxy-groups@<PROJECT>.iam.gserviceaccount.com`)
2. Enable domain-wide delegation
3. Grant the scope `https://www.googleapis.com/auth/admin.directory.group.readonly`
4. In Google Workspace Admin → Security → API controls → Domain-wide delegation, add the client ID with the same scope
5. Export the SA key as JSON — this goes into the `google-admin-sa-json` field in `secrets.env`

### 3.5.3 Cookie Secret

Generate a random cookie encryption secret:

```bash
openssl rand -base64 32
```

### 3.5.4 Seal OAuth Credentials

```bash
vi argocd/kustomize/oauth2-proxy/overlays/dev/secrets.env
# Set: client-id=<from Step 3.5.1>
# Set: client-secret=<from Step 3.5.1>
# Set: cookie-secret=<from Step 3.5.3>
# Set: google-admin-sa-json=<SA key JSON from Step 3.5.2>

./scripts/seal_env.sh argocd/kustomize/oauth2-proxy/overlays/dev/secrets.env security \
  certs/ctrl-plane/sealed-secrets/dev/pub-cert.pem
```

### 3.5.5 DNS

Create DNS records pointing to the nginx LB static IP:

| Record | Dev | Prod |
|--------|-----|------|
| `auth.security.dev.internal.falkordb.cloud` | nginx LB IP | — |
| `auth.security.internal.falkordb.cloud` | — | nginx LB IP |

---

## Step 4 — Seal Secrets

All secrets are managed as **SealedSecrets** via `.env` files committed to Git.
Each kustomize overlay has a `secrets.env` file with `REPLACE_ME` placeholders.
The workflow:

1. Edit `secrets.env` — replace `REPLACE_ME` with real values
2. Run `./scripts/seal_env.sh` — produces `secrets-env-secret.yaml` (SealedSecret YAML)
3. Commit the sealed YAML (never commit plaintext values to Git)
4. ArgoCD syncs the SealedSecret to the cluster

```bash
# Generic sealing command (ctrl-plane secrets → ctrl-plane cert)
./scripts/seal_env.sh <path>/secrets.env security \
  certs/ctrl-plane/sealed-secrets/dev/pub-cert.pem

# App-plane secrets → app-plane cert
./scripts/seal_env.sh <path>/secrets.env security \
  certs/app-plane/sealed-secrets/dev/pub-cert.pem
```

### 4.1 Google Chat Webhook (ctrl-plane only)

```bash
# Edit the webhook URL
vi argocd/kustomize/wazuh-rules/secrets.env
# Set: WAZUH_GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/...

./scripts/seal_env.sh argocd/kustomize/wazuh-rules/secrets.env security \
  certs/ctrl-plane/sealed-secrets/dev/pub-cert.pem
```

### 4.2 ThreatMapper Console API Key (ctrl-plane only)

Generate a random API key that will be shared between the Console and all Sensors:

```bash
DEEPFENCE_KEY=$(openssl rand -hex 32)

# Seal for console
vi argocd/kustomize/threatmapper-console/overlays/dev/secrets.env
# Set: DEEPFENCE_KEY=<generated key>
./scripts/seal_env.sh argocd/kustomize/threatmapper-console/overlays/dev/secrets.env security \
  certs/ctrl-plane/sealed-secrets/dev/pub-cert.pem

# Use the SAME key for all sensor overlays (Step 4.4)
```

### 4.3 Wazuh Agent Enrollment Key + Manager IP (all clusters)

The Wazuh Manager generates an enrollment password on first boot. The manager IP is the static IP from Step 1.1. Set both in all overlays:

```bash
# ctrl-plane
vi argocd/kustomize/wazuh-agent/overlays/ctrl-plane-dev/secrets.env
# Set: enrollment-key=<ENROLLMENT_PASSWORD>
# Set: manager-ip=<WAZUH_STATIC_IP from Step 1.1>
./scripts/seal_env.sh argocd/kustomize/wazuh-agent/overlays/ctrl-plane-dev/secrets.env security \
  certs/ctrl-plane/sealed-secrets/dev/pub-cert.pem

# app-plane (seal with app-plane cert)
vi argocd/kustomize/wazuh-agent/overlays/app-plane-dev/secrets.env
./scripts/seal_env.sh argocd/kustomize/wazuh-agent/overlays/app-plane-dev/secrets.env security \
  certs/app-plane/sealed-secrets/dev/pub-cert.pem
```

### 4.4 ThreatMapper Sensor API Key + Console URL (all clusters)

Use the **same** `DEEPFENCE_KEY` generated in Step 4.2. Also set the Console URL:

```bash
# ctrl-plane
vi argocd/kustomize/threatmapper-sensor/overlays/dev/secrets.env
# Set: api-key=<same key from Step 4.2>
# Set: console-url=threatmapper.security.dev.internal.falkordb.cloud
./scripts/seal_env.sh argocd/kustomize/threatmapper-sensor/overlays/dev/secrets.env security \
  certs/ctrl-plane/sealed-secrets/dev/pub-cert.pem

# Repeat for app-plane overlays with app-plane cert
```

### 4.5 Prowler AWS Credentials (AWS spokes only)

```bash
vi argocd/kustomize/prowler/overlays/aws-dev/secrets.env
# Set: role-arn=arn:aws:iam::123456789012:role/prowler-soc2-scanner
# Set: region=us-east-1
# Set: sa-key.json=<contents of GCS service account key JSON>
# Set: evidence-bucket=falkordb-evidence-locker-dev

./scripts/seal_env.sh argocd/kustomize/prowler/overlays/aws-dev/secrets.env security \
  certs/app-plane/sealed-secrets/dev/pub-cert.pem
```

### 4.6 Prowler Azure Credentials (Azure spokes only)

```bash
vi argocd/kustomize/prowler/overlays/azure-dev/secrets.env
# Set all fields from tofu output (Step 1.3)
# Set: sa-key.json=<contents of GCS service account key JSON>
# Set: evidence-bucket=falkordb-evidence-locker-dev

./scripts/seal_env.sh argocd/kustomize/prowler/overlays/azure-dev/secrets.env security \
  certs/app-plane/sealed-secrets/dev/pub-cert.pem
```

### 4.7 Prowler GCP Evidence Bucket (GCP spokes only)

GCP spokes use Workload Identity for GCS access but still need the bucket name sealed:

```bash
vi argocd/kustomize/prowler/overlays/gcp-dev/secrets.env
# Set: evidence-bucket=falkordb-evidence-locker-dev

./scripts/seal_env.sh argocd/kustomize/prowler/overlays/gcp-dev/secrets.env security \
  certs/app-plane/sealed-secrets/dev/pub-cert.pem
```

### Secret Summary

| Secret | `.env` Location | Clusters | Keys |
|--------|----------------|----------|------|
| `oauth2-proxy-credentials` | `oauth2-proxy/overlays/*/secrets.env` | Ctrl-plane | `client-id`, `client-secret`, `cookie-secret`, `google-admin-sa-json` |
| `wazuh-google-chat-webhook` | `wazuh-rules/secrets.env` | Ctrl-plane | `WAZUH_GOOGLE_CHAT_WEBHOOK_URL` |
| `threatmapper-console-key` | `threatmapper-console/overlays/*/secrets.env` | Ctrl-plane | `DEEPFENCE_KEY` |
| `wazuh-agent-key` | `wazuh-agent/overlays/*/secrets.env` | All | `enrollment-key`, `manager-ip` |
| `threatmapper-sensor-key` | `threatmapper-sensor/overlays/*/secrets.env` | All | `api-key`, `console-url` |
| `prowler-aws-credentials` | `prowler/overlays/aws-*/secrets.env` | AWS spokes | `role-arn`, `region` |
| `prowler-azure-credentials` | `prowler/overlays/azure-*/secrets.env` | Azure spokes | `client-id`, `client-secret`, `tenant-id`, `subscription-id` |
| `prowler-gcs-credentials` | `prowler/overlays/{aws,azure}-*/secrets.env` | AWS + Azure spokes | `sa-key.json` |
| `prowler-infra` | `prowler/overlays/*/secrets.env` | All spokes | `evidence-bucket` |

TLS secrets (`wazuh-dashboard-tls`, `threatmapper-tls`) are auto-provisioned by cert-manager via the `letsencrypt-prod` ClusterIssuer.

---

## Step 5 — Deploy ArgoCD Applications (Ordered)

Deploy in this order. Wait for each component to be healthy before proceeding.

### 5.0 OAuth2 Proxy (must be first)

```bash
kubectl apply -f argocd/apps/ctrl-plane/dev/oauth2-proxy.yaml
```

Wait until oauth2-proxy pods are Running and the ingress is responding:

```bash
kubectl get pods -n security -l app=oauth2-proxy
curl -sI "https://auth.security.dev.internal.falkordb.cloud/oauth2/auth" | head -1
# Expected: HTTP/2 401 (unauthenticated — this is correct)
```

The Wazuh Dashboard and ThreatMapper Console ingresses reference this endpoint via `auth-url`. It must be healthy **before** deploying those services.

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
kubectl apply -f argocd/apps/ctrl-plane/dev/threatmapper-console-secrets.yaml
kubectl apply -f argocd/apps/ctrl-plane/dev/threatmapper.yaml
```

The Console secrets Application (sync-wave -1) deploys the `threatmapper-console-key` SealedSecret before the Console Helm chart starts. The Console reads the pre-set `DEEPFENCE_KEY` from the sealed secret — no manual API key generation needed.

Wait until Console is accessible via ingress, then verify the API key works:

```bash
curl -s -k -H "Authorization: Bearer <DEEPFENCE_KEY>" \
  "https://threatmapper.security.dev.internal.falkordb.cloud/deepfence/v2/topology" | head
```

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
- [ ] Google Chat integration receives Wazuh alerts

---

## Deploying to Production

Repeat Steps 2–6 using the `prod` variants:

- Replace placeholders in prod files
- Use `argocd/apps/ctrl-plane/prod/*.yaml`
- Use `argocd/apps/app-plane/prod/*.yaml`
- Seal secrets with `certs/ctrl-plane/sealed-secrets/prod/pub-cert.pem`

Key differences in prod:
- Wazuh Manager: `ssl_verify_host: "yes"` (strict mTLS)
- ThreatMapper Console: 2 replicas (HA)
- Domain: `*.security.internal.falkordb.cloud` (no `dev` subdomain)
- oauth2-proxy: callback URL is `https://auth.security.internal.falkordb.cloud/oauth2/callback`
- Auth annotations on ingresses point to `auth.security.internal.falkordb.cloud`
