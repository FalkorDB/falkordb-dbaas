#!/usr/bin/env python3
"""
AI OOM Triage — Copilot SDK-powered ContainerOOMKilled analysis.

Runs after the existing oom_handler and rdb_uploader have finished.
Uses GitHub Copilot to analyze the OOM event like a senior engineer would:
  1. Query memory metrics at dual time scales (7 days + 60 min)
  2. Analyze command rates and latency patterns
  3. Fetch pod logs for errors and suspicious activity
  4. Inspect the database via RDB/AOF dump
  5. Diagnose the root cause and send a Google Chat notification

Usage:
    python scripts/ai_oom_triage.py \
        --pod node-f-0 \
        --namespace instance-abc123 \
        --cluster hc-xxxx \
        --container service \
        --vmauth-url https://vmauth.example.com \
        --grafana-url https://grafana.example.com \
        --customer-name "John Doe" \
        --customer-email "john@example.com" \
        --subscription-id "sub-123" \
        [--rdb-url gs://bucket/path/dump.rdb] \
        [--aof-url gs://bucket/path/appendonlydir.tar.gz] \
        [--falkordb-version v4.18.0]
"""

import os
import sys
import re
import json
import argparse
import asyncio
from datetime import datetime
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

import requests
from copilot import CopilotClient, SubprocessConfig
from copilot.session import PermissionHandler

from oom_triage_tools import ALL_TOOLS, cleanup


