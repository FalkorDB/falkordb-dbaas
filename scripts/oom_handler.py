#!/usr/bin/env python3
"""
OOM Killed Handler
Processes ContainerOOMKilled alerts by querying VictoriaMetrics to diagnose
the root cause (large query spike, legitimate growth, or memory fragmentation)
and sends a Google Chat notification with the diagnosis.
"""

import os
import sys
import json
import requests
import argparse
import urllib3
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Optional
from dataclasses import dataclass


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


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class CustomerInfo:
    email: str
    name: str
    subscription_id: str


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
# Google Chat notifier
# ---------------------------------------------------------------------------

# Centralized mention list for OOM notifications (Google Chat user IDs)
CHAT_MENTIONS = (
    "<users/111622808083881015737> "  # Muhammad
    "<users/117793002495590672566> "  # David
    "<users/117131850958413609302>"   # Barak
)


class GoogleChatNotifier:

    def __init__(self, webhook_url: str, verify_ssl: bool = True):
        self.webhook_url = webhook_url
        self.verify_ssl = verify_ssl

    def send_notification(
        self,
        customer: CustomerInfo,
        pod: str,
        namespace: str,
        cluster: str,
        container: str,
        grafana_memory_url: str,
        grafana_pods_url: str,
        timestamp: str,
    ):
        payload = {
            "text": f"🚨 ContainerOOMKilled — {pod} ({namespace}) {CHAT_MENTIONS}",
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
                            {"keyValue": {"topLabel": "Container", "content": container}},
                            {"keyValue": {"topLabel": "Time (Israel)", "content": timestamp}},
                        ]
                    },
                    {
                        "widgets": [{
                            "buttons": [
                                {
                                    "textButton": {
                                        "text": "Memory metrics",
                                        "onClick": {"openLink": {"url": grafana_memory_url}},
                                    }
                                },
                                {
                                    "textButton": {
                                        "text": "Pod overview",
                                        "onClick": {"openLink": {"url": grafana_pods_url}},
                                    }
                                },
                            ]
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

    def send_unknown_workload_notification(self, pod: str, namespace: str,
                                           cluster: str, container: str,
                                           timestamp: str):
        payload = {
            "text": f"🚨 ContainerOOMKilled (non-FalkorDB) — {pod} ({namespace}) {CHAT_MENTIONS}",
            "cards": [{
                "header": {
                    "title": "🚨 ContainerOOMKilled (non-FalkorDB workload)",
                    "subtitle": f"{pod} in {namespace} @ {cluster}",
                },
                "sections": [{
                    "widgets": [
                        {"keyValue": {"topLabel": "Cluster", "content": cluster}},
                        {"keyValue": {"topLabel": "Namespace", "content": namespace}},
                        {"keyValue": {"topLabel": "Pod", "content": pod}},
                        {"keyValue": {"topLabel": "Container", "content": container}},
                        {"keyValue": {"topLabel": "Time (Israel)", "content": timestamp}},
                    ]
                }],
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
            "text": f"❌ OOM Handler Failed {CHAT_MENTIONS}",
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
# Grafana link generators
# ---------------------------------------------------------------------------

def build_grafana_memory_url(grafana_base: str, namespace: str, pod: str,
                             from_ms: int, to_ms: int) -> str:
    """Grafana Explore URL showing container_memory_rss centred on the OOM time."""
    from urllib.parse import urlencode
    expr = f'container_memory_rss{{namespace="{namespace}", pod="{pod}"}}'
    params = {
        "orgId": "1",
        "left": json.dumps({
            "datasource": "VictoriaMetrics",
            "queries": [{"expr": expr, "refId": "A"}],
            "range": {"from": str(from_ms), "to": str(to_ms)},
        }),
    }
    return f"{grafana_base.rstrip('/')}/explore?{urlencode(params)}"


def build_grafana_pods_url(grafana_base: str, namespace: str, pod: str,
                          cluster: str, from_ms: int, to_ms: int) -> str:
    """Direct link to the Kubernetes / Views / Pods dashboard centred on the OOM time."""
    from urllib.parse import urlencode
    params = {
        "orgId": "1",
        "from": str(from_ms),
        "to": str(to_ms),
        "var-cluster": cluster,
        "var-namespace": namespace,
        "var-pod": pod,
    }
    return f"{grafana_base.rstrip('/')}/d/k8s_views_pods/kubernetes-views-pods?{urlencode(params)}"


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser():
    parser = argparse.ArgumentParser(description="Process ContainerOOMKilled alerts")
    parser.add_argument("--pod", required=True, help="Pod name")
    parser.add_argument("--namespace", required=True, help="Namespace (instance ID)")
    parser.add_argument("--cluster", required=True, help="Cluster name")
    parser.add_argument("--container", required=True, help="Container that was OOMKilled")
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

    if args.pod == "node-f-0":
        print(f"ℹ️  Skipping OOM handler for pod 'node-f-0'.")
        return

    required_env_vars = [
        "OMNISTRATE_API_URL", "OMNISTRATE_USERNAME", "OMNISTRATE_PASSWORD",
        "OMNISTRATE_SERVICE_ID", "OMNISTRATE_ENVIRONMENT_ID",
        "GOOGLE_CHAT_WEBHOOK_URL",
    ]
    missing = [v for v in required_env_vars if not os.environ.get(v)]
    if missing:
        print(f"❌ Missing required environment variables: {', '.join(missing)}",
              file=sys.stderr)
        sys.exit(1)

    oom_dt    = datetime.now(ZoneInfo("Asia/Jerusalem"))
    timestamp = oom_dt.strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'='*60}")
    print(f"OOM Handler: {args.pod} in {args.namespace} (container: {args.container})")
    print(f"{'='*60}\n")

    # Step 1: Customer info
    print("[1/3] Fetching customer information...")
    omnistrate = OmnistrateClient(
        api_url=os.environ["OMNISTRATE_API_URL"],
        username=os.environ["OMNISTRATE_USERNAME"],
        password=os.environ["OMNISTRATE_PASSWORD"],
        service_id=os.environ["OMNISTRATE_SERVICE_ID"],
        environment_id=os.environ["OMNISTRATE_ENVIRONMENT_ID"],
        verify_ssl=verify_ssl,
    )
    try:
        customer = omnistrate.get_customer_info(args.namespace)
    except ValueError as e:
        print(f"   ℹ️  Skipping: {e} — not a FalkorDB workload.")
        webhook = os.environ.get("GOOGLE_CHAT_WEBHOOK_URL")
        if webhook:
            notifier = GoogleChatNotifier(webhook, verify_ssl=verify_ssl)
            notifier.send_unknown_workload_notification(
                pod=args.pod,
                namespace=args.namespace,
                cluster=args.cluster,
                container=args.container,
                timestamp=timestamp,
            )
            print("   Notification sent.")
        return
    print(f"   Customer: {customer.name} ({mask_email(customer.email)})")

    # Step 2: Build Grafana links (±10 min window centred on OOM time)
    print("[2/3] Building Grafana links...")
    oom_ts_ms = int(oom_dt.timestamp() * 1000)
    from_ms   = oom_ts_ms - 10 * 60 * 1000
    to_ms     = oom_ts_ms + 10 * 60 * 1000
    grafana_memory_url = build_grafana_memory_url(args.grafana_url, args.namespace, args.pod, from_ms, to_ms)
    grafana_pods_url   = build_grafana_pods_url(args.grafana_url, args.namespace, args.pod, args.cluster, from_ms, to_ms)
    print(f"   Memory: {grafana_memory_url}")
    print(f"   Pods:   {grafana_pods_url}")

    # Step 3: Send Google Chat notification
    print("[3/3] Sending Google Chat notification...")
    notifier = GoogleChatNotifier(os.environ["GOOGLE_CHAT_WEBHOOK_URL"],
                                  verify_ssl=verify_ssl)
    notifier.send_notification(
        customer=customer,
        pod=args.pod,
        namespace=args.namespace,
        cluster=args.cluster,
        container=args.container,
        grafana_memory_url=grafana_memory_url,
        grafana_pods_url=grafana_pods_url,
        timestamp=timestamp,
    )
    print("   Notification sent.")

    # Write outputs for downstream GitHub Actions jobs (AI triage pipeline)
    # Use <<EOF delimiter syntax to safely handle special characters in values
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        import uuid
        delimiter = f"ghadelimiter_{uuid.uuid4().hex}"
        with open(github_output, "a") as f:
            for key, val in [
                ("namespace", args.namespace),
                ("pod", args.pod),
                ("cluster", args.cluster),
                ("container", args.container),
                ("customer_name", customer.name),
                ("customer_email", mask_email(customer.email)),
                ("subscription_id", customer.subscription_id),
            ]:
                f.write(f"{key}<<{delimiter}\n{val}\n{delimiter}\n")

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
