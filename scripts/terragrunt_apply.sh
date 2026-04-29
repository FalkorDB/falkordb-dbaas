#!/bin/sh
# Unified script for running OpenTofu/Terragrunt commands against any stack.
#
# Usage:
#   ./scripts/terragrunt_apply.sh <stack> <tfvars-file> [command] [extra-args...]
#
# Commands: apply (default), plan, destroy, output, state, import, show, etc.
#
# Examples:
#   ./scripts/terragrunt_apply.sh gcp-infra terraform.dev.tfvars
#   ./scripts/terragrunt_apply.sh gcp-infra terraform.dev.tfvars plan
#   ./scripts/terragrunt_apply.sh gcp-infra terraform.dev.tfvars output -raw wazuh_ip
#   ./scripts/terragrunt_apply.sh azure terraform.prod.tfvars apply -auto-approve
#   ./scripts/terragrunt_apply.sh aws-org terraform.dev.tfvars output
#
# Stacks:
#   gcp-infra       tofu/runtime/gcp/infra      (terragrunt + env vars)
#   gcp-k8s         tofu/runtime/gcp/k8s        (terragrunt + env vars)
#   azure           tofu/runtime/azure           (terragrunt + env vars + var-file)
#   gcp-core        tofu/org/gcp/core            (terragrunt + var-file)
#   gcp-workloads   tofu/org/gcp/workloads       (terragrunt + var-file)
#   gcp-bootstrap   tofu/bootstrap/gcp           (terragrunt + var-file)
#   aws-org         tofu/org/aws/org             (tofu + var-file)
#   aws-app-plane   tofu/org/aws/app-plane       (tofu + var-file)
#   aws-bootstrap   tofu/bootstrap/aws           (tofu + var-file)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

# ── argument parsing ──────────────────────────────────────────────────
STACK="$1"
TFVARS_ARG="$2"

if [ -z "$STACK" ] || [ -z "$TFVARS_ARG" ]; then
  echo "Usage: $0 <stack> <tfvars-file> [action] [extra-args...]"
  echo ""
  echo "Stacks:"
  echo "  gcp-infra       tofu/runtime/gcp/infra"
  echo "  gcp-k8s         tofu/runtime/gcp/k8s"
  echo "  azure           tofu/runtime/azure"
  echo "  gcp-core        tofu/org/gcp/core"
  echo "  gcp-workloads   tofu/org/gcp/workloads"
  echo "  gcp-bootstrap   tofu/bootstrap/gcp"
  echo "  aws-org         tofu/org/aws/org"
  echo "  aws-app-plane   tofu/org/aws/app-plane"
  echo "  aws-bootstrap   tofu/bootstrap/aws"
  exit 1
fi
shift 2

# Action defaults to "apply"; anything else is forwarded as extra flags.
ACTION="${1:-apply}"
if [ $# -gt 0 ]; then shift; fi

# ── stack → directory & tool mapping ──────────────────────────────────
case "$STACK" in
  gcp-infra)      STACK_DIR="$ROOT_DIR/tofu/runtime/gcp/infra" ; TOOL=terragrunt ;;
  gcp-k8s)        STACK_DIR="$ROOT_DIR/tofu/runtime/gcp/k8s"   ; TOOL=terragrunt ;;
  azure)          STACK_DIR="$ROOT_DIR/tofu/runtime/azure"      ; TOOL=terragrunt ;;
  gcp-core)       STACK_DIR="$ROOT_DIR/tofu/org/gcp/core"       ; TOOL=terragrunt ;;
  gcp-workloads)  STACK_DIR="$ROOT_DIR/tofu/org/gcp/workloads"  ; TOOL=terragrunt ;;
  gcp-bootstrap)  STACK_DIR="$ROOT_DIR/tofu/bootstrap/gcp"      ; TOOL=terragrunt ;;
  aws-org)        STACK_DIR="$ROOT_DIR/tofu/org/aws/org"         ; TOOL=tofu ;;
  aws-app-plane)  STACK_DIR="$ROOT_DIR/tofu/org/aws/app-plane"  ; TOOL=tofu ;;
  aws-bootstrap)  STACK_DIR="$ROOT_DIR/tofu/bootstrap/aws"      ; TOOL=tofu ;;
  *) echo "Error: unknown stack '$STACK'" >&2; exit 1 ;;
esac

# ── resolve tfvars path ───────────────────────────────────────────────
case "$TFVARS_ARG" in
  /*) TFVARS_FILE="$TFVARS_ARG" ;;
  *)  TFVARS_FILE="$STACK_DIR/$TFVARS_ARG" ;;
esac

if [ ! -f "$TFVARS_FILE" ]; then
  echo "Error: tfvars file not found: $TFVARS_FILE" >&2
  exit 1
fi

# ── helpers ───────────────────────────────────────────────────────────
# Extract a scalar value from a .tfvars file by variable name.
# Strips surrounding quotes. Returns empty string if not found.
tfvar() {
  grep -E "^[[:space:]]*${1}[[:space:]]*=" "$TFVARS_FILE" \
    | sed -E 's/^[^=]+=[ \t]*//' \
    | sed 's/^"//; s/"$//' \
    | tr -d '\r'
}

