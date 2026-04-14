# runtime/gcp/infra — GKE cluster and supporting infrastructure

Manages the physical GCP infrastructure for the control-plane cluster.
This stack is a **prerequisite** for `runtime/gcp/k8s`.

## File layout

| File             | Contents                                                       |
|------------------|----------------------------------------------------------------|
| `providers.tf`   | `required_providers`, `provider "google"`                      |
| `variables.tf`   | All input variable declarations                                |
| `outputs.tf`     | Cluster endpoint, CA cert, IP addresses, SA emails             |
| `vpc.tf`         | VPC, subnet, Cloud Router, Cloud NAT                           |
| `gke.tf`         | Private GKE cluster, node pools, daily backup plan             |
| `addresses.tf`   | Static external IPs (ArgoCD, Grafana, VMAuth, customer-obs)    |
| `registry.tf`    | Artifact Registry repos (frontend, backend, jobs) + IAM        |
| `iam.tf`         | Service accounts: ArgoCD DWD, alert-reaction, LDAP admin       |
| `workflows.tf`   | Google Workflows: memory-threshold alert automation            |
| `backend.tf`     | GCS backend declaration (prefix pinned; overridden by Terragrunt) |
| `terragrunt.hcl` | Terragrunt shim — injects GCS bucket + prefix                  |

## Node pools

| Pool                         | Machine        | Max nodes | Role                                  |
|------------------------------|----------------|-----------|---------------------------------------|
| `default-pool`               | e2-medium      | 100       | General workloads                     |
| `observability-resources`    | e2-standard-2  | 20        | VictoriaMetrics, Alertmanager         |
| `observability-resources-large` | e2-standard-4 | 20      | Grafana, heavy ingestion pods         |
| `backend`                    | e2-standard-2  | 20        | Backend API pods                      |
| `public-pool`                | e2-standard-2  | 220       | Internet-facing LBs (`private=false`) |

All pools start at 0 nodes and autoscale. The public-pool has
`enable_private_nodes=false` so external LoadBalancer IPs are assignable.

## Key outputs

| Output                  | Used by                                    |
|-------------------------|--------------------------------------------|
| `cluster_endpoint`      | k8s stack — kubernetes / helm provider     |
| `cluster_ca_certificate`| k8s stack — cluster TLS verification       |
| `cluster_name`          | k8s stack — gcloud exec auth               |
| `argocd_ip`             | ArgoCD Ingress annotation                  |
| `grafana_ip`            | Grafana Ingress annotation                 |
| `vmauth_ip`             | VMAuth Ingress annotation                  |
| `customer_observability_ip` | Customer-facing LB                     |
| `argocd_dwd`            | ArgoCD Google Workspace group sync         |
| `argocd_dwd_sa_key`     | Stored in k8s secret by the k8s stack      |

## Required variables (set via TF_* env vars in CI)

| Variable                    | Description                                 |
|-----------------------------|---------------------------------------------|
| `project_id`                | GCP project for the control plane           |
| `region`                    | GCP region (e.g. `us-central1`)             |
| `zones`                     | List of zones (e.g. `["us-central1-a"]`)    |
| `ip_range_subnet`           | CIDR for the main subnet                    |
| `ip_range_pods`             | Secondary CIDR for pods                     |
| `ip_range_services`         | Secondary CIDR for services                 |
| `db_exporter_sa_id`         | `account_id` of the db-exporter SA          |
| `omnistrate_service_id`     | Omnistrate service ID (used in workflow)    |
| `omnistrate_environment_id` | Omnistrate environment ID                   |

## Apply manually

```bash
export TF_ENVIRONMENT=dev
export TF_CTRL_PLANE_DEV_PROJECT_ID=my-project
# ... (other TF_* vars)

cd tofu/runtime/gcp/infra
terragrunt apply
```

## Adding a new node pool

Edit `gke.tf` → `module.gke.node_pools` list. Add a matching entry in
`node_pools_resource_labels`. Give the pool the `goog-gke-node-pool-provisioning-model`
label so cost allocation works correctly.

For a public-facing pool, add a separate `google_container_node_pool` resource
(see `google_container_node_pool.public`) with `enable_private_nodes = false`.
