# runtime/gcp — GCP control-plane runtime stacks

These two stacks are applied automatically by CI on every merge to `main`
(production) or `dev` (development). They manage the live control-plane GKE
cluster and its in-cluster configuration.

```
runtime/gcp/
  infra/   ← GKE cluster, networking, IPs, service accounts, registries
  k8s/     ← Kubernetes namespaces, ArgoCD, Grafana, Workload Identity
```

## What is this cluster for?

The control-plane GKE cluster centralises observability and orchestration for
all customer deployments. It runs:

- **ArgoCD** — GitOps operator that syncs all observability components across
  every customer namespace/cluster via ApplicationSets
- **VictoriaMetrics** — high-performance metrics store that scrapes metrics
  from all customer-plane clusters
- **Grafana** — dashboard and alerting UI, federating over VictoriaMetrics
- **VMAuth** — authentication proxy in front of VictoriaMetrics
- **Backend API** — FalkorDB Cloud management API (namespace `api`)
- **Customer LDAP API** — per-customer LDAP authentication service

## Apply order

`infra` must be applied **before** `k8s` because `k8s` consumes cluster
outputs (endpoint, CA certificate, cluster name).

```bash
# Plan both stacks in dependency order
terragrunt run-all plan --terragrunt-working-dir tofu/runtime/gcp

# Apply in dependency order (infra → k8s)
terragrunt run-all apply --terragrunt-working-dir tofu/runtime/gcp
```

Or apply individually:

```bash
cd tofu/runtime/gcp/infra && terragrunt apply
cd tofu/runtime/gcp/k8s  && terragrunt apply
```

## Required environment variables

| Variable                       | Description                               | Default |
|--------------------------------|-------------------------------------------|---------|
| `TF_ENVIRONMENT`               | `dev` or `prod` — selects GCS bucket     | `dev`   |
| `TF_STATE_BUCKET`              | Override GCS bucket (legacy, optional)    | —       |
| `TF_CTRL_PLANE_DEV_PROJECT_ID` | GCP project ID                            | —       |
| `TF_CTRL_PLANE_DEV_REGION`     | GCP region (e.g. `us-central1`)           | —       |
| `TF_CTRL_PLANE_DEV_ZONES`      | Comma-separated zone list                 | —       |

See each stack's `terragrunt.hcl` for the complete variable mapping.

## GCS state locations (prefixes pinned — no migration needed)

| Stack  | GCS prefix                                    |
|--------|-----------------------------------------------|
| infra  | `gcp/observability_stack/control_plane/infra` |
| k8s    | `gcp/observability_stack/control_plane/k8s`   |

Bucket: `falkordb-dev-state-4620` (dev) or `falkordb-prod-state-c49b` (prod).

## CI integration

GitHub Actions `tofu-plan.yaml` and `tofu-apply.yaml` target
`--terragrunt-working-dir tofu/runtime`. Bootstrap and org stacks are
intentionally excluded from CI automation.