SYSTEM_MESSAGE = """\
You are a senior FalkorDB/Redis operations engineer investigating a ContainerOOMKilled event.

## Your Mission
Determine WHY this pod ran out of memory and classify the root cause. You have access \
to the same metrics, logs, and tools a human engineer uses.

## Key Principle
The diagnosis depends on CONTEXT. A large query that causes OOM when the database is at \
50% memory is a genuine problem query. The same query at 90% memory just reveals that \
the real issue is insufficient memory — the query is not the root cause. Always consider \
the memory utilization at the time of the event.

## Workflow — Follow These Steps In Order

### Step 1: Long-Term Memory Trend (7-day view)
Query these metrics over the **past 7 days** (step="1h") to understand the growth pattern:
- `redis_memory_used_bytes{namespace="NAMESPACE", pod="POD", container="service"}`
- `redis_memory_max_bytes{namespace="NAMESPACE", pod="POD", container="service"}`

Determine:
- Is memory steadily growing day over day? (legitimate growth)
- Has it been flat and then spiked recently? (event-triggered)
- What percentage of maxmemory was in use 7 days ago vs now?

### Step 2: Short-Term Memory Analysis (60-minute view)
Query these metrics over the **past 60 minutes** (step="15s") to see the immediate event:
- `redis_memory_used_bytes{namespace="NAMESPACE", pod="POD", container="service"}`
- `container_memory_rss{namespace="NAMESPACE", pod="POD"}`
- `container_memory_working_set_bytes{namespace="NAMESPACE", pod="POD"}`
- `redis_memory_max_bytes{namespace="NAMESPACE", pod="POD", container="service"}`

Determine:
- Was there a sudden spike right before the OOM?
- How much did RSS exceed the container limit?
- Is RSS significantly higher than redis_memory_used_bytes? (fragmentation)

### Step 3: Memory Utilization at OOM Time
Calculate the utilization ratio just before the OOM:
- `redis_memory_used_bytes / redis_memory_max_bytes * 100`

This is CRITICAL for diagnosis:
- **< 70%**: Something caused a massive spike — likely a huge query or bulk operation
- **70-89%**: Moderate headroom — a large query could push it over
- **≥ 90%**: Very low headroom — even normal operations could trigger OOM. \
The real issue is insufficient memory, not the specific query.

### Step 4: Command Rate & Latency Analysis
Query over the **past 60 minutes** (step="15s"):
- `rate(redis_commands_total{namespace="NAMESPACE", pod="POD", container="service"}[5m])`
- `rate(redis_commands_duration_seconds_total{namespace="NAMESPACE", pod="POD", container="service"}[5m])`
- `redis_connected_clients{namespace="NAMESPACE", pod="POD", container="service"}`

Look for:
- Spike in command rate (bulk import / many concurrent queries)
- Spike in command duration (expensive queries consuming memory)
- Spike in connected clients (sudden load increase)

### Step 5: Network I/O Analysis
Query over the **past 60 minutes** (step="15s"):
- `rate(redis_net_input_bytes_total{namespace="NAMESPACE", pod="POD", container="service"}[5m])`
- `rate(redis_net_output_bytes_total{namespace="NAMESPACE", pod="POD", container="service"}[5m])`

A spike in input bytes can indicate bulk data ingestion.

### Step 6: Log Analysis
Use `fetch_logs` to get the last 30 minutes of logs. Look for:
- Error messages or warnings
- Large query patterns
- Slow log entries
- Eviction warnings
- AOF rewrite or BGSAVE activity (these cause memory spikes due to fork)

### Step 7: Database Inspection (if RDB/AOF available)
If RDB or AOF URLs are provided:
- Use `run_falkordb_local` to start a local instance with the dump
- Use `execute_query` to run:
  - `INFO memory` — detailed memory breakdown
  - `INFO keyspace` — database size
  - `DBSIZE` — total key count
  - `GRAPH.LIST` — list all graphs
  - For each graph: `GRAPH.QUERY <name> "CALL db.labels()"` and \
`GRAPH.QUERY <name> "CALL db.relationshipTypes()"` to understand the schema
  - `CONFIG GET maxmemory` — configured memory limit

### Step 8: Produce Diagnosis
After completing your analysis, output EXACTLY this structured report:

```
## 🤖 AI OOM Triage Report

### Memory Timeline
- **7-day trend:** [Steady growth / Flat / Recent spike / etc.]
- **Memory 7 days ago:** [X MB / X% of maxmemory]
- **Memory at OOM:** [X MB / X% of maxmemory]
- **Maxmemory config:** [X MB]
- **Container RSS at OOM:** [X MB]
- **Fragmentation ratio:** [RSS / used_bytes, if significantly > 1.0 note it]

### Command Activity
- **Command rate before OOM:** [X ops/sec — normal / elevated / spike]
- **Command latency before OOM:** [X ms avg — normal / elevated / spike]
- **Connected clients:** [X — normal / elevated / spike]
- **Network I/O:** [normal / spike in input (bulk ingestion) / spike in output]

### Log Analysis
[Summary of any relevant findings from logs — errors, large queries, \
slow operations, AOF/BGSAVE activity]

### Database State
[If RDB/AOF was inspected: total keys, graph count, graph sizes, \
memory breakdown from INFO memory]

### Root Cause Diagnosis
**Category:** [One of: Legitimate Growth / Bulk Operation / Oversized Query / \
Insufficient Headroom / Memory Fragmentation / Background Process (AOF/BGSAVE) / Other]

[Detailed explanation with evidence from the metrics and logs. \
Explain WHY you chose this category and why other categories don't fit.]

**Confidence:** [High / Medium / Low] — [one-sentence justification]

### Recommended Action
[Specific actionable recommendation based on the diagnosis:
- Legitimate Growth → Scale up memory / increase maxmemory
- Bulk Operation → Advise customer to batch operations
- Oversized Query → Identify the query pattern and suggest optimization
- Insufficient Headroom → Scale up memory (the specific trigger doesn't matter)
- Memory Fragmentation → Consider restart / CONFIG SET activedefrag yes
- Background Process → Adjust AOF/BGSAVE scheduling or increase headroom
- Other → Specific recommendation based on findings]
```

## Constraints
- You are READ-ONLY on production systems. Only use local Docker for inspection.
- Be concise but thorough. Evidence-based reasoning only.
- If you cannot determine something, say so — don't guess.
- Mask customer email addresses if they appear in logs.
- Include actual metric values in your report, not just descriptions.
- Replace NAMESPACE and POD placeholders in the PromQL queries with the actual values.
"""


