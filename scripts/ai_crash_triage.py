#!/usr/bin/env python3
"""
AI Crash Triage — Copilot SDK-powered crash analysis.

Runs after the existing redis_crash_handler and rdb_uploader have finished.
Uses GitHub Copilot to analyze the crash like a senior engineer would:
  1. Read crash logs and stack traces
  2. Search FalkorDB C source code for the crashing function
  3. Cross-reference existing GitHub issues
  4. Attempt local reproduction with the RDB/AOF dump
  5. Produce a structured triage report posted as a GitHub issue comment

Usage:
    python scripts/ai_crash_triage.py \
        --issue-number 42 \
        --pod node-f-0 \
        --namespace instance-abc123 \
        --cluster hc-xxxx \
        --container service \
        --vmauth-url https://vmauth.example.com \
        [--rdb-url <signed-url>] \
        [--aof-url <signed-url>] \
        [--falkordb-version v4.0.3]
"""

import os
import sys
import argparse
import asyncio

import requests
from copilot import CopilotClient, SubprocessConfig
from copilot.session import PermissionHandler

from triage_tools import ALL_TOOLS, cleanup


SYSTEM_MESSAGE = """\
You are a senior FalkorDB/Redis engine developer performing a production crash triage.

## Your Mission
Analyze a Redis/FalkorDB crash, identify the root cause, and produce a structured report.
You have access to tools that give you the same data a human engineer uses.

## Workflow — Follow These Steps In Order

### Step 1: Ingest Crash Context
- Use `fetch_crash_logs` to get the cleaned crash logs
- Identify the crash report section (=== REDIS BUG REPORT START ===)
- Extract: signal number, stack trace, registers, client command, Redis/FalkorDB version
- Identify the primary crashing function (e.g. in falkordb.so or redis-server)

### Step 2: Analyze Source Code
- Use `search_falkordb_code` to find where the crashing function is defined
- Use `read_falkordb_source` to read the source file
- Trace the call path from the stack trace — read each calling function
- Determine what could cause the crash: NULL dereference, use-after-free, buffer overflow, etc.

### Step 3: Cross-Reference Issues & Crash History
- Use `search_falkordb_issues` to search FalkorDB/FalkorDB for the crashing function name
- Also search FalkorDB/private for similar crashes
- Use `fetch_previous_crashes` to get crash history for THIS namespace
- Use `search_crashes_by_signature` with the primary crashing function to find crashes
  across ALL instances — this reveals whether the bug is version-related or instance-specific
- Use `search_git_commits` to check if the crashing code was recently changed (regression)
- Use `get_git_blame` if you find the problematic lines
- If the function was fixed in a PR, identify which release version includes the fix

### Step 4: Analyze the Query/Command
- From the crash logs, identify the client command (GRAPH.QUERY, etc.)
- Decompose the Cypher query if present: what operations, graph patterns, functions
- Identify if certain query patterns are known to be problematic

### Step 5: Reproduce (if RDB/AOF available)
- Use `run_falkordb_local` to start a local FalkorDB with the crash data
- Use `execute_query` to re-run the crashing command
- Report whether the crash reproduces
- Try variations to find the minimal reproduction

### Step 6: Produce Report
After completing your analysis, output EXACTLY this structured report:

```
## 🤖 AI Crash Triage Report

### Crash Summary
- **Primary Function:** [function name from stack trace]
- **Signal:** [signal number and name]
- **Exit Code:** [exit code]
- **FalkorDB Version:** [version if known]
- **Client Command:** [command that triggered the crash]

### Source Code Analysis
[Which file and function the crash occurs in, what the code does,
and what specifically could cause this crash type]

### Related Issues
[List any related GitHub issues and PRs found, with URLs.
For each, include the status in brackets: [open], [closed], [merged].
Example: [FalkorDB/FalkorDB#1234](url) [merged] — description]

### Previous Crash History
[Summary of previous crashes for this namespace/signature if any.
What new evidence does this occurrence add?]

### Version & Instance Impact
- **Scope:** [Version-specific bug / Instance-specific / Widespread across versions]
- **Affected versions:** [List versions where this crash has been observed]
- **Fixed in:** [Version/PR where the fix was merged, or "Not yet fixed"]
- **Instances affected:** [Number of distinct instances that hit this crash]
[Explain whether upgrading to a specific version would resolve the issue,
or if the bug is still open and needs a fix.]

### Reproduction Results
[Whether reproduction was attempted, succeeded, and what was observed]

### Root Cause Hypothesis
[Your best theory for why this crash happens, with supporting evidence.]

**Confidence:** [High / Medium / Low] — [one-sentence justification for the confidence level]

**Status:** [New bug / Known issue (link) / Fixed in (version/PR link) but not deployed]

### Suggested Fix
[Specific code change suggestion if you have enough evidence.
File, function, and what to change.
SKIP this section if the bug is already fixed in a merged PR — instead,
state which PR/version contains the fix and recommend upgrading.]

### Recommended Next Steps
[Ordered list of what the team should do next]
```

## Constraints
- You are READ-ONLY on production systems. Only use local Docker for reproduction.
- Be concise but thorough. Evidence-based reasoning only.
- If you cannot determine something, say so — don't guess.
- Mask customer email addresses if they appear in logs.
- If this is a recurring crash, focus on what NEW evidence this occurrence provides.
"""


