#!/usr/bin/env python3
"""
Instance Monitor
Polls the Omnistrate Fleet API and alerts Google Chat if any instances
belonging to the monitored subscription are in a deploying/pending state.
"""

import os
import sys
import requests
import urllib3
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Optional


# Statuses considered "deploying" (instance is being provisioned/updated)
DEPLOYING_STATUSES = {"DEPLOYING", "PENDING", "PENDING_DEPENDENCY", "UPLOADING"}


# ---------------------------------------------------------------------------
# Omnistrate client
# ---------------------------------------------------------------------------

class OmnistrateClient:
    """Client for Omnistrate Fleet API"""

    def __init__(self, api_url: str, username: str, password: str,
                 service_id: str, environment_id: str,
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

    def get_deploying_instances(self, subscription_id: str,
                                product_tier_id: Optional[str] = None) -> list:
        """Return all instances for the given subscription that are in a deploying state."""
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

        deploying = []
        next_page_token = None

        while True:
            if next_page_token:
                params["nextPageToken"] = next_page_token

            response = requests.get(
                fleet_url, params=params,
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
                if status in DEPLOYING_STATUSES:
                    deploying.append({
                        "id": nested["id"],
                        "status": status,
                        "cloud_provider": nested.get("cloud_provider", ""),
                        "region": nested.get("region", ""),
                        "created_at": nested.get("created_at", ""),
                        "last_modified_at": nested.get("last_modified_at", ""),
                        "name": instance.get("input_params", {}).get("name", ""),
                        "org": instance.get("organizationName", ""),
                        "deployment_cell": instance.get("deploymentCellID", ""),
                    })

            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break

        return deploying


# ---------------------------------------------------------------------------
# Google Chat notifier
# ---------------------------------------------------------------------------

class GoogleChatNotifier:

    def __init__(self, webhook_url: str, verify_ssl: bool = True):
        self.webhook_url = webhook_url
        self.verify_ssl = verify_ssl

    def send_deploying_alert(self, instances: list, subscription_id: str,
                             timestamp: str) -> None:
        count = len(instances)

        instance_widgets = []
        for inst in instances:
            label = inst["id"]
            if inst["name"]:
                label += f" ({inst['name']})"
            instance_widgets.append({
                "keyValue": {
                    "topLabel": label,
                    "content": (
                        f"Status: {inst['status']} | "
                        f"{inst['cloud_provider'].upper()} {inst['region']} | "
                        f"Org: {inst['org']} | "
                        f"Cell: {inst['deployment_cell']} | "
                        f"Modified: {inst['last_modified_at']}"
                    ),
                }
            })

        payload = {
            "text": f"⚠️ {count} instance(s) in DEPLOYING state — subscription {subscription_id}",
            "cards": [{
                "header": {
                    "title": f"⚠️ {count} Instance(s) Deploying",
                    "subtitle": f"Subscription: {subscription_id}",
                },
                "sections": [
                    {"widgets": instance_widgets},
                    {
                        "widgets": [{
                            "keyValue": {
                                "topLabel": "Checked at (Israel)",
                                "content": timestamp,
                            }
                        }]
                    },
                ],
            }],
        }

        response = requests.post(
            self.webhook_url, json=payload, timeout=30, verify=self.verify_ssl
        )
        response.raise_for_status()

    def send_error_notification(self, error_message: str,
                                error_details: Optional[str] = None) -> None:
        payload = {
            "text": "❌ Instance Monitor Failed",
            "cards": [{
                "header": {"title": "❌ Instance Monitor Failed"},
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
    timestamp = datetime.now(ZoneInfo("Asia/Jerusalem")).strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'='*60}")
    print(f"Instance Monitor — subscription: {subscription_id}")
    print(f"{'='*60}\n")

    client = OmnistrateClient(
        api_url=os.environ["OMNISTRATE_API_URL"],
        username=os.environ["OMNISTRATE_USERNAME"],
        password=os.environ["OMNISTRATE_PASSWORD"],
        service_id=os.environ["OMNISTRATE_SERVICE_ID"],
        environment_id=os.environ["OMNISTRATE_ENVIRONMENT_ID"],
        verify_ssl=verify_ssl,
    )

    print(f"[1/3] Resolving product tier ID for '{tier_name}'...")
    product_tier_id = client.get_product_tier_id_by_name(tier_name)
    if product_tier_id:
        print(f"   Resolved: {product_tier_id}")
    else:
        print(f"   ⚠️  Product tier '{tier_name}' not found — querying without tier filter.")

    print("[2/3] Querying Omnistrate Fleet API...")
    deploying = client.get_deploying_instances(subscription_id, product_tier_id)
    print(f"   Found {len(deploying)} deploying instance(s).")

    if not deploying:
        print("\n✅ No instances in deploying state.")
        return

    for inst in deploying:
        print(f"   ⚠️  {inst['id']} ({inst['name'] or 'unnamed'}) — "
              f"{inst['status']} in {inst['cloud_provider']} {inst['region']}")

    print("\n[3/3] Sending Google Chat alert...")
    notifier = GoogleChatNotifier(
        os.environ["GOOGLE_CHAT_WEBHOOK_URL"], verify_ssl=verify_ssl
    )
    notifier.send_deploying_alert(deploying, subscription_id, timestamp)
    print("   Alert sent.")

    print(f"\n{'='*60}")
    print("✅ Instance monitoring complete!")
    print(f"{'='*60}")


if __name__ == "__main__":
    google_chat_webhook = os.environ.get("GOOGLE_CHAT_WEBHOOK_URL")
    verify_ssl = True

    try:
        environment = os.environ.get("ENVIRONMENT", "prod").lower()
        disable_ssl_verify = os.environ.get("DISABLE_SSL_VERIFY", "false").lower() == "true"
        verify_ssl = not (environment == "dev" or disable_ssl_verify)

        main()
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_details = traceback.format_exc()
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        print(error_details, file=sys.stderr)

        if google_chat_webhook:
            try:
                notifier = GoogleChatNotifier(google_chat_webhook, verify_ssl=verify_ssl)
                notifier.send_error_notification(error_msg, error_details)
            except Exception as notify_error:
                print(f"⚠️  Failed to send error notification: {notify_error}",
                      file=sys.stderr)

        sys.exit(1)