def _mask_email(email: str) -> str:
    """Mask email address to protect PII."""
    if '@' not in email:
        return email
    local, domain = email.split('@', 1)
    if len(local) <= 1:
        masked_local = local
    else:
        masked_local = local[0] + '*' * (len(local) - 1)
    return f"{masked_local}@{domain}"


def _build_initial_prompt(args) -> str:
    """Build the initial prompt with OOM context for the AI session."""
    prompt = f"""\
A ContainerOOMKilled event has been detected. Please perform a full OOM triage.

**OOM Context:**
- Pod: {args.pod}
- Namespace: {args.namespace}
- Cluster: {args.cluster}
- Container: {args.container}
- Customer: {args.customer_name} ({_mask_email(args.customer_email)})
"""
    if args.falkordb_version:
        prompt += f"- FalkorDB Version: {args.falkordb_version}\n"
    if args.rdb_url:
        prompt += f"- RDB dump available: yes\n"
        prompt += f"  RDB URL: {args.rdb_url}\n"
    if args.aof_url:
        prompt += f"- AOF directory available: yes\n"
        prompt += f"  AOF URL: {args.aof_url}\n"

    prompt += f"""
When querying metrics, use these label selectors:
- namespace="{args.namespace}"
- pod="{args.pod}"
- container="service" (for Redis metrics)

Start with Step 1: query the 7-day memory trend, then proceed through all steps.
"""
    return prompt


def _extract_report_field(report: str, field_name: str) -> str:
    """Extract a **Field:** value from the triage report markdown."""
    pattern = re.compile(rf'\*\*{re.escape(field_name)}:\*\*\s*(.+)', re.IGNORECASE)
    match = pattern.search(report)
    return match.group(1).strip() if match else ""


def _build_grafana_memory_url(grafana_base: str, namespace: str, pod: str,
                               from_ms: int, to_ms: int) -> str:
    """Grafana Explore URL showing container_memory_rss centred on the OOM time."""
    expr = f'container_memory_rss{{namespace="{namespace}", pod="{pod}"}}'
    params = {
        "orgId": "1",
        "left": json.dumps({
            "datasource": "VictoriaMetrics",
            "queries": [{"expr": expr, "refId": "A"}],
            "range": {"from": str(from_ms), "to": str(to_ms)},
        }),
    }
    return f"{grafana_base.rstrip('/')}/explore?{urlencode(params)}"


def _build_grafana_pods_url(grafana_base: str, namespace: str, pod: str,
                            cluster: str, from_ms: int, to_ms: int) -> str:
    """Kubernetes / Views / Pods dashboard centred on the OOM time."""
    params = {
        "orgId": "1",
        "from": str(from_ms),
        "to": str(to_ms),
        "var-cluster": cluster,
        "var-namespace": namespace,
        "var-pod": pod,
    }
    return f"{grafana_base.rstrip('/')}/d/k8s_views_pods/kubernetes-views-pods?{urlencode(params)}"


