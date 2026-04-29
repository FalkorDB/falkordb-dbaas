"""
Custom tools for AI OOM triage Copilot SDK session.

Each tool gives the AI access to the same data sources an engineer
uses when investigating a ContainerOOMKilled event:
  - VictoriaMetrics (PromQL range queries for memory, CPU, command stats)
  - VictoriaLogs (pod logs — errors, slow queries, command output)
  - RDB/AOF dumps and local FalkorDB instance for database inspection
"""

import os
import re
import json
import subprocess
import tarfile
import tempfile
from datetime import datetime, timedelta, timezone
from typing import Optional

import requests
from pydantic import BaseModel, Field
from copilot import define_tool
from google.cloud import storage as gcs_storage


# ---------------------------------------------------------------------------
# Shared state & helpers
# ---------------------------------------------------------------------------

_local_container_id: Optional[str] = None
_work_dir: Optional[str] = None


def _download_gcs_or_url(url: str, dest: str) -> Optional[str]:
    """Download a file from a gs:// path (using ADC) or HTTPS URL.

    Returns an error string on failure, or None on success.
    """
    try:
        if url.startswith("gs://"):
            without_scheme = url[len("gs://"):]
            bucket_name, _, blob_name = without_scheme.partition("/")
            client = gcs_storage.Client()
            bucket = client.bucket(bucket_name)
            bucket.blob(blob_name).download_to_filename(dest)
        else:
            with requests.get(url, timeout=300, stream=True) as resp:
                resp.raise_for_status()
                with open(dest, "wb") as f:
                    for chunk in resp.iter_content(chunk_size=8 * 1024 * 1024):
                        f.write(chunk)
    except Exception as exc:
        return f"ERROR: Failed to download {url}: {exc}"
    return None


def _safe_extract_tar(tar_path: str, dest_dir: str) -> Optional[str]:
    """Safely extract a tar archive, rejecting path-traversal attempts."""
    real_dest = os.path.realpath(dest_dir)
    try:
        with tarfile.open(tar_path, "r:gz") as tf:
            for member in tf.getmembers():
                member_path = os.path.realpath(os.path.join(dest_dir, member.name))
                if not member_path.startswith(real_dest + os.sep) and member_path != real_dest:
                    return f"ERROR: Tar member escapes target directory: {member.name}"
                if member.issym() or member.islnk():
                    link_target = os.path.realpath(os.path.join(dest_dir, member.linkname))
                    if not link_target.startswith(real_dest + os.sep) and link_target != real_dest:
                        return f"ERROR: Tar symlink escapes target directory: {member.name} -> {member.linkname}"
            tf.extractall(path=dest_dir)
    except Exception as exc:
        return f"ERROR: Failed to extract {tar_path}: {exc}"
    return None


# ---------------------------------------------------------------------------
# Tool: query_metrics
# ---------------------------------------------------------------------------

class QueryMetricsParams(BaseModel):
    expr: str = Field(description=(
        "PromQL expression to query. You may use any valid PromQL. "
        "Examples: "
        "'redis_memory_used_bytes{namespace=\"instance-abc\", pod=\"node-f-0\", container=\"service\"}', "
        "'rate(redis_commands_total{namespace=\"instance-abc\", pod=\"node-f-0\"}[5m])'"
    ))
    start_minutes_ago: int = Field(default=60, description="Start of time range in minutes before now (e.g. 10080 for 7 days)")
    end_minutes_ago: int = Field(default=0, description="End of time range in minutes before now (0 = now)")
    step: str = Field(default="60s", description="Query resolution step (e.g. '15s', '60s', '1h')")


