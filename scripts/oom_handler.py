#!/usr/bin/env python3
"""
OOM Killed Handler
Processes ContainerOOMKilled alerts by querying VictoriaMetrics to diagnose
the root cause (large query spike, legitimate growth, or memory fragmentation)
and sends a Google Chat notification with the diagnosis.
"""

import os
import sys
import re
import json
import requests
import argparse
import urllib3
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional
from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def mask_email(email: str) -> str:
    """Mask email address to protect PII (e.g., a****@gmail.com)"""
    if '@' not in email:
        return email
    local, domain = email.split('@', 1)
    if len(local) <= 1:
        masked_local = local
    else:
        masked_local = local[0] + '*' * (len(local) - 1)
    return f"{masked_local}@{domain}"


def bytes_to_mb(value: float) -> str:
    return f"{value / (1024 * 1024):.1f} MB"


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class CustomerInfo:
    email: str
    name: str
    subscription_id: str


@dataclass
class DiagnosisResult:
    """Holds all diagnostic findings for an OOMKilled event."""
    container: str

    # Scenario A
    scenario_a_confirmed: bool = False      # spike visible in metrics
    scenario_a_suspected: bool = False      # no metrics but no other cause found
    spike_ratio: Optional[float] = None
    memory_max_bytes: Optional[float] = None
    memory_min_bytes: Optional[float] = None

    # Scenario B
    scenario_b: bool = False
    fragmentation_ratio: Optional[float] = None

    # Scenario C
    scenario_c: bool = False
    growth_pct: Optional[float] = None
    recent_avg_bytes: Optional[float] = None
    baseline_avg_bytes: Optional[float] = None

    # Scenario D (non-service container)
    scenario_d: bool = False

    @property
    def any_scenario_triggered(self) -> bool:
        return (self.scenario_a_confirmed or self.scenario_a_suspected or
                self.scenario_b or self.scenario_c or self.scenario_d)


# ---------------------------------------------------------------------------
# Omnistrate client (copied verbatim from redis_crash_handler.py)
# ---------------------------------------------------------------------------

class OmnistrateClient:
    """Client for Omnistrate API"""

    def __init__(self, api_url: str, username: str, password: str,
                 service_id: str = None, environment_id: str = None,
                 verify_ssl: bool = True):
        self.api_url = api_url.rstrip('/')
        self.username = username
        self.password = password
        self.service_id = service_id
        self.environment_id = environment_id
        self.verify_ssl = verify_ssl
        self.token = None
        self._login()

    def _login(self):
        response = requests.post(
            f"{self.api_url}/signin",
            json={"email": self.username, "password": self.password},
            timeout=30,
            verify=self.verify_ssl,
        )
        response.raise_for_status()
        self.token = response.json()["jwtToken"]

    def _get_headers(self):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}",
        }

    def get_customer_info(self, namespace: str) -> CustomerInfo:
        if not self.service_id or not self.environment_id:
            raise ValueError("service_id and environment_id are required")

        fleet_url = (
            f"{self.api_url}/fleet/service/{self.service_id}"
            f"/environment/{self.environment_id}/instances"
        )
        params = {"Filter": "excludeCloudAccounts", "ExcludeDetail": "false", "pageSize": 100}

        matching_instance = None
        next_page_token = None

        while True:
            if next_page_token:
                params["nextPageToken"] = next_page_token
            response = requests.get(fleet_url, params=params,
                                    headers=self._get_headers(), timeout=30,
                                    verify=self.verify_ssl)
            response.raise_for_status()
            data = response.json()

            for instance in data.get("resourceInstances", []):
                nested = instance.get("consumptionResourceInstanceResult")
                instance_id = nested.get("id", "") if isinstance(nested, dict) else ""
                if instance_id == namespace:
                    matching_instance = instance
                    break

            if matching_instance:
                break

            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break

        if not matching_instance:
            raise ValueError(f"Instance not found for namespace: {namespace}")

        subscription_id = matching_instance.get("subscriptionId", "")
        subscription_owner_name = matching_instance.get("subscriptionOwnerName", "Unknown")

        users_url = f"{self.api_url}/fleet/users"
        users_params = {"pageSize": 100}
        next_page_token = None

        while True:
            if next_page_token:
                users_params["nextPageToken"] = next_page_token
            users_response = requests.get(users_url, params=users_params,
                                          headers=self._get_headers(), timeout=30,
                                          verify=self.verify_ssl)
            users_response.raise_for_status()
            users_data = users_response.json()

            for user in users_data.get("users", []):
                if user.get("userName") == subscription_owner_name:
                    return CustomerInfo(
                        email=user.get("email", "unknown@unknown.com"),
                        name=subscription_owner_name,
                        subscription_id=subscription_id,
                    )

            next_page_token = users_data.get("nextPageToken")
            if not next_page_token:
                break

        print(f"⚠️  User '{subscription_owner_name}' not found; using synthetic email",
              file=sys.stderr)
        return CustomerInfo(
            email=f"{subscription_owner_name}@internal.falkordb.com",
            name=subscription_owner_name,
            subscription_id=subscription_id,
        )


