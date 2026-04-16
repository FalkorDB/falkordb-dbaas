# falkordb-dbaas

Platform monorepo for FalkorDB's cloud offering.  
Contains infrastructure (OpenTofu / Terragrunt), GitOps manifests (ArgoCD / kustomize), backend services, and the auth-proxy frontend.

---

## Repository layout

```
.
├── argocd/
│   ├── apps/          # ArgoCD Application CRDs (one file per service per env)
│   │   ├── ctrl-plane/
│   │   │   ├── dev/
│   │   │   └── prod/
│   │   └── app-plane/
│   └── kustomize/     # Workload manifests — base + overlays/dev + overlays/prod
│       ├── alert-silence-syncer/
│       ├── auth-proxy/
│       ├── cluster-discovery/
│       ├── customer-ldap-api/
│       ├── db-importer/
│       └── db-importer-worker/
├── backend/           # pnpm monorepo — backend services
│   ├── services/
│   │   ├── alert-silence-syncer/
│   │   ├── cluster-discovery/
│   │   ├── customer-ldap/
│   │   ├── db-importer/
│   │   ├── db-importer-worker/
│   │   └── marketplace-integration/
│   └── libs/
├── frontend/          # pnpm monorepo — auth-proxy Next.js app
├── tofu/              # OpenTofu stacks managed by Terragrunt
│   ├── terragrunt.hcl         # root config (state bucket, env mapping)
│   ├── bootstrap/             # run-once bootstrapping (seed project, state bucket)
│   ├── org/                   # GCP org / folder / project structure; AWS org
│   └── runtime/               # Live cluster infrastructure
│       ├── gcp/infra/         # VPC, GKE, IAM, Artifact Registry, Workflows
│       ├── gcp/k8s/           # ArgoCD, Grafana, Workload Identity
│       └── azure/             # Azure landing zone + AKS auth
├── observability/     # Grafana dashboards and VictoriaMetrics alert rules
└── scripts/           # Operational helper scripts
    └── tests/         # Integration tests
```

---

## Branch model

| Branch | Environment | GCS state bucket |
|--------|------------|-----------------|
| `dev`  | dev cluster | `falkordb-dev-state-4620` |
| `main` | prod cluster | `falkordb-prod-state-c49b` |

Both branches are protected. All work is done on feature branches and merged via PR.

---

## Prerequisites