@define_tool(
    name="query_metrics",
    description=(
        "Query VictoriaMetrics with a PromQL range query. Returns time-series data "
        "points for the given expression and time window. Use this to analyze memory "
        "usage trends, command rates, CPU usage, and any other metric available in "
        "VictoriaMetrics. You can write any valid PromQL expression.\n\n"
        "Available metrics include:\n"
        "- redis_memory_used_bytes, redis_memory_max_bytes (FalkorDB memory)\n"
        "- container_memory_rss, container_memory_working_set_bytes (container memory)\n"
        "- redis_commands_total, redis_commands_duration_seconds_total (command stats)\n"
        "- redis_connected_clients, redis_blocked_clients (connections)\n"
        "- redis_net_input_bytes_total, redis_net_output_bytes_total (network I/O)\n"
        "- redis_slowlog_history_last_ten (slow queries)\n"
        "- redis_db_keys (key counts)\n"
        "- redis_falkordb_total_graph_count (graph count)\n"
        "- kube_pod_container_resource_limits, kube_pod_container_resource_requests (K8s resources)"
    ),
    skip_permission=True,
)
async def query_metrics(params: QueryMetricsParams) -> str:
    vmauth_url = os.environ.get("VMAUTH_URL", "").rstrip("/")
    username = os.environ.get("VMAUTH_METRICS_USERNAME", "")
    password = os.environ.get("VMAUTH_METRICS_PASSWORD", "")
    if not all([vmauth_url, username, password]):
        return "ERROR: VMAUTH_URL, VMAUTH_METRICS_USERNAME, and VMAUTH_METRICS_PASSWORD env vars required"

    verify_ssl = os.environ.get("ENVIRONMENT", "prod").lower() != "dev"

    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=params.start_minutes_ago)
    end = now - timedelta(minutes=params.end_minutes_ago)

    resp = requests.get(
        f"{vmauth_url}/api/v1/query_range",
        params={
            "query": params.expr,
            "start": int(start.timestamp()),
            "end": int(end.timestamp()),
            "step": params.step,
        },
        auth=(username, password),
        timeout=60,
        verify=verify_ssl,
    )

    if resp.status_code == 401:
        return "ERROR: Authentication failed (401). Check VMAUTH_METRICS_USERNAME and VMAUTH_METRICS_PASSWORD."
    if resp.status_code == 403:
        return "ERROR: Access forbidden (403). Check credentials and VMAuth path permissions."
    if resp.status_code != 200:
        return f"ERROR: VictoriaMetrics returned {resp.status_code}: {resp.text[:500]}"

    data = resp.json()
    if data.get("status") != "success":
        return f"ERROR: Query failed: {data.get('error', 'unknown error')}"

    results = data.get("data", {}).get("result", [])
    if not results:
        return f"No data returned for query: {params.expr}"

    # Format results for readability
    output_parts = [f"Query: {params.expr}", f"Time range: {start.isoformat()} to {end.isoformat()}", f"Step: {params.step}", ""]

    for series in results:
        metric = series.get("metric", {})
        values = series.get("values", [])

        # Build label string
        labels = ", ".join(f'{k}="{v}"' for k, v in metric.items() if k != "__name__")
        metric_name = metric.get("__name__", "result")
        header = f"{metric_name}{{{labels}}}" if labels else metric_name
        output_parts.append(f"### {header}")
        output_parts.append(f"Data points: {len(values)}")

        if not values:
            output_parts.append("(no data)")
            continue

        # Show summary stats
        numeric_values = []
        for ts, val in values:
            try:
                numeric_values.append(float(val))
            except (ValueError, TypeError):
                pass

        if numeric_values:
            output_parts.append(
                f"Min: {min(numeric_values):.2f} | "
                f"Max: {max(numeric_values):.2f} | "
                f"Last: {numeric_values[-1]:.2f} | "
                f"Avg: {sum(numeric_values)/len(numeric_values):.2f}"
            )

        # Show data points — for large datasets, sample to avoid overwhelming output
        if len(values) <= 30:
            for ts, val in values:
                dt = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
                output_parts.append(f"  {dt}  {val}")
        else:
            # Show first 10, skip middle, show last 10
            for ts, val in values[:10]:
                dt = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
                output_parts.append(f"  {dt}  {val}")
            output_parts.append(f"  ... ({len(values) - 20} more data points) ...")
            for ts, val in values[-10:]:
                dt = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
                output_parts.append(f"  {dt}  {val}")

        output_parts.append("")

    return "\n".join(output_parts)