def _send_report_to_chat(
    report: str,
    webhook_url: str,
    customer_name: str,
    customer_email: str,
    subscription_id: str,
    pod: str,
    namespace: str,
    cluster: str,
    container: str,
    grafana_memory_url: str,
    grafana_pods_url: str,
    timestamp: str,
    verify_ssl: bool = True,
):
    """Send the AI triage report as a Google Chat card."""

    # Extract key fields from the report
    category = _extract_report_field(report, "Category") or "Unknown"
    confidence = _extract_report_field(report, "Confidence") or "Unknown"
    seven_day_trend = _extract_report_field(report, "7-day trend") or "N/A"
    memory_at_oom = _extract_report_field(report, "Memory at OOM") or "N/A"
    maxmemory = _extract_report_field(report, "Maxmemory config") or "N/A"
    command_rate = _extract_report_field(report, "Command rate before OOM") or "N/A"

    # Extract the Recommended Action section
    recommended_action = ""
    action_match = re.search(
        r'###\s*Recommended Action\s*\n+(.+?)(?:\n###|\n```|\Z)',
        report, re.DOTALL | re.IGNORECASE,
    )
    if action_match:
        recommended_action = action_match.group(1).strip()
        if len(recommended_action) > 400:
            recommended_action = recommended_action[:397] + "..."

    masked_email = _mask_email(customer_email)

    # Short confidence for subtitle (e.g. "High" from "High — detailed explanation")
    confidence_short = confidence.split("—")[0].split("-")[0].strip() if confidence else "Unknown"

    payload = {
        "text": f"🤖 OOM Triage Complete — {pod} ({namespace}) <users/116170488112818253188> <users/115942454099354054771>",
        "cards": [{
            "header": {
                "title": f"🤖 OOM Triage: {category}",
                "subtitle": f"{masked_email} — {confidence_short}",
            },
            "sections": [
                {
                    "widgets": [
                        {"keyValue": {"topLabel": "Customer", "content": f"{customer_name} ({masked_email})"}},
                        {"keyValue": {"topLabel": "Subscription ID", "content": subscription_id}},
                        {"keyValue": {"topLabel": "Cluster / Namespace", "content": f"{cluster} / {namespace}"}},
                        {"keyValue": {"topLabel": "Pod / Container", "content": f"{pod} / {container}"}},
                        {"keyValue": {"topLabel": "Time (Israel)", "content": timestamp}},
                    ]
                },
                {
                    "widgets": [
                        {"keyValue": {"topLabel": "Diagnosis", "content": category}},
                        {"keyValue": {"topLabel": "Confidence", "content": confidence}},
                        {"keyValue": {"topLabel": "7-Day Trend", "content": seven_day_trend}},
                        {"keyValue": {"topLabel": "Memory at OOM", "content": memory_at_oom}},
                        {"keyValue": {"topLabel": "Maxmemory", "content": maxmemory}},
                        {"keyValue": {"topLabel": "Command Rate", "content": command_rate}},
                    ]
                },
                {
                    "widgets": [{
                        "textParagraph": {
                            "text": f"<b>Recommended Action:</b><br>{recommended_action}" if recommended_action else "<i>See full report in logs</i>",
                        }
                    }]
                },
                {
                    "widgets": [{
                        "buttons": [
                            {
                                "textButton": {
                                    "text": "Memory metrics",
                                    "onClick": {"openLink": {"url": grafana_memory_url}},
                                }
                            },
                            {
                                "textButton": {
                                    "text": "Pod overview",
                                    "onClick": {"openLink": {"url": grafana_pods_url}},
                                }
                            },
                        ]
                    }]
                },
            ],
        }],
    }

    try:
        # Send the card summary
        response = requests.post(
            webhook_url + "&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD",
            json=payload,
            timeout=30,
            verify=verify_ssl,
        )
        response.raise_for_status()
        print("AI triage card sent to Google Chat.")

        # Send full report as a threaded reply
        resp_data = response.json()
        thread_name = resp_data.get("thread", {}).get("name", "")
        if thread_name:
            thread_payload = {
                "text": f"```\n{report}\n```",
                "thread": {"name": thread_name},
            }
            thread_resp = requests.post(
                webhook_url + "&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD",
                json=thread_payload,
                timeout=30,
                verify=verify_ssl,
            )
            thread_resp.raise_for_status()
            print("Full triage report sent as thread reply.")
        else:
            print("⚠️  Could not get thread name — full report not threaded.", file=sys.stderr)
    except requests.RequestException as e:
        print(f"⚠️  Failed to send AI triage report to Google Chat: {e}", file=sys.stderr)


