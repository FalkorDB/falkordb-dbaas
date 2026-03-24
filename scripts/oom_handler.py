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
from enum import Enum
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


class OOMCause(str, Enum):
    LEGITIMATE_GROWTH = "LEGITIMATE_GROWTH"
    FRAGMENTATION = "FRAGMENTATION"
    SPIKE = "SPIKE"
    UNKNOWN = "UNKNOWN"


@dataclass
class DiagnosisResult:
    """Holds all diagnostic findings for an OOMKilled event."""
    container: str

    # Primary conclusion — exactly one
    cause: OOMCause = OOMCause.UNKNOWN

    # Sidecar / false-positive handling (unchanged)
    scenario_d: bool = False
    false_positive_sidecar: bool = False
    actual_container: str = "service"

    # OOM anchor
    seconds_since_oom: Optional[int] = None

    # Memory context
    container_limit_bytes: Optional[float] = None
    memory_at_oom_bytes: Optional[float] = None    # 5m avg at OOM time
    memory_pct_of_limit: Optional[float] = None    # 0–100

    # Growth signals: 5m avg at OOM and at 1h / 4h / 12h before OOM
    rss_1h_ago: Optional[float] = None
    rss_4h_ago: Optional[float] = None
    rss_12h_ago: Optional[float] = None
    # Growth rate expressed as % of the container limit per hour
    growth_rate_1h: Optional[float] = None
    growth_rate_4h: Optional[float] = None
    growth_rate_12h: Optional[float] = None

    # Fragmentation signals: point values at ~20m, ~10m, and at OOM
    frag_at_20m: Optional[float] = None
    frag_at_10m: Optional[float] = None
    frag_at_oom: Optional[float] = None

    # Spike signals: max/min in 2m window anchored at OOM time
    spike_ratio: Optional[float] = None
    memory_max_bytes: Optional[float] = None
    memory_min_bytes: Optional[float] = None


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

# Thresholds
_NEAR_LIMIT_PCT = 80           # memory must be >= this % of limit for growth/frag to apply
_GROWTH_RATE_THRESHOLD = 3     # % of container limit per hour — minimum to count as growth
_GROWTH_CONSISTENCY_RATIO = 3  # max/min rate ratio — above this the increase is a spike, not growth
_FRAG_THRESHOLD = 1.5          # fragmentation ratio threshold
_SPIKE_RATIO_THRESHOLD = 1.10  # max/min RSS in 2 min window; >= 10% jump signals a spike


def _fmt(v: Optional[float]) -> str:
    return f"{v:.2f}" if v is not None else "N/A"


