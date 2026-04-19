# FalkorDB DBaaS — Frontend

Turborepo (pnpm) monorepo containing the **auth-proxy** web application and shared packages.

## Apps and Packages

| Path | Description |
|---|---|
| `apps/auth-proxy` | Next.js 16 portal — authentication, organization management, and Grafana proxy for the FalkorDB cloud |
| `packages/ui` | Shared React component library (MUI + Tailwind) |
| `packages/eslint-config` | Shared ESLint configuration |
| `packages/typescript-config` | Shared `tsconfig` bases |

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 (22.x recommended) |
| pnpm | 9.x (`corepack enable`) |

## Local Development

```bash
cd frontend
pnpm install
pnpm dev          # starts auth-proxy on http://localhost:3000
```

To work on a single app only:

```bash
pnpm --filter auth-proxy dev
```

## Build

```bash
pnpm build        # Turborepo builds all apps and packages
pnpm check-types  # TypeScript type checking across all packages
pnpm lint         # ESLint across all packages
```

## Release Flow

Releases follow the [Changesets](https://github.com/changesets/changesets) workflow:

1. **Describe the change** — after making code changes, run:

   ```bash
   pnpm changeset
   # select changed packages, bump type (patch/minor/major), write summary
   ```

2. **Commit and open a PR** targeting `dev`.

3. **Merge the PR** — the `changesets.yaml` workflow automatically opens a **Version PR** that bumps `package.json` versions and updates `CHANGELOG.md`.

4. **Merge the Version PR** — the `build-frontends.yaml` CI workflow:
   - Builds and pushes `auth-proxy` Docker image tagged `<version>-dev.<run>` (dev) or `<version>` (main).
   - Image is pushed to `us-central1-docker.pkg.dev/<project>/frontend/auth-proxy-web`.

5. **ArgoCD Image Updater** detects the new semver tag and rolls it out automatically to the cluster.

> Image Updater configuration lives in [argocd/apps/ctrl-plane/dev/auth-proxy.yaml](../argocd/apps/ctrl-plane/dev/auth-proxy.yaml).

## Docker Image

| Registry | Path |
|---|---|
| Dev | `us-central1-docker.pkg.dev/ctrl-plane-dev-f7a2434f/frontend/auth-proxy-web` |
| Prod | `us-central1-docker.pkg.dev/ctrl-plane-prod-<id>/frontend/auth-proxy-web` |

Tag format: `<semver>-dev.<run_number>` on dev, `<semver>` on main, `sha-<git_sha>` always pushed.

## Environment Variables

Auth-proxy reads `NEXT_PUBLIC_*` variables at build time and server-side `AUTH_*` / `NEXTAUTH_*` variables at runtime.
These are injected via GitHub Actions environments (`dev` / `prod`) and Kubernetes secrets.

See `frontend/apps/auth-proxy/.env.example` (if present) or the GitHub Actions workflow for the full list.


