#!/usr/bin/env bash
# decommission-observability-stack.sh
#
# Phase 2 of the GitOps restructure (issue #709):
# Safely removes the catch-all observability-stack ArgoCD Application from a
# cluster after all managed workloads have been migrated to their own Application CRDs.
#
# Prerequisites:
#   - All services that were in manifests/ have their own ArgoCD Applications
#     that are Synced/Healthy (auth-proxy, alert-silence-syncer, db-importer,
#     db-importer-worker — and any others you migrated)
#   - prune: false is still set on observability-stack (set in Phase 0 PR)
#   - kubectl context is pointing at the correct cluster
#
# Usage:
#   ./scripts/decommission-observability-stack.sh
#   ARGOCD_SERVER=<host> ARGOCD_AUTH_TOKEN=<token> ./scripts/decommission-observability-stack.sh
#
# The script:
#   1. Checks that observability-stack exists on the cluster
#   2. Confirms all remaining resources in manifests/ are static cluster-scoped
#      items (Namespace, Ingress, SealedSecrets — not app workloads)
#   3. Removes the ArgoCD finalizer from the Application so deletion does NOT
#      cascade to live Kubernetes resources
#   4. Deletes the Application CRD from the cluster
#
# After running this script (once per environment), also delete the corresponding
# manifests.yaml file from the repo:
#   git rm argocd/apps/ctrl-plane/dev/manifests.yaml    # dev cluster
#   git rm argocd/apps/ctrl-plane/prod/manifests.yaml   # prod cluster

set -euo pipefail

APP_NAME="observability-stack"
NAMESPACE="argocd"

echo "=> Checking current ArgoCD Application status for '${APP_NAME}'..."
kubectl get application "${APP_NAME}" -n "${NAMESPACE}" -o wide

echo ""
echo "=> Current resources tracked by ${APP_NAME}:"
kubectl get application "${APP_NAME}" -n "${NAMESPACE}" \
  -o jsonpath='{range .status.resources[*]}{.kind}{"\t"}{.namespace}{"\t"}{.name}{"\n"}{end}' | sort

echo ""
read -rp "Are all listed resources safe to untrack (no running app workloads)? [y/N] " confirm
if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
  echo "Aborted. Migrate remaining workloads before decommissioning the catch-all."
  exit 1
fi

echo ""
echo "=> Removing finalizer from '${APP_NAME}' (prevents resource cascade on deletion)..."
kubectl patch application "${APP_NAME}" -n "${NAMESPACE}" \
  -p '{"metadata":{"finalizers":[]}}' --type=merge

echo "=> Deleting Application '${APP_NAME}'..."
kubectl delete application "${APP_NAME}" -n "${NAMESPACE}"

echo ""
echo "Done. The catch-all Application has been removed."
echo ""
echo "Next steps:"
echo "  1. Verify all individual Applications are Synced/Healthy in ArgoCD UI"
echo "  2. Delete the manifests.yaml file from the repo for this environment:"
echo "       git rm argocd/apps/ctrl-plane/<env>/manifests.yaml"
echo "       git commit -m 'chore(gitops): decommission observability-stack catch-all Application (<env>)'"
