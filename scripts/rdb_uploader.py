#!/usr/bin/env python3
"""
RDB Uploader
Generates signed GCS PUT URLs then triggers the Redis pod to upload
its RDB (and optionally AOF) directly to GCS via kubectl exec + curl.
Finally generates signed GET URLs and writes them to GITHUB_OUTPUT.

Mirrors the logic of upload_to_gcp.sh.
"""

import os
import sys
import json
import subprocess
import argparse
import datetime

from google.oauth2 import service_account
from google.cloud import storage


def _load_credentials() -> service_account.Credentials:
    """Parse GCS_SA_KEY once and return SA credentials."""
    key_json = os.environ.get("GCS_SA_KEY")
    if not key_json:
        raise EnvironmentError("GCS_SA_KEY env var is not set")
    return service_account.Credentials.from_service_account_info(
        json.loads(key_json),
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )


def get_signed_url(
    blob: storage.Blob,
    credentials: service_account.Credentials,
    expiration_minutes: int,
    method: str = "GET",
) -> str:
    """Generate a v4 signed URL for a GCS blob."""
    return blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=expiration_minutes),
        method=method,
        credentials=credentials,
    )


# Timeout in seconds for kubectl subprocess calls to prevent indefinite hangs
_KUBECTL_TIMEOUT = 300  # 5 minutes


def kubectl_check_path(namespace: str, pod: str, container: str, path: str, is_dir: bool = False) -> bool:
    """Return True if path exists on the pod (file or directory)."""
    flag = "-d" if is_dir else "-f"
    result = subprocess.run(
        ["kubectl", "exec", "-n", namespace, "-c", container, pod, "--",
         "test", flag, path],
        check=False,
        timeout=_KUBECTL_TIMEOUT,
    )
    return result.returncode == 0


def kubectl_exec(
    namespace: str,
    pod: str,
    container: str,
    command: list[str],
    redact_args: list[str] | None = None,
    warn_on_exit_codes: set[int] | None = None,
) -> int:
    """Run a command inside a pod via kubectl exec. Raises on failure.

    Args:
        redact_args: List of argument values to redact in log output (e.g. signed URLs).
        warn_on_exit_codes: Set of exit codes treated as non-fatal warnings instead of errors.
            The exit code is still returned so callers can react if needed.
    """
    cmd = [
        "kubectl", "exec",
        "-n", namespace,
        "-c", container,
        pod, "--",
    ] + command

    redact_set = set(redact_args or [])
    log_cmd = ["<redacted>" if arg in redact_set else arg for arg in cmd]
    print(f"  $ {' '.join(log_cmd)}")
    result = subprocess.run(cmd, check=False, timeout=_KUBECTL_TIMEOUT)
    if result.returncode != 0:
        if warn_on_exit_codes and result.returncode in warn_on_exit_codes:
            print(f"  ⚠️  Warning: command exited with code {result.returncode} (non-fatal): {' '.join(log_cmd)}")
        else:
            raise RuntimeError(
                f"kubectl exec failed with exit code {result.returncode}: {' '.join(log_cmd)}"
            )
    return result.returncode