# ---------------------------------------------------------------------------
# Tool: fetch_logs
# ---------------------------------------------------------------------------

class FetchLogsParams(BaseModel):
    namespace: str = Field(description="Kubernetes namespace / instance ID")
    pod: str = Field(description="Pod name")
    container: str = Field(default="service", description="Container name")
    minutes: int = Field(default=30, description="How many minutes of logs to fetch (default 30 for OOM investigation)")


@define_tool(
    name="fetch_logs",
    description=(
        "Fetch logs from VictoriaLogs for a specific pod. Returns cleaned log lines "
        "with timestamps stripped. Use this to look for errors, large queries, "
        "slow operations, or any suspicious activity before the OOM event."
    ),
    skip_permission=True,
)
async def fetch_logs(params: FetchLogsParams) -> str:
    vmauth_url = os.environ.get("VMAUTH_URL", "").rstrip("/")
    vmauth_user = os.environ.get("VMAUTH_USERNAME", "")
    vmauth_pass = os.environ.get("VMAUTH_PASSWORD", "")
    if not all([vmauth_url, vmauth_user, vmauth_pass]):
        return "ERROR: VMAUTH_URL, VMAUTH_USERNAME, and VMAUTH_PASSWORD env vars required"

    verify_ssl = os.environ.get("ENVIRONMENT", "prod").lower() != "dev"

    end = datetime.now(timezone.utc)
    start = end - timedelta(minutes=params.minutes)
    query = f'{{namespace="{params.namespace}", pod="{params.pod}", container="{params.container}"}}'

    resp = requests.get(
        f"{vmauth_url}/select/logsql/query",
        params={
            "query": query,
            "start": int(start.timestamp() * 1e9),
            "end": int(end.timestamp() * 1e9),
            "limit": 50000,
        },
        auth=(vmauth_user, vmauth_pass),
        timeout=60,
        verify=verify_ssl,
    )

    if resp.status_code == 401:
        return "ERROR: Authentication failed (401). Check VMAUTH_USERNAME and VMAUTH_PASSWORD."
    if resp.status_code == 403:
        return "ERROR: Access forbidden (403)."
    if resp.status_code != 200:
        return f"ERROR: VictoriaLogs returned {resp.status_code}: {resp.text[:500]}"

    lines = []
    for raw in resp.text.strip().split("\n"):
        if not raw:
            continue
        try:
            msg = json.loads(raw).get("_msg", "")
        except json.JSONDecodeError:
            continue
        if msg:
            lines.append(msg)

    if not lines:
        return "No logs found for the given parameters."

    # Strip timestamp prefixes (GCP, K8s, Redis PID layers)
    cleaned = []
    ts_pattern = re.compile(
        r"^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d+\t"
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s(?:stdout|stderr)\sF\s"
        r"(?:\d+:[A-Z]\s\d{2}\s\w+\s\d{4}\s\d{2}:\d{2}:\d{2}\.\d+\s)?"
    )
    for line in lines:
        cleaned.append(ts_pattern.sub("", line))

    full_log = "\n".join(cleaned)
    return f"=== LOGS ({len(cleaned)} lines, last {params.minutes} minutes) ===\n\n{full_log}"


# ---------------------------------------------------------------------------
# Tool: run_falkordb_local
# ---------------------------------------------------------------------------

class RunFalkorDBLocalParams(BaseModel):
    rdb_url: str = Field(default="", description="GCS path (gs://...) or signed URL to download dump.rdb")
    aof_url: str = Field(default="", description="GCS path (gs://...) or signed URL to download appendonlydir.tar.gz")
    version: str = Field(default="latest", description="FalkorDB Docker image tag")


