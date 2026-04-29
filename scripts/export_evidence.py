#!/usr/bin/env python3
"""
Evidence Export — assembles a timestamped SOC 2 evidence package.

Pulls data from:
  1. GCS Evidence Locker — Prowler HTML/CSV reports + Grype JSON summaries
  2. Wazuh Manager API — agent inventory, CVE summary, alert counts

Output:
  evidence-YYYY-MM-DD/ directory with all artefacts, plus a manifest.json.

Usage:
  # Export today's evidence (requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth)
  python3 scripts/export_evidence.py --bucket falkordb-evidence-locker-XXXX

  # Export a specific date range
  python3 scripts/export_evidence.py --bucket falkordb-evidence-locker-XXXX \\
      --from-date 2025-01-01 --to-date 2025-01-31

  # Include Wazuh API exports (optional — needs network access to manager)
  python3 scripts/export_evidence.py --bucket falkordb-evidence-locker-XXXX \\
      --wazuh-url https://wazuh.example.com:55000 \\
      --wazuh-user admin --wazuh-pass SECRET

Prerequisites:
  pip install google-cloud-storage requests
"""
import argparse
import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path


def download_gcs_evidence(bucket_name: str, prefix: str, local_dir: Path) -> list[str]:
    """Download all objects under a GCS prefix to a local directory."""
    from google.cloud import storage

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blobs = list(bucket.list_blobs(prefix=prefix))
    downloaded = []

    for blob in blobs:
        if blob.name.endswith("/"):
            continue
        # Preserve the GCS path structure under local_dir
        rel_path = blob.name[len(prefix) :].lstrip("/")
        local_path = local_dir / rel_path
        local_path.parent.mkdir(parents=True, exist_ok=True)
        blob.download_to_filename(str(local_path))
        downloaded.append(rel_path)
        print(f"  Downloaded {blob.name}")

    return downloaded


def export_prowler(bucket_name: str, date_path: str, output_dir: Path) -> dict:
    """Download Prowler reports from GCS."""
    prowler_dir = output_dir / "prowler"
    prowler_dir.mkdir(parents=True, exist_ok=True)

    prefix = f"prowler/{date_path}"
    files = download_gcs_evidence(bucket_name, prefix, prowler_dir)
    return {
        "source": f"gs://{bucket_name}/{prefix}",
        "files_downloaded": len(files),
        "files": files,
    }


def export_grype(bucket_name: str, date_path: str, output_dir: Path) -> dict:
    """Download Grype CVE scan reports from GCS."""
    grype_dir = output_dir / "grype"
    grype_dir.mkdir(parents=True, exist_ok=True)

    prefix = f"grype/{date_path}"
    files = download_gcs_evidence(bucket_name, prefix, grype_dir)
    return {
        "source": f"gs://{bucket_name}/{prefix}",
        "files_downloaded": len(files),
        "files": files,
    }


