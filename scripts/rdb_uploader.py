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
import subprocess
import argparse
import datetime

import google.auth
from google.auth import impersonated_credentials
from google.cloud import storage


def get_signed_url(
    bucket_name: str,
    object_path: str,
    expiration_minutes: int,
    method: str = "GET",
    sa_email: str | None = None,
) -> str:
    """
    Generate a signed URL for a GCS object.

    Uses google.auth.impersonated_credentials so the WIF federated token
    impersonates the SA (via IAM generateAccessToken), which then signs
    the URL locally. Requires:
      - create_credentials_file: true in the google-github-actions/auth step
        (writes a credentials JSON that google.auth.default() can read)
      - roles/iam.serviceAccountTokenCreator granted on the SA to itself
    """
    _sa_email = sa_email or os.environ.get("GCS_SA")
    if not _sa_email:
        raise EnvironmentError("GCS_SA env var (or --sa) is not set")

    # Read WIF credentials from the file written by google-github-actions/auth
    source_credentials, project = google.auth.default(
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

    # Impersonate the SA — the WIF token calls IAM generateAccessToken on its
    # behalf, yielding real SA credentials that can sign bytes locally.
    signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=_sa_email,
        target_scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )

    client = storage.Client(credentials=signing_credentials, project=project)
    blob = client.bucket(bucket_name).blob(object_path)

    return blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=expiration_minutes),
        method=method,
        credentials=signing_credentials,  # must be explicit, not just on the client
    )


def kubectl_exec(namespace: str, pod: str, container: str, command: list[str]) -> None:
    """Run a command inside a pod via kubectl exec. Raises on failure."""
    cmd = [
        "kubectl", "exec",
        "-n", namespace,
        "-c", container,
        pod, "--",
    ] + command

    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        raise RuntimeError(
            f"kubectl exec failed with exit code {result.returncode}: {' '.join(command)}"
        )


def write_github_output(key: str, value: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"{key}={value}\n")
    print(f"  Output: {key}={value}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload Redis RDB (and AOF) to GCS")
    parser.add_argument("--namespace",  required=True,  help="Kubernetes namespace")
    parser.add_argument("--pod",        required=True,  help="Pod name")
    parser.add_argument("--container",  required=False, help="Container name (not needed for --sign-only)")
    parser.add_argument("--bucket",     required=True,  help="GCS bucket name")
    parser.add_argument("--sa",         required=False, help="Service-account email for signing (overrides GCS_SA env var)")
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

    if args.sign_only:
        # ------------------------------------------------------------------
        # Sign-only: just regenerate GET URLs — no pod access whatsoever
        # ------------------------------------------------------------------
        print("[1/1] Regenerating signed download URLs (72h)...")
        rdb_url = get_signed_url(args.bucket, rdb_object, expiration_minutes=72 * 60, sa_email=args.sa)
        write_github_output("rdb_url", rdb_url)

        if aof_enabled:
            aof_url = get_signed_url(args.bucket, aof_object, expiration_minutes=72 * 60, sa_email=args.sa)
            write_github_output("aof_url", aof_url)

    else:
        # ------------------------------------------------------------------
        # Upload: sign PUT URLs → pod curl-PUTs → sign GET URLs
        # ------------------------------------------------------------------
        if not args.container:
            print("ERROR: --container is required in upload mode", file=sys.stderr)
            sys.exit(1)

        # 1. Generate signed PUT URLs (1h)
        print("[1/3] Generating signed PUT URLs (1h)...")
        rdb_put_url = get_signed_url(args.bucket, rdb_object, expiration_minutes=60, method="PUT", sa_email=args.sa)
        print("  RDB PUT URL generated.")

        aof_put_url = None
        if aof_enabled:
            aof_put_url = get_signed_url(args.bucket, aof_object, expiration_minutes=60, method="PUT", sa_email=args.sa)
            print("  AOF PUT URL generated.")

        # 2. Pod uploads directly to GCS via curl
        print("\n[2/3] Uploading from pod to GCS...")
        print("  Uploading dump.rdb...")
        kubectl_exec(args.namespace, args.pod, args.container, [
            "curl", "-X", "PUT", "--fail", "--silent", "--show-error",
            "-H", "Content-Type: application/octet-stream",
            "--upload-file", "/data/dump.rdb",
            rdb_put_url,
        ])
        print("  dump.rdb uploaded successfully.")

        if aof_enabled:
            print("  Archiving appendonlydir on pod...")
            kubectl_exec(args.namespace, args.pod, args.container, [
                "tar", "-czf", "/data/appendonlydir.tar.gz",
                "-C", "/data/appendonlydir", ".",
            ])
            print("  Uploading appendonlydir.tar.gz...")
            kubectl_exec(args.namespace, args.pod, args.container, [
                "curl", "-X", "PUT", "--fail", "--silent", "--show-error",
                "-H", "Content-Type: application/octet-stream",
                "--upload-file", "/data/appendonlydir.tar.gz",
                aof_put_url,
            ])
            print("  appendonlydir.tar.gz uploaded successfully.")

        # 3. Generate signed GET/download URLs (72h)
        print("\n[3/3] Generating signed download URLs (72h)...")
        rdb_url = get_signed_url(args.bucket, rdb_object, expiration_minutes=72 * 60, sa_email=args.sa)
        write_github_output("rdb_url", rdb_url)

        if aof_enabled:
            aof_url = get_signed_url(args.bucket, aof_object, expiration_minutes=72 * 60, sa_email=args.sa)
            write_github_output("aof_url", aof_url)

    print(f"\n{'='*60}")
    print("✅ Done!")
    print(f"{'='*60}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