async def run_triage(args):
    """Run the AI OOM triage session."""
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
            streamed_chunks = []
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
                    print()
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
                    if not turn_active:
                        done.set()
                elif t == "session.error":
                    print(f"Session error: {getattr(event.data, 'message', event.data)}", file=sys.stderr, flush=True)
                    done.set()

            session.on(on_event)
            prompt = _build_initial_prompt(args)
            print(f"Sending OOM triage request for {args.pod} in {args.namespace}...")
            await session.send(prompt)
            await done.wait()

            REPORT_HEADER = "## 🤖 AI OOM Triage Report"
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
    parser = argparse.ArgumentParser(description="AI-powered OOM triage using Copilot SDK")
    parser.add_argument("--pod", required=True, help="Pod name")
    parser.add_argument("--namespace", required=True, help="Namespace / instance ID")
    parser.add_argument("--cluster", required=True, help="Cluster name")
    parser.add_argument("--container", default="service", help="Container name")
    parser.add_argument("--vmauth-url", required=True, help="VMAuth URL")
    parser.add_argument("--grafana-url", required=True, help="Grafana base URL")
    parser.add_argument("--customer-name", required=True, help="Customer name")
    parser.add_argument("--customer-email", required=True, help="Customer email")
    parser.add_argument("--subscription-id", required=True, help="Subscription ID")
    parser.add_argument("--rdb-url", default="", help="GCS path for dump.rdb")
    parser.add_argument("--aof-url", default="", help="GCS path for appendonlydir.tar.gz")
    parser.add_argument("--falkordb-version", default="", help="FalkorDB version")
    args = parser.parse_args()

    # Pass vmauth-url to tools via env
    os.environ.setdefault("VMAUTH_URL", args.vmauth_url)

    # Configure SSL
    environment = os.environ.get("ENVIRONMENT", "prod").lower()
    disable_ssl_verify = os.environ.get("DISABLE_SSL_VERIFY", "false").lower() == "true"
    verify_ssl = not (environment == "dev" or disable_ssl_verify)

    # Generate timestamp and Grafana links
    oom_dt = datetime.now(ZoneInfo("Asia/Jerusalem"))
    timestamp = oom_dt.strftime("%Y-%m-%d %H:%M:%S")
    oom_ts_ms = int(oom_dt.timestamp() * 1000)
    from_ms = oom_ts_ms - 10 * 60 * 1000
    to_ms = oom_ts_ms + 10 * 60 * 1000
    grafana_memory_url = _build_grafana_memory_url(args.grafana_url, args.namespace, args.pod, from_ms, to_ms)
    grafana_pods_url = _build_grafana_pods_url(args.grafana_url, args.namespace, args.pod, args.cluster, from_ms, to_ms)

    google_chat_webhook = os.environ.get("GOOGLE_CHAT_WEBHOOK_URL", "")

    try:
        report = asyncio.run(run_triage(args))
        if report:
            print(f"\n{'='*60}")
            print("AI OOM Triage Report:")
            print(f"{'='*60}")
            print(report)
            print(f"{'='*60}")

            # Send to Google Chat
            if google_chat_webhook:
                _send_report_to_chat(
                    report=report,
                    webhook_url=google_chat_webhook,
                    customer_name=args.customer_name,
                    customer_email=args.customer_email,
                    subscription_id=args.subscription_id,
                    pod=args.pod,
                    namespace=args.namespace,
                    cluster=args.cluster,
                    container=args.container,
                    grafana_memory_url=grafana_memory_url,
                    grafana_pods_url=grafana_pods_url,
                    timestamp=timestamp,
                    verify_ssl=verify_ssl,
                )
            else:
                print("⚠️  GOOGLE_CHAT_WEBHOOK_URL not set, skipping chat notification", file=sys.stderr)
        else:
            print("ERROR: No triage report generated", file=sys.stderr, flush=True)
            sys.exit(1)
    finally:
        cleanup()


if __name__ == "__main__":
    main()
