#!/usr/bin/env python3
"""
IP Fix — Redis Cluster IP Discrepancy Remediation

Discovers instances in DEPLOYING state created today (Israel time) for the
monitored subscription, then runs CLUSTER MEET and CLUSTER REPLICATE on each
individual pod via kubectl exec to fix IP discrepancies.

Adapted from ip_fix_logic.sh — external pod-by-pod approach instead of
running from within a single pod.
"""

import json
import os
import subprocess
import sys
import requests
from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo


# Statuses considered "deploying" (instance is being provisioned/updated)
DEPLOYING_STATUSES = {"DEPLOYING"}

_KUBECTL_TIMEOUT = 60
_OMNI_TIMEOUT = 120


# ---------------------------------------------------------------------------
# Omnistrate client
# ---------------------------------------------------------------------------

class OmnistrateClient:
    """Client for Omnistrate Fleet API"""

    def __init__(self, api_url: str, username: str, password: str,
                 service_id: str, environment_id: str,
                 verify_ssl: bool = True):
        self.api_url = api_url.rstrip("/")
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

    def get_product_tier_id_by_name(self, tier_name: str) -> Optional[str]:
        """Look up product tier ID by tier name using the service-plan API."""
        response = requests.get(
            f"{self.api_url}/service/{self.service_id}/environment/{self.environment_id}/service-plan",
            headers=self._get_headers(),
            timeout=60,
            verify=self.verify_ssl,
        )
        response.raise_for_status()
        data = response.json().get("servicePlans", [])

        tier = next(
            (t for t in data if t.get("productTierName") == tier_name),
            None,
        )
        return tier.get("productTierId") if tier else None

    def get_deploying_instances_today(self, subscription_id: str,
                                      product_tier_id: Optional[str] = None) -> list:
        """Return instances for the given subscription that are in a deploying
        state AND were created today (Israel time)."""
        tz = ZoneInfo("Asia/Jerusalem")
        today = datetime.now(tz).date()

        fleet_url = (
            f"{self.api_url}/fleet/service/{self.service_id}"
            f"/environment/{self.environment_id}/instances"
        )
        params = {
            "Filter": "excludeCloudAccounts",
            "ExcludeDetail": "false",
            "pageSize": 100,
        }
        if product_tier_id:
            params["ProductTierId"] = product_tier_id

        results = []
        next_page_token = None

        while True:
            if next_page_token:
                params["nextPageToken"] = next_page_token

            response = requests.get(
                fleet_url,
                params=params,
                headers=self._get_headers(),
                timeout=30,
                verify=self.verify_ssl,
            )
            response.raise_for_status()
            data = response.json()

            for instance in data.get("resourceInstances", []):
                if instance.get("subscriptionId") != subscription_id:
                    continue

                nested = instance.get("consumptionResourceInstanceResult")
                if not isinstance(nested, dict) or not nested.get("id"):
                    continue

                status = nested.get("status", "")
                if status not in DEPLOYING_STATUSES:
                    continue

                if not _is_today(nested.get("created_at", ""), today, tz):
                    continue

                results.append({
                    "id": nested["id"],
                    "status": status,
                    "created_at": nested.get("created_at", ""),
                    "cloud_provider": nested.get("cloud_provider", ""),
                    "region": nested.get("region", ""),
                    "name": instance.get("input_params", {}).get("name", ""),
                    "org": instance.get("organizationName", ""),
                    "deployment_cell": instance.get("deploymentCellID", ""),
                })

            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break

        return results


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_today(created_at: str, today, tz) -> bool:
    if not created_at:
        return False
    dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    return dt.astimezone(tz).date() == today


# ---------------------------------------------------------------------------
# omnistrate-ctl helpers
# ---------------------------------------------------------------------------

def omnistrate_login(email: str, password: str) -> None:
    """Login to omnistrate-ctl. No PTY needed for this command."""
    subprocess.run(
        ["omnistrate-ctl", "login", "--email", email, "--password-stdin"],
        input=password.encode(),
        check=True,
        timeout=_OMNI_TIMEOUT,
    )


def setup_kubeconfig(deployment_cell: str) -> str:
    """Fetch kubeconfig for the given deployment cell.
    Uses 'script' wrapper because update-kubeconfig uses a spinner that
    requires /dev/tty (same pattern as rdb-uploader.yml)."""
    kubeconfig_path = f"/tmp/kubeconfig-{deployment_cell}"
    subprocess.run(
        [
            "script", "-q", "-c",
            (
                f'omnistrate-ctl deployment-cell update-kubeconfig '
                f'"{deployment_cell}" --role cluster-admin '
                f'--kubeconfig {kubeconfig_path}'
            ),
            "/dev/null",
        ],
        check=True,
        timeout=_OMNI_TIMEOUT,
    )
    return kubeconfig_path


