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


def get_dashboard_json(instance_id: str):

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


def create_grafana_org(
    org_name: str,
) -> int:
    logging.debug(f"Creating Grafana org {org_name}")
    res = grafana.post(
        f"{grafana_url}/orgs",
        json={"name": org_name},
        headers={"Content-Type": "application/json"},
    )

    if res.status_code == 409:
        logging.debug(f"Org {org_name} already exists")
        res = grafana.get(
            f"{grafana_url}/orgs/name/{urllib.parse.quote(org_name)}",
            headers={"Content-Type": "application/json"},
        )
        if res.status_code != 200:
            raise Exception(f"Error getting org {org_name}: {res.text}")
        logging.debug(f"{res.json()}")
        return res.json().get("id")

    orgId = res.json().get("orgId")

    return orgId


def create_grafana_datasource(
    orgId: int,
):

    res = grafana.post(
        f"{grafana_url}/user/using/{orgId}",
    )

    logging.debug(f"Using org {orgId}: {res.text}")

    grafana.post(
        f"{grafana_url}/datasources",
        json={
            "type": "prometheus",
            "access": "proxy",
            "isDefault": True,
            "name": "VictoriaMetrics",
            "url": "http://vmsingle-vm.observability.svc.cluster.local:8429",
        },
    )


def create_grafana_folder(
    org_id: int,
    folder_name: str,
) -> str:
    logging.debug(f"Creating Grafana folder {folder_name}")
    res = grafana.post(
        f"{grafana_url}/folders?orgId={org_id}",
        json={"title": folder_name},
    )

    return res.json().get("uid")


def create_grafana_dashboard(
    org_id: int,
    folder_uid: str,
    dashboard_json: dict,
):
    logging.debug(f"Creating Grafana dashboard {dashboard_json.get('uid')}")
    grafana.post(
        f"{grafana_url}/dashboards/db?orgId={org_id}",
        json={
            "dashboard": dashboard_json,
            "folderUid": folder_uid,
        },
    )


def create_grafana_user(
    org_id: int,
    email: str,
):
    logging.debug(f"Creating Grafana user {email}")
    res = grafana.post(
        f"{grafana_url}/admin/users",
        json={
            "email": email,
            "name": email,
            "password": secrets.token_urlsafe(16),
            "OrgId": org_id,
        },
    )

    if res.status_code == 409:
        logging.debug(f"User {email} already exists")
        res = grafana.get(f"{grafana_url}/admin/users/lookup?loginOrEmail={email}")
        if res.status_code != 200:
            raise Exception(f"Error getting user {email}: {res.text}")
        logging.debug(f"{res.json()}")
        return res.json().get("userId")

    return res.json().get("userId")


def add_grafana_user_to_org(org_id: int, email: str):
    logging.debug(f"Adding Grafana user {email} to org {org_id}")
    try:
        create_grafana_user(org_id, email)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            logging.debug(f"User {email} already exists")
            grafana.get(f"{grafana_url}/users/lookup?loginOrEmail={email}").json().get(
                "userId"
            )
        else:
            raise e
    grafana.post(
        f"{grafana_url}/orgs/{org_id}/users",
        json={
            "loginOrEmail": email,
            "role": "Viewer",
        },
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

def get_omnistrate_subscription_users(
    service_id: str, service_environment: str, subscription_id: str
):
    logging.debug(
        f"Getting users for subscription {subscription_id} in service {service_id} in environment {service_environment}"
    )
    res = omnistrate.get(
        f"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/{service_id}/environment/{service_environment}/users?subscriptionId={subscription_id}"
    )
    return res.json().get("users")


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
        subscription_users = get_omnistrate_subscription_users(
            args.omnistrate_service_id,
            args.omnistrate_service_environment,
            subscription.get("id"),
        )
        logging.debug(
            f"Subscription {subscription.get('id')}: Users: {len(subscription_users)}"
        )
        subscription_instances = get_omnistrate_subscription_instances(
            args.omnistrate_service_id,
            args.omnistrate_service_environment,
            subscription.get("id"),
        )
        logging.debug(
            f"Subscription {subscription.get('id')}: Instances: {len(subscription_instances)}"
        )

        org_id = create_grafana_org(subscription.get("id"))

        create_grafana_datasource(org_id)

        for user in subscription_users:
            add_grafana_user_to_org(org_id, user.get("email"))

        for instance in subscription_instances:
            folder_uid = create_grafana_folder(
                subscription.get("id"),
                instance.get("consumptionResourceInstanceResult").get("id"),
            )

            create_grafana_dashboard(
                org_id,
                folder_uid,
                get_dashboard_json(
                    instance.get("consumptionResourceInstanceResult").get("id"),
                ),
            )


if __name__ == "__main__":
    main()