def _build_initial_prompt(args) -> str:
    """Build the initial prompt with crash context for the AI session."""
    prompt = f"""\
A Redis/FalkorDB crash has been detected. Please perform a full triage.

**Crash Context:**
- Pod: {args.pod}
- Namespace: {args.namespace}
- Cluster: {args.cluster}
- Container: {args.container}
- GitHub Issue: {args.issue_repo}#{args.issue_number}
"""
    if args.falkordb_version:
        prompt += f"- FalkorDB Version: {args.falkordb_version}\n"
    if args.rdb_url:
        prompt += f"- RDB dump available: yes (use run_falkordb_local with this URL)\n"
        prompt += f"  RDB URL: {args.rdb_url}\n"
    if args.aof_url:
        prompt += f"- AOF directory available: yes\n"
        prompt += f"  AOF URL: {args.aof_url}\n"

    if args.crash_log_file:
        with open(args.crash_log_file, "r") as f:
            crash_log = f.read()
        prompt += f"""
**Full crash log loaded from file ({len(crash_log)} bytes):**

```
{crash_log}
```

Skip Step 1 (fetch_crash_logs) since the full crash log is above. Proceed directly to Step 2: source code analysis.
"""
    else:
        prompt += """
Start with Step 1: fetch the crash logs for this pod/namespace, then proceed through all steps.
"""
    return prompt


def _post_report_to_issue(report: str, issue_number: int, issue_repo: str):
    """Post the triage report as a comment on the GitHub issue."""
    # Prefer PRIVATE_REPO_TOKEN (PAT with cross-repo access) for posting
    # to FalkorDB/private; fall back to GITHUB_TOKEN if unavailable.
    token = os.environ.get("PRIVATE_REPO_TOKEN") or os.environ.get("GITHUB_TOKEN", "")
    if not token:
        print("WARNING: No token available, cannot post report to issue", file=sys.stderr)
        print(report)
        return

    resp = requests.post(
        f"https://api.github.com/repos/{issue_repo}/issues/{issue_number}/comments",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
        },
        json={"body": report},
        timeout=30,
    )
    if resp.status_code == 201:
        print(f"Triage report posted to {issue_repo}#{issue_number}")
    else:
        print(f"ERROR: Failed to post report (HTTP {resp.status_code}): {resp.text[:500]}", file=sys.stderr)
        # Fallback: print to stdout
        print(report)