def export_wazuh_inventory(
    wazuh_url: str, wazuh_user: str, wazuh_pass: str, output_dir: Path
) -> dict:
    """Export Wazuh agent inventory and vulnerability summary via API."""
    import requests
    from requests.auth import HTTPBasicAuth

    wazuh_dir = output_dir / "wazuh"
    wazuh_dir.mkdir(parents=True, exist_ok=True)

    auth = HTTPBasicAuth(wazuh_user, wazuh_pass)
    verify = False  # Wazuh uses self-signed certs by default
    results = {}

    # Authenticate and get token
    try:
        resp = requests.post(
            f"{wazuh_url}/security/user/authenticate",
            auth=auth,
            verify=verify,
            timeout=10,
        )
        resp.raise_for_status()
        token = resp.json()["data"]["token"]
    except Exception as e:
        print(f"  WARNING: Wazuh authentication failed: {e}")
        return {"error": str(e)}

    headers = {"Authorization": f"Bearer {token}"}

    # Agent inventory
    try:
        resp = requests.get(
            f"{wazuh_url}/agents",
            headers=headers,
            params={"limit": 500, "select": "id,name,ip,os.name,os.version,status,group,dateAdd,lastKeepAlive"},
            verify=verify,
            timeout=30,
        )
        resp.raise_for_status()
        agents = resp.json()
        agent_file = wazuh_dir / "agent-inventory.json"
        agent_file.write_text(json.dumps(agents, indent=2))
        results["agents"] = {
            "file": "wazuh/agent-inventory.json",
            "total": agents.get("data", {}).get("total_affected_items", 0),
        }
        print(f"  Exported {results['agents']['total']} agents")
    except Exception as e:
        print(f"  WARNING: Agent inventory export failed: {e}")
        results["agents"] = {"error": str(e)}

    # Vulnerability summary (if available)
    try:
        resp = requests.get(
            f"{wazuh_url}/vulnerability",
            headers=headers,
            params={"limit": 500, "select": "agent_id,cve,severity,status,title"},
            verify=verify,
            timeout=30,
        )
        if resp.status_code == 200:
            vulns = resp.json()
            vuln_file = wazuh_dir / "vulnerability-summary.json"
            vuln_file.write_text(json.dumps(vulns, indent=2))
            results["vulnerabilities"] = {
                "file": "wazuh/vulnerability-summary.json",
                "total": vulns.get("data", {}).get("total_affected_items", 0),
            }
            print(f"  Exported {results['vulnerabilities']['total']} vulnerabilities")
    except Exception as e:
        results["vulnerabilities"] = {"error": str(e)}

    # Alert summary (last 24h high-severity)
    try:
        resp = requests.get(
            f"{wazuh_url}/alerts",
            headers=headers,
            params={
                "limit": 1000,
                "sort": "-timestamp",
                "q": "rule.level>=10",
            },
            verify=verify,
            timeout=30,
        )
        if resp.status_code == 200:
            alerts = resp.json()
            alert_file = wazuh_dir / "high-severity-alerts.json"
            alert_file.write_text(json.dumps(alerts, indent=2))
            results["alerts"] = {
                "file": "wazuh/high-severity-alerts.json",
                "total": alerts.get("data", {}).get("total_affected_items", 0),
            }
            print(f"  Exported {results['alerts']['total']} high-severity alerts")
    except Exception as e:
        results["alerts"] = {"error": str(e)}

    # SCA (Security Configuration Assessment) results
    try:
        resp = requests.get(
            f"{wazuh_url}/sca",
            headers=headers,
            params={"limit": 500},
            verify=verify,
            timeout=30,
        )
        if resp.status_code == 200:
            sca = resp.json()
            sca_file = wazuh_dir / "sca-results.json"
            sca_file.write_text(json.dumps(sca, indent=2))
            results["sca"] = {
                "file": "wazuh/sca-results.json",
                "total": sca.get("data", {}).get("total_affected_items", 0),
            }
            print(f"  Exported {results['sca']['total']} SCA results")
    except Exception as e:
        results["sca"] = {"error": str(e)}

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Export SOC 2 evidence package from GCS Evidence Locker and Wazuh API."
    )
    parser.add_argument(
        "--bucket",
        required=True,
        help="GCS evidence locker bucket name",
    )
    parser.add_argument(
        "--from-date",
        default=None,
        help="Start date (YYYY-MM-DD). Default: today.",
    )
    parser.add_argument(
        "--to-date",
        default=None,
        help="End date (YYYY-MM-DD). Default: same as from-date.",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Output directory. Default: evidence-YYYY-MM-DD/",
    )
    parser.add_argument("--wazuh-url", default=None, help="Wazuh API URL (e.g. https://host:55000)")
    parser.add_argument("--wazuh-user", default="wazuh-wui", help="Wazuh API username")
    parser.add_argument("--wazuh-pass", default=None, help="Wazuh API password")

    args = parser.parse_args()

    # Resolve date range
    if args.from_date:
        start_date = datetime.strptime(args.from_date, "%Y-%m-%d")
    else:
        start_date = datetime.utcnow()

    if args.to_date:
        end_date = datetime.strptime(args.to_date, "%Y-%m-%d")
    else:
        end_date = start_date

    # Create output directory
    date_label = start_date.strftime("%Y-%m-%d")
    if start_date != end_date:
        date_label += f"_to_{end_date.strftime('%Y-%m-%d')}"

    output_dir = Path(args.output_dir) if args.output_dir else Path(f"evidence-{date_label}")
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Exporting evidence to {output_dir}/")
    manifest = {
        "export_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "date_range": {
            "from": start_date.strftime("%Y-%m-%d"),
            "to": end_date.strftime("%Y-%m-%d"),
        },
        "bucket": args.bucket,
        "sections": {},
    }

    # Iterate over each date in range
    current = start_date
    all_prowler = []
    all_grype = []
    while current <= end_date:
        date_path = current.strftime("%Y/%m/%d")
        print(f"\n--- {current.strftime('%Y-%m-%d')} ---")

        # Prowler reports
        print("Prowler reports:")
        prowler_result = export_prowler(args.bucket, date_path, output_dir)
        all_prowler.append(prowler_result)
        if prowler_result["files_downloaded"] == 0:
            print("  No Prowler reports found for this date.")

        # Grype reports
        print("Grype CVE reports:")
        grype_result = export_grype(args.bucket, date_path, output_dir)
        all_grype.append(grype_result)
        if grype_result["files_downloaded"] == 0:
            print("  No Grype reports found for this date.")

        current += timedelta(days=1)

    manifest["sections"]["prowler"] = all_prowler
    manifest["sections"]["grype"] = all_grype

    # Wazuh API export (optional)
    if args.wazuh_url and args.wazuh_pass:
        print("\nWazuh API exports:")
        wazuh_result = export_wazuh_inventory(
            args.wazuh_url, args.wazuh_user, args.wazuh_pass, output_dir
        )
        manifest["sections"]["wazuh"] = wazuh_result
    else:
        print("\nSkipping Wazuh API export (--wazuh-url/--wazuh-pass not provided).")

    # Write manifest
    manifest_file = output_dir / "manifest.json"
    manifest_file.write_text(json.dumps(manifest, indent=2))
    print(f"\nManifest written to {manifest_file}")

    # Summary
    total_files = sum(p["files_downloaded"] for p in all_prowler) + sum(
        g["files_downloaded"] for g in all_grype
    )
    print(f"\nEvidence export complete: {total_files} files in {output_dir}/")


if __name__ == "__main__":
    main()
