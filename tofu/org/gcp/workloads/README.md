# org/gcp/workloads — GCP project provisioning

**Apply manually — not run by CI.**

This stack provisions the set of GCP projects that form the FalkorDB Cloud
workloads layer. It is applied once per environment when setting up a new
deployment, or when project-level resources change (APIs, IAM, VPC config).

```
workloads/
  main.tf                   ← root: folder + 3 sub-module calls
  variables.tf / outputs.tf
  control_plane/            ← control-plane project resources
    project.tf              — GCP project (project-factory)
    networking.tf           — VPC and subnets
    provisioning.tf         — Cloud Build SA, Pub/Sub (tenant provisioning)
    iam.tf                  — backend-sa, github-action-sa, db-exporter-sa, argocd-sa
    storage.tf              — RDB exports bucket, MONGODB_URI secret
    control_plane_provision/— sub-module: provisioning SA + Cloud Build topic
  application_plane/        ← app-plane project resources
    main.tf                 — project, IAM, Velero role, metering bucket
  pipelines_development/    ← optional CI project (var.create_pipelines_development)
```

## Projects managed

### control_plane

The project where the GKE cluster (`runtime/gcp/infra`) runs.

Responsibilities:
- GCP project creation + API enablement (GKE, Cloud Build, Pub/Sub, Secret Manager, etc.)
- VPC and subnets for the GKE cluster
- **Provisioning SA** (`falkordb-provisioning-sa`) — used by Cloud Build to apply
  per-tenant OpenTofu stacks. Has Cloud Build Builder role + state bucket access.
- **Pub/Sub** — `cloud-builds` topic receives Cloud Build status events;
  `cloud-builds-provisioner` subscription pushes them to the provisioner service.
- **GitHub Actions OIDC** pool so CI workflows can impersonate the github-action SA
  without long-lived keys.
- **db-exporter-sa** — service account for the DB exporter sidecar; token-creator
  delegated to provisioning SA.
- **argocd-sa** — used by `runtime/gcp/k8s` Workload Identity bindings.
- **RDB exports bucket** — stores RDB snapshots; 7-day lifecycle, versioned.
- **MONGODB_URI** secret — backend MongoDB connection string (180-day rotation).

### application_plane

The project where customer-facing GKE clusters run (provisioned by Omnistrate).

Responsibilities:
- GCP project creation + API enablement
- `roles/owner` for the provisioning SA (allows tenant cluster creation)
- **Velero** custom IAM role for cluster backup/restore
- **Metering bucket** — Omnistrate metering data (CORS for app.falkordb.cloud)
- **Customer RDB bucket** — stores customer RDB data

### pipelines_development (optional)

Enabled when `var.create_pipelines_development = true`. Used for the CI/CD
pipelines development environment. Contains its own provisioning SA and GitHub
OIDC config.

## Apply instructions

```bash
export TF_ENVIRONMENT=dev
cd tofu/org/gcp/workloads

# Review the plan
terragrunt plan

# Apply (takes ~5-10 min due to project factory)
terragrunt apply
```

Variables are passed via `.tfvars` files or environment-specific inputs.
There is no `inputs {}` block in the shim — pass variables at apply time:

```bash
terragrunt apply -var-file=dev.tfvars
```

## Required variables (key ones)

| Variable                               | Description                               |
|----------------------------------------|-------------------------------------------|
| `org_id`                               | GCP organisation ID                       |
| `billing_account_id`                   | Billing account to attach to projects     |
| `parent_folder_id`                     | Folder ID under which to create workloads |
| `workloads_folder_name`                | Display name for the workloads GCP folder |
| `control_plane_project_id`             | Desired project ID                        |
| `control_plane_project_name`           | Display name                              |
| `state_bucket_name`                    | GCS bucket for per-tenant tofu state      |
| `control_plane_public_network_name`    | VPC name                                  |
| `control_plane_public_network_subnets` | Subnet objects (name, region, IP, access) |
| `application_plane_project_id`         | Desired project ID                        |
| `application_plane_metering_bucket_name` | Omnistrate metering bucket name         |
| `application_plane_customer_rdb_bucket_name` | Customer RDB storage bucket        |
| `create_pipelines_development`         | `true` to create the pipelines-dev project |

## GCS state

Prefix `org/workloads` in bucket `falkordb-dev-state-4620` (dev) or
`falkordb-prod-state-c49b` (prod). Pinned in `terragrunt.hcl` — no migration needed.

## Dependency on other org stacks

`org/gcp/workloads` depends on:
- `org/gcp/core` (provides `root_folder_id` → `parent_folder_id`)

Apply `org/gcp/core` first, then pass its `root_folder_id` output as
`parent_folder_id` to this stack.