def write_github_output(key: str, value: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        # Mask the value in Actions logs before writing to GITHUB_OUTPUT
        print(f"::add-mask::{value}")
        with open(github_output, "a") as f:
            f.write(f"{key}={value}\n")
    print(f"  Output: {key}=<redacted>")


def mask_in_actions(value: str) -> None:
    """Register a value to be redacted in all subsequent GitHub Actions log output."""
    if os.environ.get("GITHUB_OUTPUT"):  # presence of GITHUB_OUTPUT indicates Actions runtime
        print(f"::add-mask::{value}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload Redis RDB (and AOF) to GCS")
    parser.add_argument("--namespace",  required=True,  help="Kubernetes namespace")
    parser.add_argument("--pod",        required=True,  help="Pod name")
    parser.add_argument("--container",  required=False, help="Container name (not needed for --sign-only)")
    parser.add_argument("--bucket",     required=True,  help="GCS bucket name")
    parser.add_argument("--sign-only",  action="store_true",
                        help="Skip pod access; regenerate a signed GET URL for the existing GCS object")
    args = parser.parse_args()

    # AOF is enabled for all pods except the standalone node-f-0
    aof_enabled = args.pod != "node-f-0"

    print(f"\n{'='*60}")
    print(f"RDB Uploader — {'sign-only' if args.sign_only else 'upload'} mode")
    print(f"  Pod:       {args.pod}")
    print(f"  Namespace: {args.namespace}")
    print(f"  Bucket:    gs://{args.bucket}/{args.namespace}/")
    print(f"  AOF:       {aof_enabled}")
    print(f"{'='*60}\n")

    rdb_object = f"{args.namespace}/dump.rdb"
    aof_object = f"{args.namespace}/appendonlydir.tar.gz"

    # Load credentials and GCS client once
    creds = _load_credentials()
    client = storage.Client(credentials=creds)
    rdb_blob = client.bucket(args.bucket).blob(rdb_object)
    aof_blob = client.bucket(args.bucket).blob(aof_object)

    if args.sign_only:
        # ------------------------------------------------------------------
        # Sign-only: just regenerate GET URLs — no pod access whatsoever
        # ------------------------------------------------------------------
        print("[1/1] Regenerating signed download URLs (72h)...")
        write_github_output("rdb_url", get_signed_url(rdb_blob, creds, 72 * 60))

        if aof_enabled:
            write_github_output("aof_url", get_signed_url(aof_blob, creds, 72 * 60))

    else:
        # ------------------------------------------------------------------
        # Upload: sign PUT URLs → pod curl-PUTs → sign GET URLs
        # ------------------------------------------------------------------
        if not args.container:
            print("ERROR: --container is required in upload mode", file=sys.stderr)
            sys.exit(1)

        # 1. Generate signed PUT URLs (1h)
        print("[1/4] Generating signed PUT URLs (1h)...")
        rdb_put_url = get_signed_url(rdb_blob, creds, 60, method="PUT")
        mask_in_actions(rdb_put_url)
        print("  RDB PUT URL generated.")

        aof_put_url = None
        if aof_enabled:
            aof_put_url = get_signed_url(aof_blob, creds, 60, method="PUT")
            mask_in_actions(aof_put_url)
            print("  AOF PUT URL generated.")

        # 2. Verify files exist on the pod before uploading
        print("\n[2/4] Checking files exist on pod...")
        if not kubectl_check_path(args.namespace, args.pod, args.container, "/data/dump.rdb"):
            raise RuntimeError("/data/dump.rdb not found on pod. Redis may not have persisted to disk.")
        print("  /data/dump.rdb — found.")

        if aof_enabled:
            if not kubectl_check_path(args.namespace, args.pod, args.container, "/data/appendonlydir", is_dir=True):
                raise RuntimeError("/data/appendonlydir not found on pod.")
            print("  /data/appendonlydir — found.")

        # 3. Pod uploads directly to GCS via curl
        print("\n[3/4] Uploading from pod to GCS...")
        print("  Uploading dump.rdb...")
        kubectl_exec(
            args.namespace, args.pod, args.container,
            [
                "curl", "-X", "PUT", "--fail", "--silent", "--show-error",
                "-H", "Content-Type: application/octet-stream",
                "--upload-file", "/data/dump.rdb",
                rdb_put_url,
            ],
            redact_args=[rdb_put_url],
        )
        print("  dump.rdb uploaded successfully.")

        if aof_enabled:
            print("  Snapshotting appendonlydir on pod...")
            kubectl_exec(args.namespace, args.pod, args.container, [
                "cp", "-r", "/data/appendonlydir", "/data/appendonlydir.snapshot",
            ])
            print("  Archiving snapshot (no live files — no race condition)...")
            kubectl_exec(args.namespace, args.pod, args.container, [
                "tar", "-czf", "/data/appendonlydir.tar.gz",
                "-C", "/data/appendonlydir.snapshot", ".",
            ])
            print("  Removing snapshot...")
            kubectl_exec(args.namespace, args.pod, args.container, [
                "rm", "-rf", "/data/appendonlydir.snapshot",
            ])
            print("  Uploading appendonlydir.tar.gz...")
            kubectl_exec(
                args.namespace, args.pod, args.container,
                [
                    "curl", "-X", "PUT", "--fail", "--silent", "--show-error",
                    "-H", "Content-Type: application/octet-stream",
                    "--upload-file", "/data/appendonlydir.tar.gz",
                    aof_put_url,
                ],
                redact_args=[aof_put_url],
            )
            print("  appendonlydir.tar.gz uploaded successfully.")
            print("  Cleaning up temporary archive on pod...")
            kubectl_exec(args.namespace, args.pod, args.container, [
                "rm", "-f", "/data/appendonlydir.tar.gz",
            ])
            print("  Cleanup complete.")

        # 4. Generate signed GET/download URLs (72h)
        print("\n[4/4] Generating signed download URLs (72h)...")
        write_github_output("rdb_url", get_signed_url(rdb_blob, creds, 72 * 60))

        if aof_enabled:
            write_github_output("aof_url", get_signed_url(aof_blob, creds, 72 * 60))

    print(f"\n{'='*60}")
    print("✅ Done!")
    print(f"{'='*60}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
