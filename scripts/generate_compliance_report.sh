#!/usr/bin/env bash
# generate_compliance_report.sh
#
# Generates a point-in-time SOC 2 compliance evidence folder by collecting:
#   1. Prowler HTML/JSON reports from the GCS Evidence Locker
#   2. Wazuh inventory and CVE exports via the Wazuh API
#
# Usage:
#   ./generate_compliance_report.sh [--date YYYY-MM-DD] [--output-dir DIR] [--bucket BUCKET]
#
# Prerequisites:
#   - gcloud CLI authenticated with access to the evidence locker bucket
#   - WAZUH_API_URL and WAZUH_API_TOKEN environment variables set
#   - curl, jq installed
#
# Output structure:
#   <output-dir>/compliance-report-<date>/
#     ├── prowler/            — Prowler SOC 2 HTML + JSON reports
#     ├── wazuh/
#     │   ├── agents.json     — Active agent inventory
#     │   ├── cve-list.json   — Detected CVEs
#     │   └── fim-events.json — File integrity events (last 24h)
#     └── metadata.json       — Report generation metadata

set -euo pipefail

# --- Defaults ---
DATE="${DATE:-$(date +%Y-%m-%d)}"
DATE_PATH="${DATE//-//}"          # 2025-01-15 → 2025/01/15
OUTPUT_DIR="${OUTPUT_DIR:-.}"
BUCKET="${BUCKET:-}"

# --- Parse arguments ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --date)      DATE="$2"; DATE_PATH="${DATE//-//}"; shift 2 ;;
    --output-dir) OUTPUT_DIR="$2"; shift 2 ;;
    --bucket)    BUCKET="$2"; shift 2 ;;
    -h|--help)
      head -22 "$0" | tail -20
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$BUCKET" ]]; then
  echo "Error: --bucket is required (or set BUCKET env var)." >&2
  exit 1
fi

REPORT_DIR="${OUTPUT_DIR}/compliance-report-${DATE}"
mkdir -p "${REPORT_DIR}"/{prowler,wazuh}

echo "=== SOC 2 Compliance Evidence Report ==="
echo "Date:       ${DATE}"
echo "Bucket:     ${BUCKET}"
echo "Output:     ${REPORT_DIR}"
echo ""

# ------------------------------------------------------------------
# 1. Prowler Reports
# ------------------------------------------------------------------
echo "[1/3] Downloading Prowler reports from gs://${BUCKET}/prowler/${DATE_PATH}/ ..."
if gcloud storage ls "gs://${BUCKET}/prowler/${DATE_PATH}/" &>/dev/null; then
  gcloud storage cp -r \
    "gs://${BUCKET}/prowler/${DATE_PATH}/*" \
    "${REPORT_DIR}/prowler/"
  echo "  ✓ Prowler reports downloaded."
else
  echo "  ⚠ No Prowler reports found for ${DATE}. Skipping."
fi

# ------------------------------------------------------------------
# 2. Wazuh Exports
# ------------------------------------------------------------------
echo "[2/3] Exporting Wazuh data via API ..."
if [[ -n "${WAZUH_API_URL:-}" && -n "${WAZUH_API_TOKEN:-}" ]]; then
  WAZUH_AUTH="Authorization: Bearer ${WAZUH_API_TOKEN}"
  # Use --cacert for custom CA, or set WAZUH_CA_BUNDLE env var.
  # Falls back to system CA bundle if neither is set.
  WAZUH_TLS_OPTS=()
  if [[ -n "${WAZUH_CA_BUNDLE:-}" ]]; then
    WAZUH_TLS_OPTS=(--cacert "${WAZUH_CA_BUNDLE}")
  fi

  # Agent inventory
  curl -sS "${WAZUH_TLS_OPTS[@]}" -H "${WAZUH_AUTH}" \
    "${WAZUH_API_URL}/agents?limit=500&status=active" \
    | jq '.' > "${REPORT_DIR}/wazuh/agents.json"
  AGENT_COUNT=$(jq '.data.total_affected_items // 0' "${REPORT_DIR}/wazuh/agents.json")
  echo "  ✓ Agent inventory: ${AGENT_COUNT} active agents."

  # CVE list
  curl -sS "${WAZUH_TLS_OPTS[@]}" -H "${WAZUH_AUTH}" \
    "${WAZUH_API_URL}/vulnerability?limit=1000" \
    | jq '.' > "${REPORT_DIR}/wazuh/cve-list.json"
  CVE_COUNT=$(jq '.data.total_affected_items // 0' "${REPORT_DIR}/wazuh/cve-list.json")
  echo "  ✓ CVE list: ${CVE_COUNT} vulnerabilities."

  # FIM events (last 24h)
  SINCE=$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%SZ)
  curl -sS "${WAZUH_TLS_OPTS[@]}" -H "${WAZUH_AUTH}" \
    "${WAZUH_API_URL}/syscheck?limit=1000&date_from=${SINCE}" \
    | jq '.' > "${REPORT_DIR}/wazuh/fim-events.json"
  FIM_COUNT=$(jq '.data.total_affected_items // 0' "${REPORT_DIR}/wazuh/fim-events.json")
  echo "  ✓ FIM events: ${FIM_COUNT} changes in last 24h."
else
  echo "  ⚠ WAZUH_API_URL / WAZUH_API_TOKEN not set. Skipping Wazuh export."
fi

# ------------------------------------------------------------------
# 3. Metadata
# ------------------------------------------------------------------
PROWLER_FILE_COUNT=$(ls "${REPORT_DIR}/prowler/" 2>/dev/null | wc -l | tr -d ' ')

jq -n \
  --arg date "${DATE}" \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg generated_by "$(whoami)@$(hostname)" \
  --arg bucket "${BUCKET}" \
  --argjson prowler "${PROWLER_FILE_COUNT}" \
  --argjson agents "${AGENT_COUNT:-0}" \
  --argjson cves "${CVE_COUNT:-0}" \
  --argjson fim "${FIM_COUNT:-0}" \
  '{
    report_date: $date,
    generated_at: $generated_at,
    generated_by: $generated_by,
    evidence_bucket: $bucket,
    components: {
      prowler: $prowler,
      wazuh_agents: $agents,
      wazuh_cves: $cves,
      wazuh_fim_events: $fim
    }
  }' > "${REPORT_DIR}/metadata.json"

echo ""
echo "=== Report generated: ${REPORT_DIR} ==="
echo ""
echo "Contents:"
find "${REPORT_DIR}" -type f | sort | while read -r f; do
  SIZE=$(wc -c < "$f" | tr -d ' ')
  echo "  ${f#${REPORT_DIR}/}  (${SIZE} bytes)"
done
