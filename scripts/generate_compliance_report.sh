#!/usr/bin/env bash
# generate_compliance_report.sh
#
# Generates a point-in-time SOC 2 compliance evidence folder by collecting:
#   1. Prowler HTML/JSON reports from the GCS Evidence Locker
#   2. Wazuh inventory and CVE exports via the Wazuh API
#   3. ThreatMapper network topology export via the ThreatMapper API
#   4. ThreatMapper topology diagram rendered as SVG via the report API
#
# Usage:
#   ./generate_compliance_report.sh [--date YYYY-MM-DD] [--output-dir DIR] [--bucket BUCKET]
#
# Prerequisites:
#   - gcloud CLI authenticated with access to the evidence locker bucket
#   - WAZUH_API_URL and WAZUH_API_TOKEN environment variables set
#   - THREATMAPPER_API_URL and THREATMAPPER_API_KEY environment variables set
#   - curl, jq installed
#
# Output structure:
#   <output-dir>/compliance-report-<date>/
#     ├── prowler/            — Prowler SOC 2 HTML + JSON reports
#     ├── wazuh/
#     │   ├── agents.json     — Active agent inventory
#     │   ├── cve-list.json   — Detected CVEs
#     │   └── fim-events.json — File integrity events (last 24h)
#     ├── threatmapper/
#     │   ├── topology.json   — Network topology & vulnerability map
#     │   ├── topology.svg    — Network topology diagram
#     │   └── vulnerabilities.json — Full vulnerability report
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
mkdir -p "${REPORT_DIR}"/{prowler,wazuh,threatmapper}

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
# 3. ThreatMapper Topology
# ------------------------------------------------------------------
echo "[3/4] Exporting ThreatMapper topology ..."
if [[ -n "${THREATMAPPER_API_URL:-}" && -n "${THREATMAPPER_API_KEY:-}" ]]; then
  TM_AUTH="Authorization: Bearer ${THREATMAPPER_API_KEY}"
  TM_TLS_OPTS=()
  if [[ -n "${THREATMAPPER_CA_BUNDLE:-}" ]]; then
    TM_TLS_OPTS=(--cacert "${THREATMAPPER_CA_BUNDLE}")
  fi

  # Network topology JSON
  curl -sS "${TM_TLS_OPTS[@]}" -H "${TM_AUTH}" \
    "${THREATMAPPER_API_URL}/deepfence/graph/topology" \
    | jq '.' > "${REPORT_DIR}/threatmapper/topology.json"
  echo "  ✓ Network topology JSON exported."

  # Vulnerability report
  curl -sS "${TM_TLS_OPTS[@]}" -H "${TM_AUTH}" \
    -H "Content-Type: application/json" \
    -d '{"filters":{"severity":["critical","high","medium","low"]},"window":{"duration":86400}}' \
    "${THREATMAPPER_API_URL}/deepfence/vulnerabilities" \
    | jq '.' > "${REPORT_DIR}/threatmapper/vulnerabilities.json"
  VULN_COUNT=$(jq '.data | length // 0' "${REPORT_DIR}/threatmapper/vulnerabilities.json" 2>/dev/null || echo 0)
  echo "  ✓ Vulnerability report: ${VULN_COUNT} findings."

  # Request topology diagram (PDF/SVG) via the report API.
  # ThreatMapper exposes /deepfence/report which generates a topology diagram.
  REPORT_RESPONSE=$(curl -sS "${TM_TLS_OPTS[@]}" -H "${TM_AUTH}" \
    -H "Content-Type: application/json" \
    -d '{"report_type":"topology","duration":{"number":24,"time_unit":"hour"},"filters":{}}' \
    "${THREATMAPPER_API_URL}/deepfence/reports" 2>/dev/null || true)

  REPORT_ID=$(echo "${REPORT_RESPONSE}" | jq -r '.report_id // empty' 2>/dev/null || true)
  if [[ -n "${REPORT_ID}" ]]; then
    echo "  ⏳ Waiting for topology diagram generation (report ${REPORT_ID})..."
    RETRIES=0
    while [[ $RETRIES -lt 30 ]]; do
      STATUS=$(curl -sS "${TM_TLS_OPTS[@]}" -H "${TM_AUTH}" \
        "${THREATMAPPER_API_URL}/deepfence/reports/${REPORT_ID}" \
        | jq -r '.status // "pending"' 2>/dev/null || echo "pending")
      if [[ "${STATUS}" == "complete" ]]; then
        # Download the generated report
        curl -sS "${TM_TLS_OPTS[@]}" -H "${TM_AUTH}" \
          -o "${REPORT_DIR}/threatmapper/topology.svg" \
          "${THREATMAPPER_API_URL}/deepfence/reports/${REPORT_ID}/download"
        echo "  ✓ Network topology diagram exported as SVG."
        break
      elif [[ "${STATUS}" == "error" ]]; then
        echo "  ⚠ Topology diagram generation failed. Skipping diagram."
        break
      fi
      RETRIES=$((RETRIES + 1))
      sleep 10
    done
    if [[ $RETRIES -ge 30 ]]; then
      echo "  ⚠ Topology diagram generation timed out. Skipping diagram."
    fi
  else
    echo "  ⚠ Could not initiate topology diagram report. Skipping diagram."
  fi
else
  echo "  ⚠ THREATMAPPER_API_URL / THREATMAPPER_API_KEY not set. Skipping ThreatMapper export."
fi

# ------------------------------------------------------------------
# 4. Metadata
# ------------------------------------------------------------------
PROWLER_FILE_COUNT=$(ls "${REPORT_DIR}/prowler/" 2>/dev/null | wc -l | tr -d ' ')
HAS_TOPOLOGY=$( [ -s "${REPORT_DIR}/threatmapper/topology.json" ] && echo "true" || echo "false" )
HAS_DIAGRAM=$( [ -s "${REPORT_DIR}/threatmapper/topology.svg" ] && echo "true" || echo "false" )

jq -n \
  --arg date "${DATE}" \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg generated_by "$(whoami)@$(hostname)" \
  --arg bucket "${BUCKET}" \
  --argjson prowler "${PROWLER_FILE_COUNT}" \
  --argjson agents "${AGENT_COUNT:-0}" \
  --argjson cves "${CVE_COUNT:-0}" \
  --argjson fim "${FIM_COUNT:-0}" \
  --argjson topology "${HAS_TOPOLOGY}" \
  --argjson vulns "${VULN_COUNT:-0}" \
  --argjson diagram "${HAS_DIAGRAM}" \
  '{
    report_date: $date,
    generated_at: $generated_at,
    generated_by: $generated_by,
    evidence_bucket: $bucket,
    components: {
      prowler: $prowler,
      wazuh_agents: $agents,
      wazuh_cves: $cves,
      wazuh_fim_events: $fim,
      threatmapper_topology: $topology,
      threatmapper_vulnerabilities: $vulns,
      threatmapper_topology_diagram: $diagram
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
