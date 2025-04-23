import argparse
import logging
import requests
import secrets
import json
import os
import urllib.parse

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(message)s")

parser = argparse.ArgumentParser()
parser.add_argument("--grafana_user")
parser.add_argument("--grafana_password")
parser.add_argument("--grafana_url")
parser.add_argument("--omnistrate_user")
parser.add_argument("--omnistrate_password")
parser.add_argument("--omnistrate_service_id")
parser.add_argument("--omnistrate_service_environment")

args = parser.parse_args()

grafana_url = args.grafana_url
grafana = requests.Session()
grafana.auth = (args.grafana_user, args.grafana_password)
grafana.headers.update({"Content-Type": "application/json"})

omnistrate = requests.Session()
omnistrate_token = None


def get_dashboard_json(instance_id: str, version: int):
    logging.debug(f"Getting dashboard json for {instance_id}: old version: {version}")

    with open(
        os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "../observability/grafana/dashboards/falkordb-cloud.json",
        ),
        "r",
    ) as f:
        res = f.read()

    dashboard = json.loads(res)
    dashboard["uid"] = instance_id
    dashboard["title"] = "FalkorDB dashboard for " + instance_id

    nsTemplatingIdx = dashboard["templating"]["list"].index(
        next(
            filter(
                lambda x: x["name"] == "namespace",
                dashboard["templating"]["list"],
            )
        )
    )
    dashboard["templating"]["list"][nsTemplatingIdx] = {
        "current": {
            "text": instance_id,
            "value": instance_id,
        },
        "hide": 2,
        "name": "namespace",
        "query": instance_id,
        "skipUrlSync": True,
        "type": "constant",
    }
    dashboard["version"] = version

    return dashboard


def _get_omnistrate_auth():
    global omnistrate_token
    if omnistrate_token is None:
        omnistrate_token = (
            omnistrate.post(
                "https://api.omnistrate.cloud/2022-09-01-00/signin",
                json={
                    "email": args.omnistrate_user,
                    "password": args.omnistrate_password,
                },
                headers={"Content-Type": "application/json"},
            )
            .json()
            .get("jwtToken")
        )

    return omnistrate_token


def get_grafana_org_id(
    org_name: str,
) -> int:
    logging.debug(f"Getting Grafana org {org_name}")

    res = grafana.get(
        f"{grafana_url}/orgs/name/{urllib.parse.quote(org_name)}",
        headers={"Content-Type": "application/json"},
    )
    if res.status_code != 200:
        raise Exception(f"Error getting org {org_name}: {res.text}")
    logging.debug(f"{res.json()}")
    return res.json().get("id")


def get_grafana_folder_uid(
    org_id: int,
    folder_name: str,
) -> str:
    logging.debug(f"Getting Grafana folder {folder_name}")

    res = grafana.get(
        f"{grafana_url}/folders?orgId={org_id}",
        headers={"Content-Type": "application/json"},
    )
    if res.status_code != 200:
        raise Exception(f"Error getting folders: {res.text}")
    logging.debug(f"{res.json()}")

    for folder in res.json():
        if folder.get("title") == folder_name:
            return folder.get("uid")

    raise Exception(f"Folder {folder_name} not found")


def get_grafana_dashboard_version(
    org_id: int,
    dashboard_uid: str,
) -> int:
    logging.debug(f"Getting Grafana dashboard {dashboard_uid}")
    res = grafana.get(
        f"{grafana_url}/dashboards/uid/{dashboard_uid}?orgId={org_id}",
        headers={"Content-Type": "application/json"},
    )

    if res.status_code != 200:
        raise Exception(f"Error getting dashboard {dashboard_uid}: {res.text}")

    return res.json().get("dashboard").get("version")


def update_grafana_dashboard(
    org_id: int,
    folder_uid: str,
    dashboard_json: dict,
):
    logging.debug(f"Updating Grafana dashboard {dashboard_json.get('uid')}")
    res = grafana.post(
        f"{grafana_url}/dashboards/db?orgId={org_id}",
        json={
            "dashboard": dashboard_json,
            "folderUid": get_grafana_folder_uid(org_id, folder_uid),
        },
    )

    if res.status_code != 200:
        raise Exception(
            f"Error updating dashboard {dashboard_json.get('uid')}: {res.text}"
        )


def get_omnistrate_subscriptions(
    service_id: str,
    service_environment: str,
):
    logging.debug(
        f"Getting subscriptions for service {service_id} in environment {service_environment}"
    )
    res = omnistrate.get(
        f"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/{service_id}/environment/{service_environment}/subscription",
    )
    subscriptions = res.json().get("subscriptions")
    return [
        subscription for subscription in subscriptions if subscription.get("productTierName") != "FalkorDB Free"
    ]


def get_omnistrate_subscription_instances(
    service_id: str, service_environment: str, subscription_id: str
):
    logging.debug(
        f"Getting instances for subscription {subscription_id} in service {service_id} in environment {service_environment}"
    )
    res = omnistrate.get(
        f"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/{service_id}/environment/{service_environment}/instances?SubscriptionId={subscription_id}"
    )
    return res.json().get("resourceInstances")


def main():
    _get_omnistrate_auth()
    omnistrate.headers.update({"Authorization": f"Bearer {_get_omnistrate_auth()}"})

    subscriptions = get_omnistrate_subscriptions(
        args.omnistrate_service_id,
        args.omnistrate_service_environment,
    )
    logging.debug(f"Subscriptions: {len(subscriptions)}")

    for subscription in subscriptions:
        if "FalkorDB Free" in subscription.get("productTierName"):
            continue
        subscription_instances = get_omnistrate_subscription_instances(
            args.omnistrate_service_id,
            args.omnistrate_service_environment,
            subscription.get("id"),
        )
        logging.debug(
            f"Subscription {subscription.get('id')}: Instances: {len(subscription_instances)}"
        )

        org_id = get_grafana_org_id(subscription.get("id"))

        for instance in subscription_instances:

            dashboard_version = get_grafana_dashboard_version(
                org_id,
                instance.get("consumptionResourceInstanceResult").get("id"),
            )

            update_grafana_dashboard(
                org_id,
                instance.get("consumptionResourceInstanceResult").get("id"),
                get_dashboard_json(
                    instance.get("consumptionResourceInstanceResult").get("id"),
                    dashboard_version,
                ),
            )


if __name__ == "__main__":
    main()
