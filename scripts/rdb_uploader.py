#!/usr/bin/env python3
"""
RDB Uploader
Generates signed GCS PUT URLs then triggers the Redis pod to upload
its RDB (and optionally AOF) directly to GCS via kubectl exec + curl.
Finally writes the gs:// bucket paths to GITHUB_OUTPUT (IAM authentication
required to download — no publicly-accessible signed URLs are produced).

Mirrors the logic of upload_to_gcp.sh.
"""

import os
import sys
import subprocess
import argparse
import datetime

import google.auth
import google.auth.transport.requests
from google.cloud import storage


def _load_credentials():
    """Load Application Default Credentials (set by google-github-actions/auth)."""
    credentials, _project = google.auth.default(
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )
    # Refresh to obtain an access token (needed for IAM signBlob-based signing)
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials


def get_signed_url(
    blob: storage.Blob,
    credentials,
    expiration_minutes: int,
    method: str = "GET",
) -> str:
    """Generate a v4 signed URL for a GCS blob using IAM signBlob API."""
    sa_email = os.environ.get("GCS_SA_EMAIL")
    if not sa_email:
        raise EnvironmentError("GCS_SA_EMAIL env var is not set")
    return blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=expiration_minutes),
        method=method,
        service_account_email=sa_email,
        access_token=credentials.token,
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


def kubectl_wait_pod_ready(namespace: str, pod: str,
                           timeout: int = _KUBECTL_TIMEOUT) -> None:
    """Wait for the pod to pass its liveness/readiness checks via kubectl wait."""
    print(f"  Checking pod status — waiting for {pod} to be Ready (timeout: {timeout}s)...")
    result = subprocess.run(
        ["kubectl", "wait", "pod", pod,
         "-n", namespace,
         "--for=condition=Ready",
         f"--timeout={timeout}s"],
        check=False,
        timeout=timeout + 10,
    )
    if result.returncode == 0:
        print(f"  Pod {pod} is Ready.")
    else:
        print(f"  ⚠️  Pod {pod} did not become Ready within {timeout}s, proceeding with retry anyway.")


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


def kubectl_exec_output(
    namespace: str,
    pod: str,
    container: str,
    command: list[str],
) -> str | None:
    """Run a command inside a pod and return its stdout, or None on failure."""
    cmd = [
        "kubectl", "exec",
        "-n", namespace,
        "-c", container,
        pod, "--",
    ] + command
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, check=False, timeout=_KUBECTL_TIMEOUT)
    if result.returncode != 0:
        print(f"  ⚠️  Command exited with code {result.returncode}")
        return None
    return result.stdout


def parse_falkordb_version(module_list_output: str) -> str | None:
    """Parse FalkorDB version from MODULE LIST output.

    The 'graph' module reports its version as a single integer MNNPP where
    M=major, NN=minor, PP=patch.  e.g. 41608 → v4.16.8, 41800 → v4.18.0.
    """
    import re
    # Match lines like:  "ver"  or  3) "ver"  followed by the integer
    for match in re.finditer(r'"ver"\s*\n\s*\d+\)\s*\(integer\)\s*(\d+)', module_list_output):
        ver = int(match.group(1))
        major = ver // 10000
        minor = (ver % 10000) // 100
        patch = ver % 100
        return f"v{major}.{minor}.{patch}"

    # Fallback: look for a bare integer right after "ver"
    for match in re.finditer(r'ver\s+(\d{4,6})', module_list_output):
        ver = int(match.group(1))
        major = ver // 10000
        minor = (ver % 10000) // 100
        patch = ver % 100
        return f"v{major}.{minor}.{patch}"

    return None


def detect_falkordb_version(namespace: str, pod: str, container: str) -> str:
    """Run MODULE LIST on the pod and return the FalkorDB version string."""
    output = kubectl_exec_output(namespace, pod, container, ["redis-cli", "MODULE", "LIST"])
    if not output:
        print("  ⚠️  Could not retrieve MODULE LIST — version unknown")
        return ""
    version = parse_falkordb_version(output)
    if version:
        print(f"  FalkorDB version: {version}")
        return version
    print(f"  ⚠️  Could not parse FalkorDB version from MODULE LIST output")
    return ""


