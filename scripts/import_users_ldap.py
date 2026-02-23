#!/usr/bin/env python3
"""
Import users into LDAP for FalkorDB instances.

This script fetches instances from Omnistrate API and creates LDAP users
for each instance using the credentials stored in the instance's result_params.

The script:
1. Authenticates with Omnistrate API
2. Retrieves all instances for a specified environment and product tier
3. For each instance, extracts falkordbUsername and falkordbPassword from result_params
4. Creates LDAP users via the customer-ldap API
"""

import argparse
import logging
import sys
import requests
from typing import List, Dict, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class OmnistrateClient:
    """Handles Omnistrate API authentication and requests."""

    def __init__(self, email: str, password: str):
        """
        Initialize Omnistrate client.

        Args:
            email: Omnistrate user email
            password: Omnistrate user password
        """
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self._authenticate(email, password)

    def _authenticate(self, email: str, password: str) -> None:
        """Authenticate with Omnistrate API."""
        logger.info("Authenticating with Omnistrate API")
        try:
            response = self.session.post(
                "https://api.omnistrate.cloud/2022-09-01-00/signin",
                json={"email": email, "password": password},
            )
            response.raise_for_status()
            token = response.json().get("jwtToken")
            if not token:
                raise Exception("No JWT token received from Omnistrate")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            logger.info("Successfully authenticated with Omnistrate API")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to authenticate with Omnistrate: {e}")
            raise

    def get_instances(
        self, service_id: str, environment_id: str, product_tier: Optional[str] = None
    ) -> List[Dict]:
        """
        Get all instances for a service/environment, optionally filtered by product tier.

        Args:
            service_id: Omnistrate service ID
            environment_id: Omnistrate environment ID
            product_tier: Optional product tier name to filter by

        Returns:
            List of instance dictionaries
        """
        logger.info(
            f"Fetching instances for service {service_id}, environment {environment_id}"
        )
        try:
            # First, get all subscriptions
            response = self.session.get(
                f"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/{service_id}/environment/{environment_id}/subscription"
            )
            response.raise_for_status()
            subscriptions = response.json().get("subscriptions", [])

            logger.info(f"Found {len(subscriptions)} subscriptions")

            # Filter by product tier if specified
            if product_tier:
                subscriptions = [
                    sub
                    for sub in subscriptions
                    if sub.get("productTierName") == product_tier
                ]
                logger.info(
                    f"Filtered to {len(subscriptions)} subscriptions with product tier '{product_tier}'"
                )

            # Get instances for each subscription
            all_instances = []
            for subscription in subscriptions:
                subscription_id = subscription.get("id")
                logger.debug(f"Fetching instances for subscription {subscription_id}")

                response = self.session.get(
                    f"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/{service_id}/environment/{environment_id}/instances?SubscriptionId={subscription_id}"
                )
                response.raise_for_status()
                instances = response.json().get("resourceInstances", [])
                all_instances.extend(instances)

            logger.info(f"Found {len(all_instances)} total instances")
            return all_instances

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch instances from Omnistrate: {e}")
            raise

    def get_instance_details(
        self, service_id: str, environment_id: str, instance_id: str
    ) -> Dict:
        """
        Get detailed information for a specific instance.

        Args:
            service_id: Omnistrate service ID
            environment_id: Omnistrate environment ID
            instance_id: Instance ID

        Returns:
            Instance details dictionary
        """
        logger.debug(f"Fetching details for instance {instance_id}")
        try:
            response = self.session.get(
                f"https://api.omnistrate.cloud/2022-09-01-00/fleet/service/{service_id}/environment/{environment_id}/instance/{instance_id}"
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch instance details for {instance_id}: {e}")
            raise


class LdapUserImporter:
    """Handles importing users into LDAP via the customer-ldap API."""

    def __init__(
        self,
        api_base_url: str,
        gcp_service_account_email: Optional[str] = None,
        dry_run: bool = False,
    ):
        """
        Initialize the importer.

        Args:
            api_base_url: Base URL of the customer-ldap API
            gcp_service_account_email: GCP service account email to impersonate
            dry_run: If True, only validate without creating users
        """
        self.api_base_url = api_base_url.rstrip("/")
        self.dry_run = dry_run
        self.gcp_service_account_email = gcp_service_account_email
        self.session = requests.Session()

        # Set headers for GCP service account authentication
        self.session.headers.update({
            "Content-Type": "application/json",
            "x-auth-mode": "gcp-sa"
        })

        # Get GCP service account token if email provided
        if gcp_service_account_email:
            token = self._get_gcp_token()
            self.session.headers.update({"Authorization": f"Bearer {token}"})

    def _get_gcp_token(self) -> str:
        """
        Get GCP service account access token for impersonation.

        Returns:
            Access token string
        """
        try:
            import google.auth
            import google.auth.transport.requests
            from google.auth import impersonated_credentials

            # Get default credentials
            source_credentials, _ = google.auth.default()

            # Create impersonated credentials
            target_credentials = impersonated_credentials.Credentials(
                source_credentials=source_credentials,
                target_principal=self.gcp_service_account_email,
                target_scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )

            # Refresh to get the token
            auth_request = google.auth.transport.requests.Request()
            target_credentials.refresh(auth_request)

            return target_credentials.token
        except ImportError:
            logger.error(
                "google-auth library not installed. Install with: pip install google-auth"
            )
            raise
        except Exception as e:
            logger.error(f"Failed to get GCP service account token: {e}")
            raise

    def create_user(
        self, instance_id: str, username: str, password: str, acl: str
    ) -> bool:
        """
        Create a user in LDAP for the given instance.

        Args:
            instance_id: Instance ID (namespace)
            username: Username to create
            password: User password
            acl: ACL permissions string

        Returns:
            True if successful, False otherwise
        """
        url = f"{self.api_base_url}/v1/instances/{instance_id}"

        payload = {
            "username": username,
            "password": password,
            "acl": acl,
        }

        if self.dry_run:
            logger.info(
                f"[DRY RUN] Would create user '{username}' in instance '{instance_id}'"
            )
            return True

        try:
            response = self.session.post(url, json=payload)

            if response.status_code == 201:
                logger.info(
                    f"Successfully created user '{username}' in instance '{instance_id}'"
                )
                return True
            elif response.status_code == 409:
                logger.warning(
                    f"User '{username}' already exists in instance '{instance_id}'"
                )
                return True
            else:
                logger.error(
                    f"Failed to create user '{username}' in instance '{instance_id}': "
                    f"HTTP {response.status_code} - {response.text}"
                )
                return False

        except requests.exceptions.RequestException as e:
            logger.error(
                f"Network error creating user '{username}' in instance '{instance_id}': {e}"
            )
            return False


def main():
    parser = argparse.ArgumentParser(
        description="Import users into LDAP from Omnistrate instances",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
This script fetches instances from Omnistrate and creates LDAP users
using the credentials stored in each instance's result_params.

Workflow:
  1. Authenticate with Omnistrate API
  2. Fetch instances for the specified service/environment/product-tier
  3. Extract falkordbUsername and falkordbPassword from result_params
  4. Create LDAP users via customer-ldap API with ALLOWED_ACL permissions

Example:
  python3 scripts/import_users_ldap.py \\
    --omnistrate-email user@example.com \\
    --omnistrate-password "password123" \\
    --omnistrate-service-id "service-abc-123" \\
    --omnistrate-environment-id "env-xyz-456" \\
    --product-tier "FalkorDB Cloud" \\
    --ldap-api-url https://customer-ldap.dev.falkordb.cloud \\
    --gcp-service-account-email "sa@project.iam.gserviceaccount.com"
        """,
    )

    parser.add_argument(
        "--omnistrate-email",
        required=True,
        help="Omnistrate account email",
    )

    parser.add_argument(
        "--omnistrate-password",
        required=True,
        help="Omnistrate account password",
    )

    parser.add_argument(
        "--omnistrate-service-id",
        required=True,
        help="Omnistrate service ID",
    )

    parser.add_argument(
        "--omnistrate-environment-id",
        required=True,
        help="Omnistrate environment ID",
    )

    parser.add_argument(
        "--product-tier",
        help="Filter instances by product tier name (e.g., 'FalkorDB Cloud')",
    )

    parser.add_argument(
        "--ldap-api-url",
        required=True,
        help="Base URL of the customer-ldap API (e.g., https://customer-ldap.dev.falkordb.cloud)",
    )

    parser.add_argument(
        "--gcp-service-account-email",
        help="GCP service account email to impersonate for authentication",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without creating users",
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose debug logging",
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Initialize Omnistrate client
    try:
        omnistrate = OmnistrateClient(
            email=args.omnistrate_email, password=args.omnistrate_password
        )
    except Exception as e:
        logger.error(f"Failed to initialize Omnistrate client: {e}")
        sys.exit(1)

    # Initialize LDAP importer
    importer = LdapUserImporter(
        api_base_url=args.ldap_api_url,
        gcp_service_account_email=args.gcp_service_account_email,
        dry_run=args.dry_run,
    )

    # Fetch instances
    logger.info("Starting import process")
    if args.dry_run:
        logger.info("DRY RUN MODE - No users will be created")

    try:
        instances = omnistrate.get_instances(
            service_id=args.omnistrate_service_id,
            environment_id=args.omnistrate_environment_id,
            product_tier=args.product_tier,
        )
    except Exception as e:
        logger.error(f"Failed to fetch instances: {e}")
        sys.exit(1)

    # Import users
    stats = {"success": 0, "failed": 0, "skipped": 0}

    # Detailed tracking for reporting
    success_instances = []
    failed_instances = []
    skipped_instances = []

    # Standard ACL from constants.ts
    ALLOWED_ACL = "+INFO +CLIENT +DBSIZE +PING +HELLO +AUTH +RESTORE +DUMP +DEL +EXISTS +UNLINK +TYPE +FLUSHALL +TOUCH +EXPIRE +PEXPIREAT +TTL +PTTL +EXPIRETIME +RENAME +RENAMENX +SCAN +DISCARD +EXEC +MULTI +UNWATCH +WATCH +ECHO +SLOWLOG +WAIT +WAITAOF +READONLY +GRAPH.INFO +GRAPH.LIST +GRAPH.QUERY +GRAPH.RO_QUERY +GRAPH.EXPLAIN +GRAPH.PROFILE +GRAPH.DELETE +GRAPH.CONSTRAINT +GRAPH.SLOWLOG +GRAPH.BULK +GRAPH.CONFIG +GRAPH.COPY +CLUSTER +COMMAND +GRAPH.MEMORY +MEMORY +BGREWRITEAOF +MODULE|LIST +MONITOR"

    for instance in instances:
        instance_result = instance.get("consumptionResourceInstanceResult", {})
        instance_id = instance_result.get("id")

        if not instance_id:
            reason = "Instance missing ID"
            logger.warning(reason)
            stats["skipped"] += 1
            skipped_instances.append({"instance_id": "UNKNOWN", "reason": reason})
            continue

        # Extract credentials from result_params
        result_params = instance_result.get("result_params", {})
        falkordb_username = result_params.get("falkordbUser")
        falkordb_password = result_params.get("falkordbPassword")

        if not falkordb_username or not falkordb_password:
            reason = f"Missing {'falkordbUser' if not falkordb_username else 'falkordbPassword'} in result_params"
            logger.warning(f"Instance {instance_id}: {reason}, skipping")
            stats["skipped"] += 1
            skipped_instances.append({"instance_id": instance_id, "reason": reason})
            continue

        # Create user with standard ACL
        acl = f"~* {ALLOWED_ACL}"
        success = importer.create_user(
            instance_id=instance_id,
            username=falkordb_username,
            password=falkordb_password,
            acl=acl,
        )

        if success:
            stats["success"] += 1
            success_instances.append({
                "instance_id": instance_id,
                "username": falkordb_username
            })
        else:
            stats["failed"] += 1
            failed_instances.append({
                "instance_id": instance_id,
                "username": falkordb_username,
                "reason": "LDAP API error (see logs above)"
            })

    # Print detailed summary
    logger.info("=" * 70)
    logger.info("IMPORT REPORT")
    logger.info("=" * 70)
    logger.info(f"Total Instances: {len(instances)}")
    logger.info(f"  ✓ Success: {stats['success']}")
    logger.info(f"  ✗ Failed:  {stats['failed']}")
    logger.info(f"  ⊘ Skipped: {stats['skipped']}")
    logger.info("=" * 70)

    if success_instances:
        logger.info("")
        logger.info("SUCCESSFUL IMPORTS:")
        logger.info("-" * 70)
        for item in success_instances:
            logger.info(f"  ✓ {item['instance_id']:40} | user: {item['username']}")

    if failed_instances:
        logger.info("")
        logger.info("FAILED IMPORTS:")
        logger.info("-" * 70)
        for item in failed_instances:
            logger.info(f"  ✗ {item['instance_id']:40} | user: {item['username']}")
            logger.info(f"    Reason: {item['reason']}")

    if skipped_instances:
        logger.info("")
        logger.info("SKIPPED INSTANCES:")
        logger.info("-" * 70)
        for item in skipped_instances:
            logger.info(f"  ⊘ {item['instance_id']:40}")
            logger.info(f"    Reason: {item['reason']}")

    logger.info("")
    logger.info("=" * 70)

    # Exit with appropriate code
    if stats["failed"] > 0:
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
