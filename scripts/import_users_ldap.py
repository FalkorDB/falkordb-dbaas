#!/usr/bin/env python3
"""
Import users into LDAP for FalkorDB instances.

This script reads a CSV file containing user information and creates
users in the LDAP system for each FalkorDB instance.

CSV format:
instance_id,username,password,acl

Example:
my-instance-123,user1,password123,~* +@all
my-instance-456,user2,password456,~* +@read +@write
"""

import argparse
import csv
import logging
import sys
import requests
from typing import List, Dict, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class LdapUserImporter:
    """Handles importing users into LDAP via the customer-ldap API."""

    def __init__(
        self,
        api_base_url: str,
        session_cookie: Optional[str] = None,
        dry_run: bool = False,
    ):
        """
        Initialize the importer.

        Args:
            api_base_url: Base URL of the customer-ldap API (e.g., https://customer-ldap.dev.falkordb.cloud)
            session_cookie: Session cookie for authentication
            dry_run: If True, only validate without creating users
        """
        self.api_base_url = api_base_url.rstrip("/")
        self.dry_run = dry_run
        self.session = requests.Session()

        if session_cookie:
            self.session.cookies.set("api.falkordb.cloud_customer-ldap-session", session_cookie)

        self.session.headers.update({"Content-Type": "application/json"})

    def validate_user_data(self, user: Dict[str, str]) -> List[str]:
        """
        Validate user data.

        Args:
            user: Dictionary with instance_id, username, password, acl

        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []

        if not user.get("instance_id"):
            errors.append("Missing instance_id")

        if not user.get("username"):
            errors.append("Missing username")
        elif len(user["username"]) < 3:
            errors.append("Username must be at least 3 characters")

        if not user.get("password"):
            errors.append("Missing password")
        elif len(user["password"]) < 6:
            errors.append("Password must be at least 6 characters")

        if not user.get("acl"):
            errors.append("Missing acl")

        return errors

    def create_user(self, instance_id: str, username: str, password: str, acl: str) -> bool:
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
                f"[DRY RUN] Would create user '{username}' in instance '{instance_id}' with ACL: {acl}"
            )
            return True

        try:
            response = self.session.post(url, json=payload)

            if response.status_code == 201:
                logger.info(f"Successfully created user '{username}' in instance '{instance_id}'")
                return True
            elif response.status_code == 409:
                logger.warning(f"User '{username}' already exists in instance '{instance_id}'")
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

    def import_users_from_csv(self, csv_file_path: str) -> Dict[str, int]:
        """
        Import users from a CSV file.

        Args:
            csv_file_path: Path to CSV file

        Returns:
            Dictionary with counts: {"success": N, "failed": M, "skipped": K}
        """
        stats = {"success": 0, "failed": 0, "skipped": 0}

        try:
            with open(csv_file_path, "r", encoding="utf-8") as csvfile:
                reader = csv.DictReader(csvfile)

                # Validate CSV headers
                required_fields = {"instance_id", "username", "password", "acl"}
                if not required_fields.issubset(set(reader.fieldnames or [])):
                    logger.error(
                        f"CSV file must contain columns: {', '.join(required_fields)}"
                    )
                    return stats

                for row_num, row in enumerate(reader, start=2):
                    # Strip whitespace from all fields
                    user = {k: v.strip() for k, v in row.items()}

                    # Validate user data
                    validation_errors = self.validate_user_data(user)
                    if validation_errors:
                        logger.warning(
                            f"Row {row_num}: Validation failed - {', '.join(validation_errors)}"
                        )
                        stats["skipped"] += 1
                        continue

                    # Create user
                    success = self.create_user(
                        instance_id=user["instance_id"],
                        username=user["username"],
                        password=user["password"],
                        acl=user["acl"],
                    )

                    if success:
                        stats["success"] += 1
                    else:
                        stats["failed"] += 1

        except FileNotFoundError:
            logger.error(f"CSV file not found: {csv_file_path}")
        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")

        return stats


def main():
    parser = argparse.ArgumentParser(
        description="Import users into LDAP from CSV file",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
CSV Format:
  instance_id,username,password,acl

Example:
  my-instance-123,user1,password123,~* +@all
  my-instance-456,user2,password456,~* +@read +@write

ACL Examples:
  - Full access: ~* +@all
  - Read-only: ~* +@read
  - Custom: ~* +graph.QUERY +graph.RO_QUERY +INFO +PING
        """,
    )

    parser.add_argument(
        "--csv-file",
        required=True,
        help="Path to CSV file containing user data",
    )

    parser.add_argument(
        "--api-url",
        required=True,
        help="Base URL of the customer-ldap API (e.g., https://customer-ldap.dev.falkordb.cloud)",
    )

    parser.add_argument(
        "--session-cookie",
        help="Session cookie for authentication (api.falkordb.cloud_customer-ldap-session)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate CSV and show what would be done without creating users",
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose debug logging",
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Initialize importer
    importer = LdapUserImporter(
        api_base_url=args.api_url,
        session_cookie=args.session_cookie,
        dry_run=args.dry_run,
    )

    # Import users
    logger.info(f"Starting import from {args.csv_file}")
    if args.dry_run:
        logger.info("DRY RUN MODE - No users will be created")

    stats = importer.import_users_from_csv(args.csv_file)

    # Print summary
    logger.info("-" * 50)
    logger.info("Import Summary:")
    logger.info(f"  Success: {stats['success']}")
    logger.info(f"  Failed:  {stats['failed']}")
    logger.info(f"  Skipped: {stats['skipped']}")
    logger.info("-" * 50)

    # Exit with appropriate code
    if stats["failed"] > 0:
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