def write_github_output(key: str, value: str, sensitive: bool = False) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        if sensitive:
            # Mask sensitive values (e.g. signed PUT URLs) in Actions logs
            print(f"::add-mask::{value}")
        with open(github_output, "a") as f:
            f.write(f"{key}={value}\n")
    if sensitive:
        print(f"  Output: {key}=<redacted>")
    else:
        print(f"  Output: {key}={value}")


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
    rdb_gcs_path = f"gs://{args.bucket}/{rdb_object}"
    aof_gcs_path = f"gs://{args.bucket}/{aof_object}"

    if args.sign_only:
        # ------------------------------------------------------------------
        # Sign-only: output GCS paths without accessing the pod — no
        # publicly-accessible signed URLs are produced.
        # ------------------------------------------------------------------
        print("[1/1] Outputting GCS paths (IAM authentication required to download)...")
        write_github_output("rdb_url", rdb_gcs_path)
        if aof_enabled:
            write_github_output("aof_url", aof_gcs_path)

    else:
        # ------------------------------------------------------------------
        # Upload: sign PUT URLs → pod curl-PUTs → output gs:// paths
        # ------------------------------------------------------------------
        if not args.container:
            print("ERROR: --container is required in upload mode", file=sys.stderr)
            sys.exit(1)

        # Load credentials and GCS client (needed for PUT URL signing)
        creds = _load_credentials()
        client = storage.Client(credentials=creds)
        rdb_blob = client.bucket(args.bucket).blob(rdb_object)
        aof_blob = client.bucket(args.bucket).blob(aof_object)

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

        # 2b. Detect FalkorDB version via MODULE LIST
        falkordb_version = detect_falkordb_version(args.namespace, args.pod, args.container)

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
            aof_upload_failed = False
            try:
                print("  Snapshotting appendonlydir on pod...")
                try:
                    kubectl_exec(args.namespace, args.pod, args.container, [
                        "cp", "-r", "/data/appendonlydir", "/data/appendonlydir.snapshot",
                    ])
                except RuntimeError:
                    print("  ⚠️  cp failed, checking pod status before retry...")
                    kubectl_wait_pod_ready(args.namespace, args.pod)
                    print("  Retrying cp...")
                    kubectl_exec(args.namespace, args.pod, args.container, [
                        "cp", "-r", "/data/appendonlydir", "/data/appendonlydir.snapshot",
                    ])
                print("  Archiving and uploading AOF...")
                try:
                    kubectl_exec(args.namespace, args.pod, args.container, [
                        "tar", "-czf", "/data/appendonlydir.tar.gz",
                        "-C", "/data/appendonlydir.snapshot", ".",
                    ])
                except RuntimeError:
                    print("  ⚠️  tar failed, checking pod status before retry...")
                    kubectl_wait_pod_ready(args.namespace, args.pod)
                    print("  Retrying tar...")
                    kubectl_exec(args.namespace, args.pod, args.container, [
                        "tar", "-czf", "/data/appendonlydir.tar.gz",
                        "-C", "/data/appendonlydir.snapshot", ".",
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
            except RuntimeError as e:
                print(f"  ⚠️  AOF upload failed: {e}")
                aof_upload_failed = True
                write_github_output("aof_upload_failed", "true")
            finally:
                print("  Cleaning up AOF artifacts on pod...")
                for _path in ["/data/appendonlydir.tar.gz", "/data/appendonlydir.snapshot"]:
                    try:
                        kubectl_exec(args.namespace, args.pod, args.container,
                                     ["rm", "-rf", _path],
                                     warn_on_exit_codes={1})
                    except Exception:
                        pass
                print("  Cleanup complete.")

        # 4. Output GCS paths (IAM authentication required to download)
        print("\n[4/4] Outputting GCS paths...")
        write_github_output("rdb_url", rdb_gcs_path)

        if aof_enabled and not aof_upload_failed:
            write_github_output("aof_url", aof_gcs_path)

        if falkordb_version:
            write_github_output("falkordb_version", falkordb_version)

    print(f"\n{'='*60}")
    print("✅ Done!")
    print(f"{'='*60}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
