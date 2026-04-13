"""
Custom tools for AI crash triage Copilot SDK session.

Each tool gives the AI access to the same data sources a human engineer
uses when investigating a FalkorDB/Redis crash:
  - Crash logs from VictoriaLogs
  - FalkorDB C source code from GitHub
  - Existing GitHub issues across FalkorDB repos
  - Git history (commits, blame)
  - RDB/AOF dumps and local FalkorDB instance for reproduction
  - Previous AI triage reports for progressive analysis
"""

import os
import re
import json
import subprocess
import tempfile
import base64
from typing import Optional

import requests
from pydantic import BaseModel, Field
from copilot import define_tool


# ---------------------------------------------------------------------------
# Shared state & helpers
# ---------------------------------------------------------------------------

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}
GITHUB_API = "https://api.github.com"

FALKORDB_REPO = "FalkorDB/FalkorDB"
PRIVATE_REPO = os.environ.get("ISSUE_REPO", "FalkorDB/private")

# Shared mutable state for local reproduction
_local_container_id: Optional[str] = None
_work_dir: Optional[str] = None


def _github_get(url: str, params: dict | None = None, accept: str | None = None) -> requests.Response:
    headers = dict(GITHUB_HEADERS)
    if accept:
        headers["Accept"] = accept
    return requests.get(url, headers=headers, params=params, timeout=30)


# ---------------------------------------------------------------------------
# Tool: fetch_crash_logs
# ---------------------------------------------------------------------------

class FetchCrashLogsParams(BaseModel):
    namespace: str = Field(description="Kubernetes namespace / instance ID")
    pod: str = Field(description="Pod name")
    container: str = Field(default="service", description="Container name")
    minutes: int = Field(default=7, description="How many minutes of logs to fetch")


@define_tool(
    name="fetch_crash_logs",
    description=(
        "Fetch and clean crash logs from VictoriaLogs for a specific pod. "
        "Returns the logs with timestamps stripped and the REDIS BUG REPORT "
        "section isolated if present. Use this as your first step."
    ),
    skip_permission=True,
)
async def fetch_crash_logs(params: FetchCrashLogsParams) -> str:
    from datetime import datetime, timedelta, timezone

    vmauth_url = os.environ.get("VMAUTH_URL", "").rstrip("/")
    vmauth_user = os.environ.get("VMAUTH_USERNAME", "")
    vmauth_pass = os.environ.get("VMAUTH_PASSWORD", "")
    if not all([vmauth_url, vmauth_user, vmauth_pass]):
        return "ERROR: VMAUTH_URL, VMAUTH_USERNAME, and VMAUTH_PASSWORD env vars required"

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
        verify=os.environ.get("ENVIRONMENT", "prod").lower() != "dev",
    )
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

    # Strip timestamp prefixes (3 layers: GCP, K8s, Redis PID)
    cleaned = []
    ts_pattern = re.compile(
        r"^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d+\t"
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s(?:stdout|stderr)\sF\s"
        r"(?:\d+:[A-Z]\s\d{2}\s\w+\s\d{4}\s\d{2}:\d{2}:\d{2}\.\d+\s)?"
    )
    for line in lines:
        cleaned.append(ts_pattern.sub("", line))

    full_log = "\n".join(cleaned)

    # Extract the crash report section if present
    crash_sections = re.findall(
        r"=== REDIS BUG REPORT START ===.*?=== REDIS BUG REPORT END ===",
        full_log,
        re.DOTALL,
    )

    if crash_sections:
        # Return the last (most recent) crash report + surrounding context
        result = f"=== FULL LOG ({len(cleaned)} lines) ===\n\n{full_log}\n\n"
        result += f"=== ISOLATED CRASH REPORT (most recent of {len(crash_sections)}) ===\n\n"
        result += crash_sections[-1]
        return result

    return f"=== FULL LOG ({len(cleaned)} lines, no crash report section found) ===\n\n{full_log}"


# ---------------------------------------------------------------------------
# Tool: fetch_previous_crashes
# ---------------------------------------------------------------------------

class FetchPreviousCrashesParams(BaseModel):
    namespace: str = Field(description="Namespace to search crashes for")
    max_results: int = Field(default=10, description="Max issues to return")