# ---------------------------------------------------------------------------
# VictoriaMetrics client
# ---------------------------------------------------------------------------

class VictoriaMetricsClient:
    """Client for VictoriaMetrics Prometheus-compatible query API via VMAuth."""

    def __init__(self, base_url: str, username: str, password: str,
                 verify_ssl: bool = True):
        self.base_url = base_url.rstrip('/')
        self.auth = (username, password)
        self.verify_ssl = verify_ssl

    def instant_query(self, promql: str) -> Optional[float]:
        """Run an instant query and return the first scalar result, or None."""
        response = requests.get(
            f"{self.base_url}/api/v1/query",
            params={"query": promql},
            auth=self.auth,
            timeout=30,
            verify=self.verify_ssl,
        )

        if response.status_code == 401:
            raise ValueError("Authentication failed for VictoriaMetrics. Check credentials.")
        if response.status_code == 403:
            raise ValueError("Access forbidden for VictoriaMetrics. Check credentials.")

        response.raise_for_status()
        data = response.json()

        results = data.get("data", {}).get("result", [])
        if not results:
            return None

        # Each result is {"metric": {...}, "value": [timestamp, "value_str"]}
        try:
            return float(results[0]["value"][1])
        except (KeyError, IndexError, ValueError):
            return None


# ---------------------------------------------------------------------------
# Diagnosis engine
# ---------------------------------------------------------------------------

def diagnose(vm: VictoriaMetricsClient, namespace: str, pod: str,
             container: str) -> DiagnosisResult:
    result = DiagnosisResult(container=container)

    # Non-FalkorDB containers → Scenario D only
    if container not in ("service", "falkordb"):
        result.scenario_d = True
        return result

    # --- Scenario A: spike detection (10-minute window) ---
    rss_labels = f'namespace="{namespace}", pod="{pod}", container="service"'
    mem_max = vm.instant_query(
        f'max_over_time(container_memory_rss{{{rss_labels}}}[10m])'
    )
    mem_min = vm.instant_query(
        f'min_over_time(container_memory_rss{{{rss_labels}}}[10m])'
    )

    result.memory_max_bytes = mem_max
    result.memory_min_bytes = mem_min

    if mem_max is not None and mem_min is not None and mem_min > 0:
        ratio = mem_max / mem_min
        result.spike_ratio = ratio
        if ratio > 1.3:
            result.scenario_a_confirmed = True

    # --- Scenario C: legitimate growth (30-day comparison) ---
    recent_avg = vm.instant_query(
        f'avg_over_time(container_memory_rss{{{rss_labels}}}[7d])'
    )
    baseline_avg = vm.instant_query(
        f'avg_over_time(container_memory_rss{{{rss_labels}}}[7d] offset 23d)'
    )

    result.recent_avg_bytes = recent_avg
    result.baseline_avg_bytes = baseline_avg

    if recent_avg is not None and baseline_avg is not None and baseline_avg > 0:
        growth_pct = ((recent_avg - baseline_avg) / baseline_avg) * 100
        result.growth_pct = growth_pct
        if growth_pct > 20:
            result.scenario_c = True

    # --- Scenario B: memory fragmentation (60-minute window) ---
    frag_labels = f'namespace="{namespace}", pod="{pod}"'
    frag_ratio = vm.instant_query(
        f'max_over_time(redis_mem_fragmentation_ratio{{{frag_labels}}}[60m])'
    )
    result.fragmentation_ratio = frag_ratio
    if frag_ratio is not None and frag_ratio > 1.5:
        result.scenario_b = True

    # --- Scenario A suspected: no metric data captures the spike ---
    # If no spike visible, no growth, no fragmentation → OOM was too fast to scrape
    if (not result.scenario_a_confirmed and
            not result.scenario_b and
            not result.scenario_c):
        result.scenario_a_suspected = True

    return result