async def run_triage(args):
    """Run the AI crash triage session."""
    triage_report = None

    github_token = os.environ.get("GITHUB_TOKEN", "")

    async with CopilotClient(SubprocessConfig(github_token=github_token)) as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all,
            model="claude-opus-4.6",
            streaming=True,
            tools=ALL_TOOLS,
            system_message={
                "mode": "append",
                "content": SYSTEM_MESSAGE,
            },
        ) as session:
            done = asyncio.Event()
            messages = []
            streamed_chunks = []  # collect streaming deltas as fallback
            turn_active = False

            def on_event(event):
                nonlocal turn_active
                t = event.type.value
                print(f"  [{t}]", file=sys.stderr, flush=True)
                if t in ("assistant.message_delta", "assistant.streaming_delta"):
                    delta = event.data.delta_content or ""
                    streamed_chunks.append(delta)
                    print(delta, end="", flush=True)
                elif t == "assistant.message":
                    messages.append(event.data.content)
                    print()  # newline after streamed message
                elif t == "assistant.turn_start":
                    turn_active = True
                elif t == "assistant.turn_end":
                    turn_active = False
                elif t == "tool.execution_start":
                    name = getattr(event.data, 'tool_name', '') or getattr(event.data, 'name', '') or ''
                    print(f"🔧 Running tool: {name}", flush=True)
                elif t == "tool.execution_complete":
                    name = getattr(event.data, 'tool_name', '') or getattr(event.data, 'name', '') or ''
                    print(f"✅ Tool complete: {name}", flush=True)
                elif t == "session.idle":
                    # Only finish if no turn is active
                    if not turn_active:
                        done.set()
                elif t == "session.error":
                    print(f"Session error: {getattr(event.data, 'message', event.data)}", file=sys.stderr, flush=True)
                    done.set()

            session.on(on_event)
            prompt = _build_initial_prompt(args)
            print(f"Sending triage request for {args.pod} in {args.namespace}...")
            await session.send(prompt)
            await done.wait()

            # Prefer the message containing the structured report header;
            # fall back to the last message if no structured report is found.
            REPORT_HEADER = "## 🤖 AI Crash Triage Report"
            if messages:
                for msg in reversed(messages):
                    if REPORT_HEADER in msg:
                        triage_report = msg
                        break
                else:
                    triage_report = messages[-1]
            elif streamed_chunks:
                triage_report = "".join(streamed_chunks)

    return triage_report


def main():
    parser = argparse.ArgumentParser(description="AI-powered crash triage using Copilot SDK")
    parser.add_argument("--issue-number", required=True, type=int, help="GitHub issue number")
    parser.add_argument("--issue-repo", default=os.environ.get("ISSUE_REPO", "FalkorDB/private"))
    parser.add_argument("--pod", required=True, help="Pod name")
    parser.add_argument("--namespace", required=True, help="Namespace / instance ID")
    parser.add_argument("--cluster", required=True, help="Cluster name")
    parser.add_argument("--container", default="service", help="Container name")
    parser.add_argument("--vmauth-url", required=True, help="VMAuth URL")
    parser.add_argument("--rdb-url", default="", help="Signed GCS URL for dump.rdb")
    parser.add_argument("--aof-url", default="", help="Signed GCS URL for appendonlydir.tar.gz")
    parser.add_argument("--falkordb-version", default="", help="FalkorDB version")
    parser.add_argument("--crash-log-file", default="", help="Path to a local crash log file (skip VMAuth log fetch)")
    args = parser.parse_args()

    # Pass vmauth-url to tools via env
    os.environ.setdefault("VMAUTH_URL", args.vmauth_url)

    try:
        report = asyncio.run(run_triage(args))
        if report:
            _post_report_to_issue(report, args.issue_number, args.issue_repo)
        else:
            print("ERROR: No triage report generated", file=sys.stderr, flush=True)
            sys.exit(1)
    finally:
        cleanup()


if __name__ == "__main__":
    main()