@define_tool(
    name="fetch_previous_crashes",
    description=(
        "Fetch previous crash issues for the same namespace from GitHub. "
        "Returns issue titles, bodies, and comments including any prior "
        "AI triage reports. Use this for progressive/comparative analysis."
    ),
    skip_permission=True,
)
async def fetch_previous_crashes(params: FetchPreviousCrashesParams) -> str:
    # Search for issues with crash + namespace labels
    resp = _github_get(
        f"{GITHUB_API}/repos/{PRIVATE_REPO}/issues",
        params={
            "state": "all",
            "labels": "crash",
            "per_page": params.max_results,
            "sort": "created",
            "direction": "desc",
        },
    )
    if resp.status_code != 200:
        return f"ERROR: GitHub API returned {resp.status_code}: {resp.text[:500]}"

    issues = resp.json()
    # Filter to issues matching this namespace in body or labels
    matching = []
    for issue in issues:
        labels = [l["name"] for l in issue.get("labels", [])]
        body = issue.get("body", "") or ""
        if params.namespace in body or any(params.namespace in l for l in labels):
            matching.append(issue)

    if not matching:
        return f"No previous crash issues found for namespace {params.namespace}"

    results = []
    for issue in matching[:params.max_results]:
        result = f"### Issue #{issue['number']}: {issue['title']}\n"
        result += f"State: {issue['state']} | Created: {issue['created_at']}\n"
        result += f"Labels: {', '.join(l['name'] for l in issue.get('labels', []))}\n\n"
        result += (issue.get("body", "") or "")[:3000]

        # Fetch comments (especially AI triage reports)
        comments_resp = _github_get(
            f"{GITHUB_API}/repos/{PRIVATE_REPO}/issues/{issue['number']}/comments",
            params={"per_page": 20},
        )
        if comments_resp.status_code == 200:
            for comment in comments_resp.json():
                body = comment.get("body", "") or ""
                # Include AI triage reports and crash-related comments
                if "AI Crash Triage" in body or "crash" in body.lower()[:100]:
                    result += f"\n\n---\n**Comment by {comment['user']['login']} ({comment['created_at']}):**\n"
                    result += body[:3000]

        results.append(result)

    return "\n\n" + "=" * 60 + "\n\n".join(results)


# ---------------------------------------------------------------------------
# Tool: search_falkordb_issues
# ---------------------------------------------------------------------------

class SearchFalkorDBIssuesParams(BaseModel):
    query: str = Field(description="Search query (function name, error message, etc.)")
    repo: str = Field(
        default="FalkorDB/FalkorDB",
        description="Repository to search (FalkorDB/FalkorDB or FalkorDB/private)",
    )


@define_tool(
    name="search_falkordb_issues",
    description=(
        "Search GitHub issues in FalkorDB repos for function names, error patterns, "
        "or crash signatures. Use this to find known bugs, PRs, or workarounds "
        "related to the crash."
    ),
    skip_permission=True,
)
async def search_falkordb_issues(params: SearchFalkorDBIssuesParams) -> str:
    resp = _github_get(
        f"{GITHUB_API}/search/issues",
        params={
            "q": f"{params.query} repo:{params.repo}",
            "per_page": 10,
            "sort": "updated",
        },
    )
    if resp.status_code != 200:
        return f"ERROR: GitHub search returned {resp.status_code}: {resp.text[:500]}"

    data = resp.json()
    items = data.get("items", [])
    if not items:
        return f"No issues found for '{params.query}' in {params.repo}"

    results = []
    for item in items:
        labels = ", ".join(l["name"] for l in item.get("labels", []))
        results.append(
            f"- **#{item['number']}** [{item['state']}] {item['title']}\n"
            f"  Labels: {labels or 'none'} | Updated: {item['updated_at']}\n"
            f"  URL: {item['html_url']}\n"
            f"  {(item.get('body', '') or '')[:500]}"
        )

    return f"Found {data['total_count']} results (showing {len(items)}):\n\n" + "\n\n".join(results)


# ---------------------------------------------------------------------------
# Tool: read_falkordb_source
# ---------------------------------------------------------------------------

class ReadFalkorDBSourceParams(BaseModel):
    path: str = Field(description="File path in the FalkorDB repo (e.g. 'src/graph/graphcontext.c')")
    ref: str = Field(default="master", description="Branch or tag")