| Tool | Min version | Purpose |
|------|------------|---------|
| [OpenTofu](https://opentofu.org/docs/intro/install/) | `~> 1.8` | Infrastructure-as-code |
| [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/) | `0.77` | Orchestrate OpenTofu stacks |
| [gcloud CLI](https://cloud.google.com/sdk/docs/install) | any | GCP authentication |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | any | Cluster access |
| [pnpm](https://pnpm.io/installation) | `9` | JS package manager |
| Node.js | `22+` (frontend) / `24+` (backend) | Runtime |

---

## Developer flows

### 1. Changing a backend or frontend service

```
feature/my-change
  │
  ├─ make code changes
  ├─ cd backend && pnpm changeset     # describe the change (patch/minor/major)
  │   creates backend/.changeset/abc123.md
  └─ open PR → merge to dev
```

On merge to `dev`:

1. `build-backends.yaml` builds and pushes:
   - `<service>:<version>-dev.<run_number>` (e.g. `db-importer:1.2.0-dev.47`)
   - `<service>:sha-<short-sha>`
2. ArgoCD Image Updater detects the new semver pre-release tag and updates `argocd/kustomize/<service>/overlays/dev/kustomization.yaml` automatically via a `dev`-branch commit.
3. ArgoCD reconciles — no manual image tag updates needed.

On merge to `main` (via a `dev → main` PR):

- Image is tagged `<version>` (e.g. `db-importer:1.2.0`)
- Image Updater updates the `prod` overlay

**Version bump PR** — the `Changesets` workflow opens a "Version Packages" PR on every push to `dev`/`main` that contains changeset files. Merging that PR bumps `package.json` and writes `CHANGELOG.md`. The next CI run picks up the new version for image tagging.

To add a changeset:
```bash
cd backend   # or frontend
pnpm changeset
# answer the prompts, commit the generated .changeset/*.md file with your PR
```

---

### 2. Changing infrastructure (OpenTofu / Terragrunt)

#### Environment variables required

| Variable | Description |
|----------|-------------|
| `TF_ENVIRONMENT` | `dev` or `prod` |
| `TF_STATE_BUCKET` | Override state bucket (optional; auto-selected by `TF_ENVIRONMENT`) |
| `TF_CTRL_PLANE_DEV_PROJECT_ID` | GCP project ID |
| `TF_CTRL_PLANE_DEV_REGION` | GCP region (e.g. `us-central1`) |
| `TF_CTRL_PLANE_DEV_ZONES` | Comma-separated zones (e.g. `["us-central1-a","us-central1-b"]`) |

See each stack's `terragrunt.hcl` for the full variable list.

#### Run a plan locally

```bash
# Authenticate
gcloud auth application-default login

export TF_ENVIRONMENT=dev
export TF_CTRL_PLANE_DEV_PROJECT_ID=<project-id>
# ... set all required vars

# Plan a single stack
cd tofu/runtime/gcp/infra
terragrunt plan

# Plan all runtime stacks
cd tofu
terragrunt run-all plan --terragrunt-working-dir runtime
```

#### Stack dependency order

```
bootstrap/   (run once, manually)
    └── org/
            └── runtime/
```

`runtime/gcp/k8s` depends on `runtime/gcp/infra` — Terragrunt resolves this automatically via the `dependency` block.

#### Tofu stack layout

| Stack | Path | What it manages |
|-------|------|----------------|
| GCP bootstrap | `bootstrap/gcp/` | Seed project, state bucket |
| GCP org / core | `org/gcp/core/` | Org policies, shared monitoring, billing |
| GCP workloads | `org/gcp/workloads/` | Folder hierarchy, control-plane + app-plane projects |
| GCP infra | `runtime/gcp/infra/` | VPC, GKE cluster, IAM SAs, Artifact Registry, Workflows |
| GCP k8s | `runtime/gcp/k8s/` | ArgoCD bootstrap, Grafana secrets, Workload Identity |
| Azure | `runtime/azure/` | Azure landing zone, AKS auth |
| AWS org | `org/aws/org/` | AWS Organizations setup |
| AWS app-plane | `org/aws/app-plane/` | App-plane IAM, infrastructure per region |

See each stack's `README.md` for inputs and outputs.

---

### 3. Deploying a GitOps change (ArgoCD / kustomize)

Structure of each workload under `argocd/kustomize/<service>/`:

```
base/                  # canonical deployment, service, configmap
overlays/
  dev/                 # dev-specific patches (image tag, replica count, env)
  prod/                # prod-specific patches
```

**To add a new service:**

1. Create `argocd/kustomize/<service>/base/` with the Kubernetes manifests.
2. Create `overlays/dev/` and `overlays/prod/` with kustomization patches.
3. Create `argocd/apps/ctrl-plane/dev/<service>.yaml` (and `prod/`) as an ArgoCD `Application` CRD pointing to the overlay path.
4. Add Image Updater annotations if the service image is managed by CI:
   ```yaml
   annotations:
     argocd-image-updater.argoproj.io/image-list: "alias=<registry>/<service>"
     argocd-image-updater.argoproj.io/alias.update-strategy: semver
     argocd-image-updater.argoproj.io/alias.allow-tags: regexp:^[0-9]+\.[0-9]+\.[0-9]+-dev\.[0-9]+$
     argocd-image-updater.argoproj.io/write-back-method: git
     argocd-image-updater.argoproj.io/git-branch: dev
   ```
5. Validate before opening a PR:
   ```bash
   kubectl kustomize argocd/kustomize/<service>/overlays/dev
   kubectl kustomize argocd/kustomize/<service>/overlays/prod
   ```
   The `validate-kustomize.yaml` CI workflow runs this on every PR automatically.

---

### 4. Dependency updates (Renovate)

Renovate runs every Monday and opens grouped PRs for:
- npm minor/patch updates (both monorepos)
- GitHub Actions pin updates
- OpenTofu provider version bumps (`versions.tf`)
- Docker base image updates
- Helm chart version bumps in ArgoCD CRDs
- Terragrunt version bumped in CI workflows

Review and merge these PRs on `dev`; they flow to `main` normally.

---

## CI workflows

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `build-backends.yaml` | Push / PR to `backend/` | Build, test, Grype scan, push image (immutable tag) |
| `build-frontends.yaml` | Push / PR to `frontend/` | Build, Grype scan, push image (immutable tag) |
| `changesets.yaml` | Push to `dev`/`main` with changeset files | Open/update "Version Packages" PR |
| `tofu-plan.yaml` | PR touching `tofu/` | `terragrunt run-all plan` on `runtime/` |
| `tofu-apply.yaml` | Push to `dev`/`main` touching `tofu/` | `terragrunt run-all apply` on `runtime/` |
| `validate-kustomize.yaml` | PR touching `argocd/` | `kubectl kustomize` build validation |
| `renovate.yaml` | Weekly schedule / manual | Dependency update PRs |
| `alert-rules-test.yaml` | PR touching `observability/` | Lint and test alert rules |

---

## Secrets reference

All secrets are stored in GitHub Environments (`dev` and `prod`).  
See `.github/workflows/build-backends.yaml` for the full list referenced in CI.

Key secrets:

| Secret | Used by |
|--------|---------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | All GCP workflows (keyless auth) |
| `GCP_SERVICE_ACCOUNT` | All GCP workflows |
| `TF_CTRL_PLANE_PROJECT_ID` | Image push, Tofu |
| `TF_STATE_BUCKET` | Tofu apply |
| `RENOVATE_TOKEN` | Renovate workflow (falls back to `GITHUB_TOKEN`) |

---

## Useful scripts

```bash
scripts/gcp_update_kubeconfig.sh <cluster-name> <region> <project>
scripts/kubectl_connect_grafana.sh        # port-forward Grafana
scripts/kubectl_connect_alertmanager.sh   # port-forward Alertmanager
scripts/add_cluster.sh                    # register a new app-plane cluster in ArgoCD
scripts/seal_env.sh                       # encrypt secrets with Sealed Secrets
```