# ---------------------------------------------------------------------------
# kubectl / redis-cli helpers
# ---------------------------------------------------------------------------

def _kubectl(args: list, kubeconfig: str, check: bool = True,
             input_data: Optional[bytes] = None) -> subprocess.CompletedProcess:
    env = {**os.environ, "KUBECONFIG": kubeconfig}
    return subprocess.run(
        ["kubectl"] + args,
        capture_output=True,
        text=True,
        timeout=_KUBECTL_TIMEOUT,
        env=env,
        check=check,
        input=input_data,
    )


def get_pods(namespace: str, kubeconfig: str) -> list[str]:
    """Return all pod names in the namespace."""
    result = _kubectl(["get", "pods", "-n", namespace, "-o", "json"], kubeconfig)
    items = json.loads(result.stdout).get("items", [])
    return [p["metadata"]["name"] for p in items]


def _redis_cli(namespace: str, pod: str, container: str, args: list,
               kubeconfig: str, check: bool = True,
               password: Optional[str] = None) -> subprocess.CompletedProcess:
    redis_port = os.environ.get("REDIS_PORT", "6379")
    auth = ["-a", password, "--no-auth-warning"] if password else []
    cmd = (
        ["exec", "-n", namespace, "-c", container, pod, "--",
         "redis-cli", "-p", redis_port]
        + auth
        + args
    )
    return _kubectl(cmd, kubeconfig, check=check)


def _cat_file(namespace: str, pod: str, container: str, path: str,
              kubeconfig: str) -> str:
    r = _kubectl(
        ["exec", "-n", namespace, "-c", container, pod, "--", "cat", path],
        kubeconfig,
    )
    return r.stdout


def _read_admin_password(namespace: str, pod: str, container: str,
                         kubeconfig: str) -> Optional[str]:
    """Read the Redis admin password from /run/secrets/adminpassword inside the container."""
    r = _kubectl(
        ["exec", "-n", namespace, "-c", container, pod, "--",
         "cat", "/run/secrets/adminpassword"],
        kubeconfig,
        check=False,
    )
    if r.returncode != 0 or not r.stdout.strip():
        return None
    return r.stdout.strip()


def _resolve_hostname(namespace: str, pod: str, container: str,
                      hostname: str, kubeconfig: str) -> Optional[str]:
    r = _kubectl(
        ["exec", "-n", namespace, "-c", container, pod, "--",
         "getent", "hosts", hostname],
        kubeconfig,
        check=False,
    )
    if r.returncode != 0 or not r.stdout.strip():
        return None
    return r.stdout.split()[0]


def _can_ping(namespace: str, pod: str, container: str, kubeconfig: str,
              password: Optional[str] = None) -> bool:
    r = _redis_cli(namespace, pod, container, ["PING"], kubeconfig,
                   check=False, password=password)
    return r.returncode == 0 and "PONG" in r.stdout


# ---------------------------------------------------------------------------
# Fix routines
# ---------------------------------------------------------------------------

def meet_unknown_nodes(namespace: str, pod: str, container: str,
                       kubeconfig: str, all_pods: list,
                       password: Optional[str] = None) -> int:
    """
    Resolves the current IP of every other pod in the namespace using
    getent hosts (run from inside this pod), then issues CLUSTER MEET
    for each. This unconditionally refreshes all peer IPs regardless of
    cluster state.

    Returns the number of CLUSTER MEET commands issued.
    """
    redis_port = os.environ.get("REDIS_PORT", "6379")
    fixed = 0

    for target_pod in all_pods:
        if target_pod == pod:
            continue

        ip = _resolve_hostname(namespace, pod, container, target_pod, kubeconfig)
        if not ip:
            print(f"      ⚠️  Could not resolve {target_pod} from {pod} — skipping")
            continue

        print(f"      → CLUSTER MEET {ip} {redis_port}  ({target_pod})")
        _redis_cli(namespace, pod, container,
                   ["CLUSTER", "MEET", ip, redis_port], kubeconfig,
                   password=password)
        fixed += 1

    return fixed