@define_tool(
    name="read_falkordb_source",
    description=(
        "Read a source file from the FalkorDB/FalkorDB C engine repository. "
        "Use this to examine the code around a crashing function. "
        "Provide the file path relative to the repo root."
    ),
    skip_permission=True,
)
async def read_falkordb_source(params: ReadFalkorDBSourceParams) -> str:
    resp = _github_get(
        f"{GITHUB_API}/repos/{FALKORDB_REPO}/contents/{params.path}",
        params={"ref": params.ref},
    )
    if resp.status_code == 404:
        return f"File not found: {params.path} (ref: {params.ref})"
    if resp.status_code != 200:
        return f"ERROR: GitHub API returned {resp.status_code}: {resp.text[:500]}"

    data = resp.json()
    if data.get("encoding") == "base64":
        content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
    else:
        return f"Unexpected encoding: {data.get('encoding')}"

    # Truncate very large files
    if len(content) > 15000:
        return (
            f"File: {params.path} ({len(content)} bytes, truncated)\n"
            f"SHA: {data.get('sha', 'N/A')}\n\n{content[:15000]}\n\n... (truncated)"
        )
    return f"File: {params.path} ({len(content)} bytes)\nSHA: {data.get('sha', 'N/A')}\n\n{content}"


# ---------------------------------------------------------------------------
# Tool: search_falkordb_code
# ---------------------------------------------------------------------------

class SearchFalkorDBCodeParams(BaseModel):
    query: str = Field(description="Code search query (function name, pattern, etc.)")


@define_tool(
    name="search_falkordb_code",
    description=(
        "Search the FalkorDB/FalkorDB C codebase for function names, patterns, "
        "or identifiers. Returns matching file paths and code snippets. "
        "Use this to locate where a crashing function is defined."
    ),
    skip_permission=True,
)
async def search_falkordb_code(params: SearchFalkorDBCodeParams) -> str:
    resp = _github_get(
        f"{GITHUB_API}/search/code",
        params={"q": f"{params.query} repo:{FALKORDB_REPO}", "per_page": 10},
        accept="application/vnd.github.text-match+json",
    )
    if resp.status_code != 200:
        return f"ERROR: GitHub code search returned {resp.status_code}: {resp.text[:500]}"

    data = resp.json()
    items = data.get("items", [])
    if not items:
        return f"No code matches found for '{params.query}' in {FALKORDB_REPO}"

    results = []
    for item in items:
        path = item.get("path", "")
        matches = item.get("text_matches", [])
        fragments = []
        for m in matches:
            fragments.append(m.get("fragment", "")[:500])
        results.append(
            f"- **{path}**\n" + "\n".join(f"  ```\n  {f}\n  ```" for f in fragments[:2])
        )

    return f"Found {data['total_count']} results (showing {len(items)}):\n\n" + "\n\n".join(results)


# ---------------------------------------------------------------------------
# Tool: search_git_commits
# ---------------------------------------------------------------------------

class SearchGitCommitsParams(BaseModel):
    query: str = Field(description="Search query for commit messages or changed files")
    path: str = Field(default="", description="Restrict to commits touching this file path")


@define_tool(
    name="search_git_commits",
    description=(
        "Search recent commits in FalkorDB/FalkorDB for changes related to the crash. "
        "Use this to check for regressions — recent changes to the crashing function."
    ),
    skip_permission=True,
)
async def search_git_commits(params: SearchGitCommitsParams) -> str:
    api_params = {"per_page": 15}
    if params.path:
        api_params["path"] = params.path

    resp = _github_get(
        f"{GITHUB_API}/repos/{FALKORDB_REPO}/commits",
        params=api_params,
    )
    if resp.status_code != 200:
        return f"ERROR: GitHub API returned {resp.status_code}: {resp.text[:500]}"

    commits = resp.json()
    if not commits:
        return f"No commits found" + (f" for path {params.path}" if params.path else "")

    # If a query is provided, filter by keyword
    if params.query:
        q = params.query.lower()
        commits = [
            c for c in commits
            if q in c.get("commit", {}).get("message", "").lower()
            or q in c.get("sha", "")
        ]

    results = []
    for c in commits[:10]:
        commit = c.get("commit", {})
        msg = commit.get("message", "").split("\n")[0][:120]
        author = commit.get("author", {}).get("name", "unknown")
        date = commit.get("author", {}).get("date", "")
        results.append(f"- `{c['sha'][:8]}` {date[:10]} **{author}**: {msg}")

    if not results:
        return f"No matching commits found for query '{params.query}'"

    return "\n".join(results)


# ---------------------------------------------------------------------------
# Tool: get_git_blame
# ---------------------------------------------------------------------------

class GetGitBlameParams(BaseModel):
    path: str = Field(description="File path in the FalkorDB repo")
    start_line: int = Field(description="Start line number (1-based)")
    end_line: int = Field(description="End line number (1-based)")


