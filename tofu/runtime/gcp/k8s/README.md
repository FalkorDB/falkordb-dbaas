# runtime/gcp/k8s — in-cluster Kubernetes configuration

Bootstraps the control-plane GKE cluster created by `runtime/gcp/infra`.
Installs ArgoCD via Helm and configures Workload Identity bindings so
in-cluster workloads can authenticate to GCP without static keys.

**Depends on**: `runtime/gcp/infra` (cluster must exist before applying).

## File layout

| File                   | Contents                                                         |
|------------------------|------------------------------------------------------------------|
| `providers.tf`         | `required_providers`, data sources, `kubernetes` + `helm` provider config |
| `variables.tf`         | All input variable declarations                                  |
| `argocd.tf`            | `argocd` namespace, bootstrap secrets, ArgoCD Helm release       |
| `observability.tf`     | `observability` namespace, Grafana Google OAuth credentials      |
| `workload-identity.tf` | `api` namespace, db-exporter KSA, GCP Workload Identity bindings |
| `backend.tf`           | GCS backend declaration (overridden by Terragrunt)               |
| `terragrunt.hcl`       | Terragrunt shim — injects bucket, prefix, cluster outputs        |
| `values/dev/argocd.yaml`  | ArgoCD Helm values for development                            |
| `values/prod/argocd.yaml` | ArgoCD Helm values for production                             |

## Bootstrapped resources

### ArgoCD (`argocd.tf`)
- Namespace `argocd`
- `argocd-secret` — admin password (bcrypt), Dex Google OAuth config, server
  secret key. **lifecycle.ignore_changes** prevents re-apply on every CI run
  because `bcrypt()` and `timestamp()` generate new values each plan.
- `argocd-google-groups` — Google Workspace JSON key for group-based RBAC
- Helm release: `argo-cd` chart v9.1.5

After initial bootstrap, ArgoCD takes over and manages all subsequent
in-cluster deployments via the `argocd/` Application CRDs in this repo.

### Observability (`observability.tf`)
- Namespace `observability` — hosts VictoriaMetrics, Grafana, Alertmanager
- `grafana-google-credentials` secret — Grafana Google OAuth client ID/secret

### Workload Identity (`workload-identity.tf`)
- Namespace `api` — hosts backend API pods
- `db-exporter-sa` KSA — bound to the `db-exporter-sa` GCP SA via
  Workload Identity Federation (no static key needed)
- IAM bindings for ArgoCD server + application-controller

## Required variables (injected via TF_* env vars)

| Variable                    | Description                                       |
|-----------------------------|---------------------------------------------------|
| `project_id`                | GCP project ID                                    |
| `region`                    | GCP region                                        |
| `cluster_endpoint`          | From `infra` outputs (or `TF_CLUSTER_ENDPOINT`)   |
| `cluster_ca_certificate`    | From `infra` outputs                              |
| `cluster_name`              | From `infra` outputs                              |
| `environment`               | `production` or `development`                     |
| `argocd_admin_password`     | ArgoCD admin password (keep in Secret Manager)    |
| `dex_google_client_id`      | Google OAuth client ID for Dex                    |
| `dex_google_client_secret`  | Google OAuth client secret                        |
| `dex_google_admin_email`    | Google Workspace admin email for group sync       |
| `argocd_groups_sa_json`     | Base64-encoded DWD service account JSON key       |
| `grafana_google_client_id`  | Grafana Google OAuth client ID                    |
| `grafana_google_client_secret` | Grafana Google OAuth client secret             |
| `db_exporter_sa_id`         | `account_id` of the db-exporter GCP SA            |
| `argocd_sa_id`              | `id` of the argocd GCP SA                         |

## Apply manually

```bash
export TF_ENVIRONMENT=dev
# Cluster outputs from infra (or use mock values for plan-only)
export TF_CLUSTER_ENDPOINT=$(cd ../infra && terragrunt output -raw cluster_endpoint)
export TF_CLUSTER_CA_CERTIFICATE=$(cd ../infra && terragrunt output -raw cluster_ca_certificate)
export TF_CLUSTER_NAME=$(cd ../infra && terragrunt output -raw cluster_name)
# ... secrets from a secrets manager or CI env vars

cd tofu/runtime/gcp/k8s
terragrunt apply
```

## Rotating the ArgoCD admin password

The `argocd-secret` has `lifecycle { ignore_changes = [data] }` to prevent
bcrypt drift. To rotate the password:

```bash
# 1. Remove the ignore guard temporarily (comment out lifecycle block)
# 2. Apply the k8s stack with the new TF_ARGOCD_ADMIN_PASSWORD
# 3. Restore the lifecycle block
# 4. Commit
```

Alternatively, use the ArgoCD CLI: `argocd account update-password`.

## Adding a new in-cluster secret

Prefer Sealed Secrets (`argocd/kustomize/`) over Terraform-managed secrets
for application secrets. Use this stack only for **bootstrap** secrets that
ArgoCD itself needs to start (admin password, Dex credentials).