def fix_replica_master_ip(namespace: str, pod: str, container: str,
                           kubeconfig: str,
                           password: Optional[str] = None) -> bool:
    """
    Adapted from ensure_replica_connects_to_the_right_master_ip() in
    ip_fix_logic.sh.

    Checks if this node is a replica whose master_host IP is absent from
    nodes.conf (stale IP after master pod restart). If so, issues
    CLUSTER REPLICATE with the correct master node ID.

    Returns True if CLUSTER REPLICATE was issued.
    """
    info_r = _redis_cli(namespace, pod, container,
                        ["INFO", "REPLICATION"], kubeconfig, password=password)
    if "role:slave" not in info_r.stdout:
        return False

    master_ip = None
    for line in info_r.stdout.splitlines():
        if line.startswith("master_host:"):
            master_ip = line.split(":", 1)[1].strip()
            break

    if not master_ip:
        return False

    nodes_conf = _cat_file(namespace, pod, container, "/data/nodes.conf", kubeconfig)
    if master_ip in nodes_conf:
        return False

    print(f"      → master_host {master_ip} not in nodes.conf — applying CLUSTER REPLICATE")

    master_id = None
    for conf_line in nodes_conf.splitlines():
        if "myself" in conf_line:
            parts = conf_line.split()
            if len(parts) >= 4 and parts[3] != "-":
                master_id = parts[3]
            break

    if not master_id:
        print(f"      ⚠️  Could not determine master ID from nodes.conf for pod {pod}")
        return False

    _redis_cli(namespace, pod, container,
               ["CLUSTER", "REPLICATE", master_id], kubeconfig,
               password=password)
    return True


def fix_instance(instance: dict, kubeconfig: str) -> dict:
    """Remediate all pods in a single instance namespace."""
    namespace = instance["id"]
    container = os.environ.get("REDIS_CONTAINER", "service")
    summary = {
        "namespace": namespace,
        "name": instance.get("name", ""),
        "deployment_cell": instance["deployment_cell"],
        "pods_checked": 0,
        "pods_unreachable": 0,
        "meet_fixes": 0,
        "replicate_fixes": 0,
        "errors": [],
    }

    print(f"\n   Instance: {namespace}"
          f"{' (' + instance['name'] + ')' if instance.get('name') else ''}"
          f" — cell: {instance['deployment_cell']}")

    pods = get_pods(namespace, kubeconfig)
    if not pods:
        print(f"      No pods found in namespace {namespace}")
        return summary

    # Password is the same across all pods — read once from the first pod
    password = _read_admin_password(namespace, pods[0], container, kubeconfig)

    for pod in pods:
        summary["pods_checked"] += 1
        print(f"      Pod: {pod}")

        if not _can_ping(namespace, pod, container, kubeconfig, password=password):
            print(f"         ⚠️  Pod {pod} not reachable (no PONG) — will retry in 5 minutes")
            summary["pods_unreachable"] += 1
            return summary

        try:
            met = meet_unknown_nodes(namespace, pod, container, kubeconfig, pods,
                                     password=password)
            summary["meet_fixes"] += met
        except Exception as e:
            msg = f"meet_unknown_nodes failed on {pod}: {e}"
            print(f"         ❌ {msg}")
            summary["errors"].append(msg)

        try:
            if fix_replica_master_ip(namespace, pod, container, kubeconfig,
                                     password=password):
                summary["replicate_fixes"] += 1
        except Exception as e:
            msg = f"fix_replica_master_ip failed on {pod}: {e}"
            print(f"         ❌ {msg}")
            summary["errors"].append(msg)

    return summary


# ---------------------------------------------------------------------------
# Google Chat notifier
# ---------------------------------------------------------------------------