@define_tool(
    name="get_git_blame",
    description=(
        "Get git blame info for specific lines in a FalkorDB source file. "
        "Shows who last modified each line and when. Use this to check "
        "if the crashing code was recently changed (regression indicator)."
    ),
    skip_permission=True,
)
async def get_git_blame(params: GetGitBlameParams) -> str:
    # GitHub doesn't have a REST blame API with line ranges, use GraphQL
    query = """
    query($owner: String!, $repo: String!, $path: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: "HEAD") {
          ... on Commit {
            blame(path: $path) {
              ranges {
                startingLine
                endingLine
                commit {
                  abbreviatedOid
                  message
                  authoredDate
                  author { name }
                }
              }
            }
          }
        }
      }
    }
    """
    resp = requests.post(
        f"{GITHUB_API}/graphql",
        headers=GITHUB_HEADERS,
        json={
            "query": query,
            "variables": {
                "owner": "FalkorDB",
                "repo": "FalkorDB",
                "path": params.path,
            },
        },
        timeout=30,
    )
    if resp.status_code != 200:
        return f"ERROR: GraphQL returned {resp.status_code}"

    data = resp.json()
    errors = data.get("errors")
    if errors:
        return f"ERROR: {errors[0].get('message', 'Unknown GraphQL error')}"

    blame_obj = data.get("data", {}).get("repository", {}).get("object")
    if not blame_obj:
        return f"Could not get blame for {params.path}"

    ranges = blame_obj.get("blame", {}).get("ranges", [])
    results = []
    for r in ranges:
        s, e = r["startingLine"], r["endingLine"]
        if e < params.start_line or s > params.end_line:
            continue
        c = r["commit"]
        msg = c["message"].split("\n")[0][:80]
        results.append(
            f"Lines {s}-{e}: `{c['abbreviatedOid']}` "
            f"{c['authoredDate'][:10]} {c['author']['name']} — {msg}"
        )

    if not results:
        return f"No blame data found for lines {params.start_line}-{params.end_line} in {params.path}"
    return "\n".join(results)


# ---------------------------------------------------------------------------
# Tool: run_falkordb_local
# ---------------------------------------------------------------------------

class RunFalkorDBLocalParams(BaseModel):
    rdb_url: str = Field(default="", description="Signed GCS URL to download dump.rdb")
    aof_url: str = Field(default="", description="Signed GCS URL to download appendonlydir.tar.gz")
    version: str = Field(default="latest", description="FalkorDB Docker image tag")


@define_tool(
    name="run_falkordb_local",
    description=(
        "Start a local FalkorDB Docker container, optionally loading an RDB dump "
        "and/or AOF directory from signed GCS URLs. Returns the container ID "
        "and connection details. Use this to reproduce crashes locally."
    ),
)
async def run_falkordb_local(params: RunFalkorDBLocalParams) -> str:
    global _local_container_id, _work_dir

    # Clean up previous container
    if _local_container_id:
        subprocess.run(["docker", "rm", "-f", _local_container_id], capture_output=True)

    _work_dir = tempfile.mkdtemp(prefix="falkordb_triage_")
    data_dir = os.path.join(_work_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    # Download RDB if provided
    if params.rdb_url:
        rdb_path = os.path.join(data_dir, "dump.rdb")
        resp = requests.get(params.rdb_url, timeout=300)
        if resp.status_code != 200:
            return f"ERROR: Failed to download RDB (HTTP {resp.status_code})"
        with open(rdb_path, "wb") as f:
            f.write(resp.content)

    # Download and extract AOF if provided
    if params.aof_url:
        aof_tar = os.path.join(_work_dir, "appendonlydir.tar.gz")
        resp = requests.get(params.aof_url, timeout=300)
        if resp.status_code != 200:
            return f"ERROR: Failed to download AOF (HTTP {resp.status_code})"
        with open(aof_tar, "wb") as f:
            f.write(resp.content)
        subprocess.run(["tar", "xzf", aof_tar, "-C", data_dir], check=True)

    image = f"falkordb/falkordb:{params.version}"
    result = subprocess.run(
        [
            "docker", "run", "-d",
            "--name", "falkordb-triage",
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
    command: str = Field(description="Redis/FalkorDB command to execute (e.g. 'GRAPH.QUERY g \"MATCH (n) RETURN n LIMIT 5\"')")
    port: int = Field(default=6399, description="Redis port of local instance")


@define_tool(
    name="execute_query",
    description=(
        "Execute a Redis or FalkorDB command on the local Docker instance. "
        "Use this to reproduce the crashing command or inspect the graph state. "
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
# Collect all tools
# ---------------------------------------------------------------------------

ALL_TOOLS = [
    fetch_crash_logs,
    fetch_previous_crashes,
    search_falkordb_issues,
    read_falkordb_source,
    search_falkordb_code,
    search_git_commits,
    get_git_blame,
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