def diagnose(vm: VictoriaMetricsClient, namespace: str, pod: str,
             container: str) -> DiagnosisResult:
    result = DiagnosisResult(container=container)

    # -----------------------------------------------------------------------
    # Non-service containers: check if the service container was the real OOM
    # victim (stale last_terminated_reason fires the alert on sidecars too).
    # -----------------------------------------------------------------------
    if container not in ("service", "falkordb"):
        service_oom_labels = f'namespace="{namespace}", pod="{pod}", container="service", reason="OOMKilled"'
        service_was_oom = vm.instant_query(
            f'kube_pod_container_status_last_terminated_reason{{{service_oom_labels}}}'
        )
        if service_was_oom and service_was_oom == 1.0:
            print(f"   ⚠️  Sidecar alert is a false positive — service was the real OOM victim.",
                  file=sys.stderr)
            result.false_positive_sidecar = True
            result.actual_container = "service"
            # Fall through to full diagnosis for the service container
        else:
            result.scenario_d = True
            return result

    rss_labels   = f'namespace="{namespace}", pod="{pod}", container="service"'
    frag_labels  = f'namespace="{namespace}", pod="{pod}"'
    limit_labels = f'namespace="{namespace}", pod="{pod}", container="service", resource="memory"'
    term_ts_labels = f'namespace="{namespace}", pod="{pod}", container="service"'

    # -----------------------------------------------------------------------
    # Step 1: OOM timestamp — required to anchor all queries before restart
    # -----------------------------------------------------------------------
    oom_timestamp = vm.instant_query(
        f'kube_pod_container_status_last_terminated_timestamp{{{term_ts_labels}}}'
    )
    if oom_timestamp is None:
        print("   ⚠️  Could not fetch OOM timestamp; returning UNKNOWN.", file=sys.stderr)
        return result  # cause stays UNKNOWN

    now_ts = datetime.now(timezone.utc).timestamp()
    N = max(0, int(now_ts - oom_timestamp))   # seconds since OOM
    result.seconds_since_oom = N

    # -----------------------------------------------------------------------
    # Step 2: Container limit and memory at OOM time
    # -----------------------------------------------------------------------
    limit = vm.instant_query(f'kube_pod_container_resource_limits{{{limit_labels}}}')
    result.container_limit_bytes = limit

    # 5-min avg anchored at OOM time — representative value without restart noise
    rss_at_oom = vm.instant_query(
        f'avg_over_time(container_memory_rss{{{rss_labels}}}[5m] offset {N}s)'
    )
    result.memory_at_oom_bytes = rss_at_oom

    near_limit = False
    if limit and limit > 0 and rss_at_oom is not None:
        result.memory_pct_of_limit = rss_at_oom / limit * 100
        near_limit = result.memory_pct_of_limit >= _NEAR_LIMIT_PCT

    # -----------------------------------------------------------------------
    # Step 3: Growth signals
    # 5-min avg snapshots at 1h, 4h, 12h before OOM, all anchored pre-restart.
    # Growth rate = (rss_at_oom - rss_Xh_ago) / X / limit * 100  [%/h of limit]
    # Consistent gradual growth across all windows → LEGITIMATE_GROWTH.
    # -----------------------------------------------------------------------
    rss_1h_ago  = vm.instant_query(f'avg_over_time(container_memory_rss{{{rss_labels}}}[5m] offset {N + 3600}s)')
    rss_4h_ago  = vm.instant_query(f'avg_over_time(container_memory_rss{{{rss_labels}}}[5m] offset {N + 4*3600}s)')
    rss_12h_ago = vm.instant_query(f'avg_over_time(container_memory_rss{{{rss_labels}}}[5m] offset {N + 12*3600}s)')
    result.rss_1h_ago  = rss_1h_ago
    result.rss_4h_ago  = rss_4h_ago
    result.rss_12h_ago = rss_12h_ago

    growth_rates: list[float] = []
    if limit and limit > 0 and rss_at_oom is not None:
        for hours, rss_ago in [(1, rss_1h_ago), (4, rss_4h_ago), (12, rss_12h_ago)]:
            if rss_ago is not None:
                rate = (rss_at_oom - rss_ago) / hours / limit * 100
                growth_rates.append(rate)
                if hours == 1:
                    result.growth_rate_1h = rate
                elif hours == 4:
                    result.growth_rate_4h = rate
                else:
                    result.growth_rate_12h = rate

    # "Consistent" means:
    #   1) at least 2 windows have data
    #   2) every rate is above the minimum threshold (avoiding negative/oscillating memory)
    #   3) the highest rate is within _GROWTH_CONSISTENCY_RATIO × the lowest rate.
    #      Gradual growth → rates are similar across windows (ratio ≈ 1–2).
    #      A spike at OOM → rate_1h >> rate_12h (ratio easily 10–15×) and would be
    #      misclassified as growth without this guard.
    consistent_growth = (
        len(growth_rates) >= 2
        and all(r >= _GROWTH_RATE_THRESHOLD for r in growth_rates)
        and max(growth_rates) / min(growth_rates) <= _GROWTH_CONSISTENCY_RATIO
    )

    # -----------------------------------------------------------------------
    # Step 4: Fragmentation signals — point values at ~20m, ~10m, at OOM
    # Using instant values (no range aggregation) to see the timeline clearly.
    # Only meaningful when memory is near the container limit.
    # -----------------------------------------------------------------------
    frag_20m = vm.instant_query(f'redis_mem_fragmentation_ratio{{{frag_labels}}} offset {N + 20*60}s')
    frag_10m = vm.instant_query(f'redis_mem_fragmentation_ratio{{{frag_labels}}} offset {N + 10*60}s')
    frag_oom = vm.instant_query(f'redis_mem_fragmentation_ratio{{{frag_labels}}} offset {N}s')
    result.frag_at_20m = frag_20m
    result.frag_at_10m = frag_10m
    result.frag_at_oom = frag_oom

    frag_values = [f for f in [frag_20m, frag_10m, frag_oom] if f is not None]
    frag_high      = any(f > _FRAG_THRESHOLD for f in frag_values)
    # Increasing: last available value is higher than first (upward trend)
    frag_increasing = len(frag_values) >= 2 and frag_values[-1] > frag_values[0]
    sustained_fragmentation = near_limit and frag_high and (frag_increasing or all(f > _FRAG_THRESHOLD for f in frag_values))

    # -----------------------------------------------------------------------
    # Step 5: Spike signal — max/min in a 2-minute window anchored at OOM time
    # A ratio ≥ 1.10 (10% jump) within that window strongly suggests a spike.
    # May be missed when the OOM happens between two scrape intervals.
    # -----------------------------------------------------------------------
    mem_max = vm.instant_query(f'max_over_time(container_memory_rss{{{rss_labels}}}[2m] offset {N}s)')
    mem_min = vm.instant_query(f'min_over_time(container_memory_rss{{{rss_labels}}}[2m] offset {N}s)')
    result.memory_max_bytes = mem_max
    result.memory_min_bytes = mem_min

    spike_detected = False
    if mem_max is not None and mem_min is not None and mem_min > 0:
        result.spike_ratio = mem_max / mem_min
        spike_detected = result.spike_ratio >= _SPIKE_RATIO_THRESHOLD

    # -----------------------------------------------------------------------
    # Step 6: Decision — pick exactly one cause, most reliable signal wins
    # Priority: LEGITIMATE_GROWTH > FRAGMENTATION > SPIKE > UNKNOWN
    # -----------------------------------------------------------------------
    if near_limit and consistent_growth:
        result.cause = OOMCause.LEGITIMATE_GROWTH
    elif sustained_fragmentation:
        result.cause = OOMCause.FRAGMENTATION
    elif spike_detected:
        result.cause = OOMCause.SPIKE
    else:
        result.cause = OOMCause.UNKNOWN

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

        if diag.false_positive_sidecar:
            lines.append(
                f"⚠️ <b>Note: Alert fired on <code>{diag.container}</code> (sidecar) but "
                f"the <code>service</code> container was the real OOM victim.</b><br>"
                "The sidecar's <code>last_terminated_reason=OOMKilled</code> was stale from a previous event. "
                "Full diagnosis below is for the <code>service</code> container."
            )

        if diag.scenario_d:
            lines.append(
                "🔶 <b>Undersized Sidecar Container</b><br>"
                f"Container <code>{diag.container}</code> hit its memory limit. "
                "Review resource limits for this sidecar and open a PR to increase them."
            )
            return "<br><br>".join(lines)

        # --- Memory context header (always shown) ---
        limit_str  = bytes_to_mb(diag.container_limit_bytes) if diag.container_limit_bytes else "N/A"
        rss_str    = bytes_to_mb(diag.memory_at_oom_bytes)   if diag.memory_at_oom_bytes   else "N/A"
        pct_str    = f"{diag.memory_pct_of_limit:.1f}%"      if diag.memory_pct_of_limit is not None else "N/A"
        lines.append(
            f"<b>Memory at OOM:</b> {rss_str} / {limit_str} ({pct_str} of limit)"
        )

        if diag.cause == OOMCause.LEGITIMATE_GROWTH:
            r1  = bytes_to_mb(diag.rss_1h_ago)  if diag.rss_1h_ago  else "N/A"
            r4  = bytes_to_mb(diag.rss_4h_ago)  if diag.rss_4h_ago  else "N/A"
            r12 = bytes_to_mb(diag.rss_12h_ago) if diag.rss_12h_ago else "N/A"
            g1  = f"{diag.growth_rate_1h:.1f}%/h"  if diag.growth_rate_1h  is not None else "N/A"
            g4  = f"{diag.growth_rate_4h:.1f}%/h"  if diag.growth_rate_4h  is not None else "N/A"
            g12 = f"{diag.growth_rate_12h:.1f}%/h" if diag.growth_rate_12h is not None else "N/A"
            lines.append(
                "📈 <b>Cause: LEGITIMATE GROWTH</b><br>"
                "Memory has been growing steadily across multiple time windows beforehand. "
                "The container simply ran out of room. Instance size increase via Omnistrate UI is required (manual action).<br><br>"
                f"<b>Growth evidence (% of container limit per hour):</b><br>"
                f"• 1 h before OOM:  {r1}  → growth rate {g1}<br>"
                f"• 4 h before OOM:  {r4}  → growth rate {g4}<br>"
                f"• 12 h before OOM: {r12} → growth rate {g12}"
            )

        elif diag.cause == OOMCause.FRAGMENTATION:
            f20 = _fmt(diag.frag_at_20m)
            f10 = _fmt(diag.frag_at_10m)
            fom = _fmt(diag.frag_at_oom)
            lines.append(
                "🟠 <b>Cause: MEMORY FRAGMENTATION</b><br>"
                "Fragmentation ratio was abnormally high and rising in the period leading up to the OOM. "
                "Restart the underlying VM from Omnistrate UI (manual action). "
                "Refer to the ContainerMemoryHighRSSCritical runbook.<br><br>"
                f"<b>Fragmentation timeline (threshold: {_FRAG_THRESHOLD}):</b><br>"
                f"• ~20 min before OOM: {f20}<br>"
                f"• ~10 min before OOM: {f10}<br>"
                f"• At OOM:            {fom}"
            )

        elif diag.cause == OOMCause.SPIKE:
            spike_pct = f"{(diag.spike_ratio - 1) * 100:.0f}%" if diag.spike_ratio else "N/A"
            mem_max_str = bytes_to_mb(diag.memory_max_bytes) if diag.memory_max_bytes else "N/A"
            mem_min_str = bytes_to_mb(diag.memory_min_bytes) if diag.memory_min_bytes else "N/A"
            lines.append(
                "🔴 <b>Cause: SPIKE (large query)</b><br>"
                f"Memory jumped <b>{spike_pct}</b> in the 2 minutes before the OOM "
                f"(low: <b>{mem_min_str}</b> → peak: <b>{mem_max_str}</b>). "
                "A single large query likely caused the OOM. "
                "Contact the customer to identify queries running at the time of the alert."
            )

        else:  # UNKNOWN
            f20 = _fmt(diag.frag_at_20m)
            f10 = _fmt(diag.frag_at_10m)
            fom = _fmt(diag.frag_at_oom)
            lines.append(
                "⚪ <b>Cause: UNKNOWN</b><br>"
                "No single signal was strong enough to determine the root cause. "
                "Manual investigation is required.<br><br>"
                "<b>Available signals:</b><br>"
                f"• Spike ratio (2 min window): {_fmt(diag.spike_ratio)} (threshold: {_SPIKE_RATIO_THRESHOLD})<br>"
                f"• Fragmentation at ~20 min / ~10 min / at OOM: {f20} / {f10} / {fom}<br>"
                f"• Growth rate 1h / 4h / 12h: "
                f"{_fmt(diag.growth_rate_1h)} / {_fmt(diag.growth_rate_4h)} / {_fmt(diag.growth_rate_12h)} %/h of limit"
            )

        return "<br><br>".join(lines)

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
                            {"keyValue": {"topLabel": "Customer", "content": f"{customer.name} ({customer.email})"}},
                            {"keyValue": {"topLabel": "Subscription ID", "content": customer.subscription_id}},
                            {"keyValue": {"topLabel": "Cluster", "content": cluster}},
                            {"keyValue": {"topLabel": "Namespace", "content": namespace}},
                            {"keyValue": {"topLabel": "Pod", "content": pod}},
                            {"keyValue": {"topLabel": "Alert Container", "content": container}},
                            {"keyValue": {"topLabel": "Actual OOM Container", "content": diag.actual_container if diag.false_positive_sidecar else container}},
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
    print(f"   OOM timestamp offset: {diag.seconds_since_oom}s ago")
    print(f"   Memory at OOM: {diag.memory_at_oom_bytes} / limit: {diag.container_limit_bytes} ({diag.memory_pct_of_limit:.1f}% of limit)" if diag.memory_pct_of_limit is not None else f"   Memory at OOM: {diag.memory_at_oom_bytes}")
    print(f"   Growth rates (%/h of limit): 1h={diag.growth_rate_1h}, 4h={diag.growth_rate_4h}, 12h={diag.growth_rate_12h}")
    print(f"   Fragmentation: 20m={diag.frag_at_20m}, 10m={diag.frag_at_10m}, at_oom={diag.frag_at_oom}")
    print(f"   Spike ratio: {diag.spike_ratio}")
    print(f"   ➜ Cause: {diag.cause}")
    print(f"   Sidecar D: {diag.scenario_d} | False-positive sidecar: {diag.false_positive_sidecar}")

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