class GoogleChatNotifier:

    def __init__(self, webhook_url: str, verify_ssl: bool = True):
        self.webhook_url = webhook_url
        self.verify_ssl = verify_ssl

    def send_remediation_report(self, summaries: list, timestamp: str) -> None:
        total_meet = sum(s["meet_fixes"] for s in summaries)
        total_replicate = sum(s["replicate_fixes"] for s in summaries)
        total_unreachable = sum(s["pods_unreachable"] for s in summaries)

        if total_meet + total_replicate > 0:
            header_title = (
                f"🔧 IP Fix: {total_meet} MEET + {total_replicate} REPLICATE fix(es)"
            )
        else:
            header_title = "✅ IP Fix: No IP discrepancies found"

        instance_widgets = []
        for s in summaries:
            label = s["namespace"]
            if s.get("name"):
                label += f" ({s['name']})"
            instance_widgets.append({
                "keyValue": {
                    "topLabel": label,
                    "content": (
                        f"Cell: {s['deployment_cell']} | "
                        f"Pods checked: {s['pods_checked']} | "
                        f"Unreachable: {s['pods_unreachable']} | "
                        f"MEET fixes: {s['meet_fixes']} | "
                        f"REPLICATE fixes: {s['replicate_fixes']}"
                        + (f" | Errors: {len(s['errors'])}" if s["errors"] else "")
                    ),
                }
            })

        payload = {
            "cards": [{
                "header": {
                    "title": header_title,
                    "subtitle": f"Checked at (Israel): {timestamp}",
                },
                "sections": [
                    {"widgets": instance_widgets},
                ],
            }]
        }

        if total_unreachable:
            payload["text"] = (
                f"⚠️ {total_unreachable} pod(s) unreachable (no PONG)"
            )

        response = requests.post(
            self.webhook_url, json=payload, timeout=30, verify=self.verify_ssl
        )
        response.raise_for_status()

    def send_error_notification(self, error_message: str,
                                error_details: Optional[str] = None) -> None:
        payload = {
            "text": "❌ IP Fix Failed",
            "cards": [{
                "header": {"title": "❌ IP Fix Failed"},
                "sections": [{
                    "widgets": [{
                        "keyValue": {
                            "topLabel": "Error",
                            "content": error_message,
                        }
                    }]
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
            requests.post(
                self.webhook_url, json=payload, timeout=30, verify=self.verify_ssl
            )
        except Exception as e:
            print(f"⚠️  Failed to send error notification: {e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    required_env_vars = [
        "OMNISTRATE_API_URL", "OMNISTRATE_USERNAME", "OMNISTRATE_PASSWORD",
        "OMNISTRATE_SERVICE_ID", "OMNISTRATE_ENVIRONMENT_ID",
        "MONITORED_SUBSCRIPTION_ID",
        "GOOGLE_CHAT_WEBHOOK_URL",
    ]
    missing = [v for v in required_env_vars if not os.environ.get(v)]
    if missing:
        print(f"❌ Missing required environment variables: {', '.join(missing)}",
              file=sys.stderr)
        sys.exit(1)

    subscription_id = os.environ["MONITORED_SUBSCRIPTION_ID"]
    tier_name = os.environ.get("OMNISTRATE_PRODUCT_TIER_NAME", "FalkorDB Enterprise")
    tz = ZoneInfo("Asia/Jerusalem")
    timestamp = datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'='*60}")
    print(f"IP Fix — subscription: {subscription_id}")
    print(f"{'='*60}\n")

    client = OmnistrateClient(
        api_url=os.environ["OMNISTRATE_API_URL"],
        username=os.environ["OMNISTRATE_USERNAME"],
        password=os.environ["OMNISTRATE_PASSWORD"],
        service_id=os.environ["OMNISTRATE_SERVICE_ID"],
        environment_id=os.environ["OMNISTRATE_ENVIRONMENT_ID"],
    )

    print(f"[1/4] Resolving product tier ID for '{tier_name}'...")
    product_tier_id = client.get_product_tier_id_by_name(tier_name)
    if not product_tier_id:
        print(f"❌ Product tier '{tier_name}' not found — cannot continue.", file=sys.stderr)
        sys.exit(1)
    print(f"   Resolved: {product_tier_id}")

    print("[2/4] Querying Omnistrate Fleet API for instances created today...")
    instances = client.get_deploying_instances_today(subscription_id, product_tier_id)
    print(f"   Found {len(instances)} deploying instance(s) created today.")

    if not instances:
        print("\n✅ Nothing to remediate.")
        return

    for inst in instances:
        print(f"   → {inst['id']}"
              f"{' (' + inst['name'] + ')' if inst.get('name') else ''}"
              f" — {inst['status']}"
              f" — cell: {inst['deployment_cell']}")

    print("\n[3/4] Authenticating and fetching kubeconfigs...")
    omnistrate_login(
        os.environ["OMNISTRATE_USERNAME"],
        os.environ["OMNISTRATE_PASSWORD"],
    )
    print("   omnistrate-ctl login: OK")

    kubeconfigs: dict[str, str] = {}
    for cell in {inst["deployment_cell"] for inst in instances}:
        if not cell:
            continue
        print(f"   Fetching kubeconfig for cell: {cell}")
        kubeconfigs[cell] = setup_kubeconfig(cell)
        print(f"   Saved: {kubeconfigs[cell]}")

    print("\n[4/4] Remediating instances...")
    summaries = []
    for inst in instances:
        cell = inst["deployment_cell"]
        kubeconfig = kubeconfigs.get(cell)
        if not kubeconfig:
            print(f"   ⚠️  No kubeconfig for cell '{cell}' — skipping {inst['id']}")
            continue
        summary = fix_instance(inst, kubeconfig)
        summaries.append(summary)

    if summaries:
        print("\nSending Google Chat report...")
        notifier = GoogleChatNotifier(os.environ["GOOGLE_CHAT_WEBHOOK_URL"])
        notifier.send_remediation_report(summaries, timestamp)
        print("   Report sent.")

    print(f"\n{'='*60}")
    print("✅ IP Fix complete!")
    print(f"{'='*60}")


if __name__ == "__main__":
    google_chat_webhook = os.environ.get("GOOGLE_CHAT_WEBHOOK_URL")

    try:
        main()
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_details = traceback.format_exc()
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        print(error_details, file=sys.stderr)

        if google_chat_webhook:
            try:
                notifier = GoogleChatNotifier(google_chat_webhook)
                notifier.send_error_notification(error_msg, error_details)
            except Exception as notify_error:
                print(f"⚠️  Failed to send error notification: {notify_error}",
                      file=sys.stderr)

        sys.exit(1)