# ---------------------------------------------------------------------------
# Google Chat notifier
# ---------------------------------------------------------------------------

class GoogleChatNotifier:

    def __init__(self, webhook_url: str, verify_ssl: bool = True):
        self.webhook_url = webhook_url
        self.verify_ssl = verify_ssl

    def _build_diagnosis_text(self, diag: DiagnosisResult) -> str:
        lines = []

        if diag.scenario_d:
            lines.append(
                "🔶 <b>Scenario D — Undersized Sidecar Container</b><br>"
                f"Container <code>{diag.container}</code> hit its memory limit. "
                "Review resource limits for this sidecar and open a PR to increase them."
            )
            return "<br><br>".join(lines)

        if diag.scenario_a_confirmed:
            spike_pct = f"{(diag.spike_ratio - 1) * 100:.0f}%" if diag.spike_ratio else "N/A"
            mem_max_str = bytes_to_mb(diag.memory_max_bytes) if diag.memory_max_bytes else "N/A"
            lines.append(
                f"🔴 <b>Scenario A — Large Query Spike (confirmed)</b><br>"
                f"Memory spiked <b>{spike_pct}</b> within 10 minutes "
                f"(peak: <b>{mem_max_str}</b>). "
                "A large query likely caused the OOM. Contact the customer to identify the query."
            )

        if diag.scenario_a_suspected:
            lines.append(
                "🔴 <b>Scenario A — Large Query Spike (suspected)</b><br>"
                "No memory spike was captured in metrics — the OOM happened too fast "
                "to be scraped (between two 30s scrape intervals). "
                "A single large query is the most likely cause. "
                "Contact the customer to identify queries running at the time of the alert."
            )

        if diag.scenario_c:
            growth_str = f"{diag.growth_pct:.1f}%" if diag.growth_pct is not None else "N/A"
            recent_str = bytes_to_mb(diag.recent_avg_bytes) if diag.recent_avg_bytes else "N/A"
            baseline_str = bytes_to_mb(diag.baseline_avg_bytes) if diag.baseline_avg_bytes else "N/A"
            lines.append(
                f"📈 <b>Scenario C — Legitimate Memory Growth</b><br>"
                f"Memory grew <b>{growth_str}</b> over 30 days "
                f"(recent 7-day avg: <b>{recent_str}</b> vs baseline: <b>{baseline_str}</b>). "
                "Instance size increase via Omnistrate UI is required (manual action)."
            )

        if diag.scenario_b:
            frag_str = f"{diag.fragmentation_ratio:.2f}" if diag.fragmentation_ratio else "N/A"
            lines.append(
                f"🟠 <b>Scenario B — Memory Fragmentation</b><br>"
                f"Fragmentation ratio: <b>{frag_str}</b> (threshold: 1.5). "
                "Restart the underlying VM from Omnistrate UI (manual action). "
                "Refer to ContainerMemoryHighRSSCritical runbook."
            )

        return "<br><br>".join(lines) if lines else "⚪ No scenario triggered."

    def send_notification(
        self,
        customer: CustomerInfo,
        pod: str,
        namespace: str,
        cluster: str,
        container: str,
        diag: DiagnosisResult,
        grafana_url: str,
        timestamp: str,
    ):
        diagnosis_text = self._build_diagnosis_text(diag)

        payload = {
            "text": f"🚨 ContainerOOMKilled — {pod} ({namespace})",
            "cards": [{
                "header": {
                    "title": "🚨 ContainerOOMKilled",
                    "subtitle": f"{pod} in {namespace} @ {cluster}",
                },
                "sections": [
                    {
                        "widgets": [
                            {"keyValue": {"topLabel": "Customer", "content": f"{customer.name} ({mask_email(customer.email)})"}},
                            {"keyValue": {"topLabel": "Subscription ID", "content": customer.subscription_id}},
                            {"keyValue": {"topLabel": "Cluster", "content": cluster}},
                            {"keyValue": {"topLabel": "Namespace", "content": namespace}},
                            {"keyValue": {"topLabel": "Pod", "content": pod}},
                            {"keyValue": {"topLabel": "Container", "content": container}},
                            {"keyValue": {"topLabel": "Time (Israel)", "content": timestamp}},
                        ]
                    },
                    {
                        "widgets": [{
                            "textParagraph": {
                                "text": f"<b>Diagnosis</b><br><br>{diagnosis_text}"
                            }
                        }]
                    },
                    {
                        "widgets": [{
                            "buttons": [{
                                "textButton": {
                                    "text": "View Memory in Grafana",
                                    "onClick": {"openLink": {"url": grafana_url}},
                                }
                            }]
                        }]
                    },
                ],
            }],
        }

        try:
            response = requests.post(self.webhook_url, json=payload, timeout=30,
                                     verify=self.verify_ssl)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"⚠️  Failed to send Google Chat notification: {e}", file=sys.stderr)

    def send_error_notification(self, error_message: str, pod: str,
                                namespace: str, cluster: str,
                                error_details: Optional[str] = None):
        payload = {
            "text": "❌ OOM Handler Failed",
            "cards": [{
                "header": {
                    "title": "❌ OOM Handler Failed",
                    "subtitle": f"Error processing OOM for {namespace}",
                },
                "sections": [{
                    "widgets": [
                        {"keyValue": {"topLabel": "Cluster", "content": cluster}},
                        {"keyValue": {"topLabel": "Pod", "content": pod}},
                        {"keyValue": {"topLabel": "Namespace", "content": namespace}},
                        {"keyValue": {"topLabel": "Error", "content": error_message}},
                    ]
                }],
            }],
        }

        if error_details:
            payload["cards"][0]["sections"].append({
                "widgets": [{
                    "textParagraph": {
                        "text": f"<b>Details:</b><br><code>{error_details[:500]}</code>"
                    }
                }]
            })

        try:
            response = requests.post(self.webhook_url, json=payload, timeout=30,
                                     verify=self.verify_ssl)
            response.raise_for_status()
        except Exception as e:
            print(f"⚠️  Failed to send error notification: {e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Grafana link generator
# ---------------------------------------------------------------------------

def build_grafana_memory_url(grafana_base: str, namespace: str, pod: str) -> str:
    """Build a Grafana Explore URL pre-filtered to the pod's memory metrics."""
    from urllib.parse import urlencode, quote
    expr = (
        f'container_memory_rss{{namespace="{namespace}", pod="{pod}"}}'
    )
    # Grafana Explore left parameter (simplified URL — opens metric explorer)
    params = {
        "orgId": "1",
        "left": json.dumps({
            "datasource": "VictoriaMetrics",
            "queries": [{"expr": expr, "refId": "A"}],
            "range": {"from": "now-1h", "to": "now"},
        }),
    }
    return f"{grafana_base.rstrip('/')}/explore?{urlencode(params)}"


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser():
    parser = argparse.ArgumentParser(description="Process ContainerOOMKilled alerts")
    parser.add_argument("--pod", required=True, help="Pod name")
    parser.add_argument("--namespace", required=True, help="Namespace (instance ID)")
    parser.add_argument("--cluster", required=True, help="Cluster name")
    parser.add_argument("--container", required=True, help="Container that was OOMKilled")
    parser.add_argument("--vmmetrics-url", required=True,
                        help="VMAuth URL for VictoriaMetrics query API")
    parser.add_argument("--grafana-url", required=True, help="Grafana base URL")
    return parser


def main(args):
    environment = os.environ.get("ENVIRONMENT", "prod").lower()
    disable_ssl_verify = os.environ.get("DISABLE_SSL_VERIFY", "false").lower() == "true"
    verify_ssl = not (environment == "dev" or disable_ssl_verify)

    if not verify_ssl:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        reasons = []
        if environment == "dev":
            reasons.append("ENVIRONMENT=dev")
        if disable_ssl_verify:
            reasons.append("DISABLE_SSL_VERIFY=true")
        print(
            f"⚠️  WARNING: SSL verification DISABLED ({', '.join(reasons)}). "
            "Development only.",
            file=sys.stderr,
        )

    required_env_vars = [
        "OMNISTRATE_API_URL", "OMNISTRATE_USERNAME", "OMNISTRATE_PASSWORD",
        "OMNISTRATE_SERVICE_ID", "OMNISTRATE_ENVIRONMENT_ID",
        "VMMETRICS_USERNAME", "VMMETRICS_PASSWORD",
        "GOOGLE_CHAT_WEBHOOK_URL",
    ]
    missing = [v for v in required_env_vars if not os.environ.get(v)]
    if missing:
        print(f"❌ Missing required environment variables: {', '.join(missing)}",
              file=sys.stderr)
        sys.exit(1)

    timestamp = datetime.now(ZoneInfo("Asia/Jerusalem")).strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'='*60}")
    print(f"OOM Handler: {args.pod} in {args.namespace} (container: {args.container})")
    print(f"{'='*60}\n")

    # Step 1: Customer info
    print("[1/4] Fetching customer information...")
    omnistrate = OmnistrateClient(
        api_url=os.environ["OMNISTRATE_API_URL"],
        username=os.environ["OMNISTRATE_USERNAME"],
        password=os.environ["OMNISTRATE_PASSWORD"],
        service_id=os.environ["OMNISTRATE_SERVICE_ID"],
        environment_id=os.environ["OMNISTRATE_ENVIRONMENT_ID"],
        verify_ssl=verify_ssl,
    )
    customer = omnistrate.get_customer_info(args.namespace)
    print(f"   Customer: {customer.name} ({mask_email(customer.email)})")

    # Step 2: Query VictoriaMetrics and diagnose
    print("[2/4] Querying VictoriaMetrics for diagnosis...")
    vm = VictoriaMetricsClient(
        base_url=args.vmmetrics_url,
        username=os.environ["VMMETRICS_USERNAME"],
        password=os.environ["VMMETRICS_PASSWORD"],
        verify_ssl=verify_ssl,
    )
    diag = diagnose(vm, args.namespace, args.pod, args.container)

    print(f"   Container: {diag.container}")
    print(f"   Scenario A confirmed: {diag.scenario_a_confirmed} (spike ratio: {diag.spike_ratio})")
    print(f"   Scenario A suspected: {diag.scenario_a_suspected}")
    print(f"   Scenario B: {diag.scenario_b} (fragmentation ratio: {diag.fragmentation_ratio})")
    print(f"   Scenario C: {diag.scenario_c} (growth: {diag.growth_pct}%)")
    print(f"   Scenario D: {diag.scenario_d}")

    # Step 3: Build Grafana link
    print("[3/4] Building Grafana link...")
    grafana_url = build_grafana_memory_url(args.grafana_url, args.namespace, args.pod)
    print(f"   {grafana_url}")

    # Step 4: Send Google Chat notification
    print("[4/4] Sending Google Chat notification...")
    notifier = GoogleChatNotifier(os.environ["GOOGLE_CHAT_WEBHOOK_URL"],
                                  verify_ssl=verify_ssl)
    notifier.send_notification(
        customer=customer,
        pod=args.pod,
        namespace=args.namespace,
        cluster=args.cluster,
        container=args.container,
        diag=diag,
        grafana_url=grafana_url,
        timestamp=timestamp,
    )
    print("   Notification sent.")

    print(f"\n{'='*60}")
    print("✅ OOM handling complete!")
    print(f"{'='*60}")


if __name__ == "__main__":
    pod = namespace = cluster = None
    google_chat_webhook = None
    verify_ssl = True

    try:
        parser = _build_parser()
        args = parser.parse_args()

        pod = args.pod
        namespace = args.namespace
        cluster = args.cluster
        google_chat_webhook = os.environ.get("GOOGLE_CHAT_WEBHOOK_URL")

        environment = os.environ.get("ENVIRONMENT", "prod").lower()
        disable_ssl_verify = os.environ.get("DISABLE_SSL_VERIFY", "false").lower() == "true"
        verify_ssl = not (environment == "dev" or disable_ssl_verify)

        main(args)
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        import traceback
        error_details = traceback.format_exc()
        print(error_details, file=sys.stderr)

        if google_chat_webhook and pod and namespace and cluster:
            try:
                notifier = GoogleChatNotifier(google_chat_webhook, verify_ssl=verify_ssl)
                notifier.send_error_notification(
                    error_message=error_msg,
                    pod=pod,
                    namespace=namespace,
                    cluster=cluster,
                    error_details=error_details,
                )
                print("Error notification sent to Google Chat.")
            except Exception as notify_error:
                print(f"⚠️  Failed to send error notification: {notify_error}",
                      file=sys.stderr)

        sys.exit(1)