@define_tool(
    name="run_falkordb_local",
    description=(
        "Start a local FalkorDB Docker container, optionally loading an RDB dump "
        "and/or AOF directory from GCS paths (gs://...). Use this to inspect the "
        "database state at the time of the OOM — run INFO ALL, GRAPH.LIST, DBSIZE, "
        "etc. to understand the database size and structure."
    ),
)
async def run_falkordb_local(params: RunFalkorDBLocalParams) -> str:
    global _local_container_id, _work_dir

    if _local_container_id:
        subprocess.run(["docker", "rm", "-f", _local_container_id], capture_output=True)

    _work_dir = tempfile.mkdtemp(prefix="falkordb_oom_triage_")
    data_dir = os.path.join(_work_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    if params.rdb_url:
        rdb_path = os.path.join(data_dir, "dump.rdb")
        err = _download_gcs_or_url(params.rdb_url, rdb_path)
        if err:
            return err

    if params.aof_url:
        aof_tar = os.path.join(_work_dir, "appendonlydir.tar.gz")
        err = _download_gcs_or_url(params.aof_url, aof_tar)
        if err:
            return err
        err = _safe_extract_tar(aof_tar, data_dir)
        if err:
            return err

    image = f"falkordb/falkordb:{params.version}"
    result = subprocess.run(
        [
            "docker", "run", "-d",
            "--name", "falkordb-oom-triage",
            "-p", "6399:6379",
            "-v", f"{data_dir}:/data",
            image,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return f"ERROR: Docker run failed: {result.stderr}"

    _local_container_id = result.stdout.strip()
    return (
        f"FalkorDB container started.\n"
        f"Container: {_local_container_id[:12]}\n"
        f"Image: {image}\n"
        f"Port: 6399\n"
        f"Data dir: {data_dir}\n"
        f"Connect with: redis-cli -p 6399"
    )


# ---------------------------------------------------------------------------
# Tool: execute_query
# ---------------------------------------------------------------------------

class ExecuteQueryParams(BaseModel):
    command: str = Field(description="Redis/FalkorDB command to execute (e.g. 'INFO memory', 'DBSIZE', 'GRAPH.LIST')")
    port: int = Field(default=6399, description="Redis port of local instance")


@define_tool(
    name="execute_query",
    description=(
        "Execute a Redis or FalkorDB command on the local Docker instance. "
        "Use this to inspect the database state: INFO ALL, INFO memory, DBSIZE, "
        "GRAPH.LIST, CONFIG GET maxmemory, etc. "
        "The local instance runs on port 6399 by default."
    ),
)
async def execute_query(params: ExecuteQueryParams) -> str:
    if not _local_container_id:
        return "ERROR: No local FalkorDB container running. Use run_falkordb_local first."

    result = subprocess.run(
        ["redis-cli", "-p", str(params.port)] + params.command.split(),
        capture_output=True,
        text=True,
        timeout=30,
    )

    output = result.stdout
    if result.returncode != 0:
        output += f"\nSTDERR: {result.stderr}"
        output += f"\nReturn code: {result.returncode}"

    return output[:5000] if output else "(empty output)"


# ---------------------------------------------------------------------------
# Collect all tools + cleanup
# ---------------------------------------------------------------------------

ALL_TOOLS = [
    query_metrics,
    fetch_logs,
    run_falkordb_local,
    execute_query,
]


def cleanup():
    """Clean up local Docker container if running."""
    global _local_container_id, _work_dir
    if _local_container_id:
        subprocess.run(["docker", "rm", "-f", _local_container_id], capture_output=True)
        _local_container_id = None
    if _work_dir:
        import shutil
        shutil.rmtree(_work_dir, ignore_errors=True)
        _work_dir = None
