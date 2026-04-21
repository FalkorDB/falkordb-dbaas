#!/bin/sh
# Apply tofu/runtime/gcp/infra using a .tfvars file to populate the env vars
# that terragrunt.hcl expects via get_env().
#
# Usage:
#   ./scripts/tofu_apply_gcp_infra.sh terraform.dev.tfvars [terragrunt args...]
#   ./scripts/tofu_apply_gcp_infra.sh terraform.dev.tfvars --terragrunt-non-interactive
#   ./scripts/tofu_apply_gcp_infra.sh terraform.prod.tfvars plan

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INFRA_DIR="$SCRIPT_DIR/../tofu/runtime/gcp/infra"

TFVARS_FILE="$1"
if [ -z "$TFVARS_FILE" ]; then
  echo "Usage: $0 <tfvars-file> [terragrunt args...]"
  exit 1
fi
shift

# Resolve relative paths against infra dir
case "$TFVARS_FILE" in
  /*) ;;
  *) TFVARS_FILE="$INFRA_DIR/$TFVARS_FILE" ;;
esac

if [ ! -f "$TFVARS_FILE" ]; then
  echo "Error: tfvars file not found: $TFVARS_FILE"
  exit 1
fi

# Helper: extract a value from a .tfvars file by variable name.
# Strips surrounding quotes. Returns empty string if not found.
tfvar() {
  grep -E "^[[:space:]]*${1}[[:space:]]*=" "$TFVARS_FILE" \
    | sed -E 's/^[^=]+=[ \t]*//' \
    | sed 's/^"//; s/"$//' \
    | tr -d '\r'
}

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
export TERRAGRUNT_TFPATH="${TERRAGRUNT_TFPATH:-tofu}"

echo "Applying tofu/runtime/gcp/infra with:"
echo "  project : $TF_CTRL_PLANE_DEV_PROJECT_ID"
echo "  region  : $TF_CTRL_PLANE_DEV_REGION"
echo "  tfvars  : $TFVARS_FILE"
echo ""

cd "$INFRA_DIR"
exec terragrunt apply "$@"