# ── export env vars for stacks whose terragrunt inputs use get_env() ─
case "$STACK" in
  gcp-infra)
    export TF_CTRL_PLANE_DEV_PROJECT_ID="$(tfvar project_id)"
    export TF_CTRL_PLANE_DEV_REGION="$(tfvar region)"
    export TF_CTRL_PLANE_DEV_ZONES="$(tfvar zones)"
    export TF_CTRL_PLANE_IP_RANGE_SUBNET="$(tfvar ip_range_subnet)"
    export TF_CTRL_PLANE_IP_RANGE_PODS="$(tfvar ip_range_pods)"
    export TF_CTRL_PLANE_IP_RANGE_SERVICES="$(tfvar ip_range_services)"
    export TF_DEFAULT_MAX_PODS_PER_NODE="$(tfvar default_max_pods_per_node)"
    export TF_DB_EXPORTER_SA_ID="$(tfvar db_exporter_sa_id)"
    export TF_OMNISTRATE_SERVICE_ID="$(tfvar omnistrate_service_id)"
    export TF_OMNISTRATE_ENVIRONMENT_ID="$(tfvar omnistrate_environment_id)"
    ;;
  gcp-k8s)
    export TF_CTRL_PLANE_DEV_PROJECT_ID="$(tfvar project_id)"
    export TF_CTRL_PLANE_DEV_REGION="$(tfvar region)"
    export TF_ENVIRONMENT="$(tfvar environment)"
    export TF_CLUSTER_ENDPOINT="$(tfvar cluster_endpoint)"
    export TF_CLUSTER_CA_CERTIFICATE="$(tfvar cluster_ca_certificate)"
    export TF_CLUSTER_NAME="$(tfvar cluster_name)"
    export TF_ARGOCD_ADMIN_PASSWORD="$(tfvar argocd_admin_password)"
    export TF_DEX_GOOGLE_CLIENT_ID="$(tfvar dex_google_client_id)"
    export TF_DEX_GOOGLE_CLIENT_SECRET="$(tfvar dex_google_client_secret)"
    export TF_DEX_GOOGLE_ADMIN_EMAIL="$(tfvar dex_google_admin_email)"
    export TF_ARGOCD_GROUPS_SA_JSON="$(tfvar argocd_groups_sa_json)"
    export TF_GRAFANA_GOOGLE_CLIENT_ID="$(tfvar grafana_google_client_id)"
    export TF_GRAFANA_GOOGLE_CLIENT_SECRET="$(tfvar grafana_google_client_secret)"
    export TF_DB_EXPORTER_SA_ID="$(tfvar db_exporter_sa_id)"
    export TF_ARGOCD_SA_ID="$(tfvar argocd_sa_id)"
    ;;
  azure)
    export TF_AZURE_SUBSCRIPTION_ID="$(tfvar subscription_id)"
    export TF_AZURE_TENANT_ID="$(tfvar tenant_id)"
    export TF_ENVIRONMENT="$(tfvar environment)"
    ;;
esac

# The root terragrunt.hcl reads TF_ENVIRONMENT for state-bucket selection.
# For stacks whose tfvars don't include an explicit "environment" key,
# infer dev/prod from the filename.
if [ -z "${TF_ENVIRONMENT:-}" ]; then
  case "$(basename "$TFVARS_FILE")" in
    *prod*) export TF_ENVIRONMENT="prod" ;;
    *)      export TF_ENVIRONMENT="dev"  ;;
  esac
fi

export TERRAGRUNT_TFPATH="${TERRAGRUNT_TFPATH:-tofu}"

# ── banner ────────────────────────────────────────────────────────────
echo "[$STACK] $ACTION"
echo "  directory   : $STACK_DIR"
echo "  tfvars      : $TFVARS_FILE"
echo "  environment : $TF_ENVIRONMENT"
echo "  tool        : $TOOL"
echo ""

# ── clean & init ──────────────────────────────────────────────────────
cd "$STACK_DIR"

echo "Cleaning cached state..."
rm -rf .terraform .terragrunt-cache
echo ""

echo "Initialising..."
if [ "$TOOL" = "terragrunt" ]; then
  terragrunt init
else
  tofu init
fi
echo ""

# ── exec ──────────────────────────────────────────────────────────────

# Only pass -var-file for commands that accept it.
case "$ACTION" in
  plan|apply|destroy|refresh|import|console) NEEDS_VARFILE=true ;;
  *) NEEDS_VARFILE=false ;;
esac

case "$STACK" in
  # Stacks where all vars are mapped through terragrunt inputs → no -var-file
  gcp-infra|gcp-k8s)
    exec terragrunt "$ACTION" "$@"
    ;;
  # Terragrunt stacks that need -var-file for vars not in inputs
  azure|gcp-core|gcp-workloads|gcp-bootstrap)
    if [ "$NEEDS_VARFILE" = true ]; then
      exec terragrunt "$ACTION" -var-file="$TFVARS_FILE" "$@"
    else
      exec terragrunt "$ACTION" "$@"
    fi
    ;;
  # AWS stacks use tofu directly (S3 backend, no terragrunt root)
  aws-org|aws-app-plane|aws-bootstrap)
    if [ "$NEEDS_VARFILE" = true ]; then
      exec tofu "$ACTION" -var-file="$TFVARS_FILE" "$@"
    else
      exec tofu "$ACTION" "$@"
    fi
    ;;
esac
