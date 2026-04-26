#!/usr/bin/env python3
"""
Transform the FalkorDB Grafana dashboard per the March 2026 improvement recommendations.

Changes:
  1. Pod variable: default select all pods
  2. Add deployment_mode variable (interim: redis_mode)
  3. Memory Usage: gauge → bar gauge, per-pod with role labels
  4. Max Uptime: moved to collapsed "Advanced" row
  5. Graph Count + Keys per DB: grouped in collapsed "Graph Data / Storage" row
  6. Connected/Blocked Clients: split by node, add threshold, rename, tooltip
  7. Network I/O: per-node with stacking, fix legends
  8. Command latency panels: filter to graph commands, rename
  9. Total Commands/sec: exclude internal Redis commands
"""

import json

FILEPATH = 'observability/grafana/dashboards/falkordb-cloud.json'

with open(FILEPATH, 'r') as f:
    dashboard = json.load(f)

panels = dashboard['panels']


def find_panel(panels, panel_id):
    for i, p in enumerate(panels):
        if p.get('id') == panel_id:
            return i, p
    return None, None


def pop_panel_by_id(panels, panel_id):
    for i, p in enumerate(panels):
        if p.get('id') == panel_id:
            return panels.pop(i)
    return None


# ============================================================
# 1. TEMPLATE VARIABLE CHANGES
# ============================================================
template_list = dashboard['templating']['list']

# Pod variable: includeAll=true (default select all pods)
for var in template_list:
    if var.get('name') == 'pod':
        var['includeAll'] = True
        break

# Add deployment_mode variable after namespace
namespace_idx = None
for i, var in enumerate(template_list):
    if var.get('name') == 'namespace':
        namespace_idx = i
        break

if namespace_idx is not None:
    deployment_mode_var = {
        "current": {},
        "datasource": {
            "type": "prometheus",
            "uid": "${datasource}"
        },
        "definition": "label_values(redis_instance_info{namespace=~\"$namespace\"}, redis_mode)",
        "includeAll": True,
        "label": "Deployment Mode",
        "name": "deployment_mode",
        "options": [],
        "query": "label_values(redis_instance_info{namespace=~\"$namespace\"}, redis_mode)",
        "refresh": 2,
        "regex": "",
        "sort": 1,
        "type": "query"
    }
    template_list.insert(namespace_idx + 1, deployment_mode_var)

# ============================================================
# 2. REMOVE PANELS THAT WILL BE MOVED TO COLLAPSED ROWS
# ============================================================
uptime_panel = pop_panel_by_id(panels, 9)       # Max Uptime → Advanced row
graph_count_panel = pop_panel_by_id(panels, 23)  # Graph Count → Graph Data row
items_panel = pop_panel_by_id(panels, 5)         # Total Items per DB → Graph Data row

# ============================================================
# 3. TOP ROW: Redistribute after removing Uptime + Graph Count
#    Pod Info (8w) | Clients (4w) | Memory per Pod (12w) = 24w
# ============================================================

# Clients (id 12): move from x=12 to x=8
_, clients_panel = find_panel(panels, 12)
if clients_panel:
    clients_panel['gridPos'] = {"h": 7, "w": 4, "x": 8, "y": 0}

# Memory Usage (id 11): gauge → bargauge, per-pod with role, widen to 12w
_, mem_panel = find_panel(panels, 11)
if mem_panel:
    mem_panel['gridPos'] = {"h": 7, "w": 12, "x": 12, "y": 0}
    mem_panel['type'] = 'bargauge'
    mem_panel['title'] = 'Memory Usage per Pod'
    mem_panel['description'] = (
        'Memory usage percentage per pod. Shows used/max memory ratio '
        'for each node, labeled by role (primary/replica).'
    )
    mem_panel['targets'] = [
        {
            "datasource": {"type": "prometheus", "uid": "${datasource}"},
            "editorMode": "code",
            "expr": (
                "(100 * redis_memory_used_bytes"
                "{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"}"
                " / redis_memory_max_bytes"
                "{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"})"
                " * on(namespace, pod) group_left(role)"
                " (max by(namespace, pod, role)"
                " (redis_instance_info{namespace=~\"$namespace\", pod=~\"$pod\"}))"
            ),
            "format": "time_series",
            "intervalFactor": 2,
            "legendFormat": "{{ pod }} ({{ role }})",
            "range": True,
            "refId": "A",
            "step": 2
        }
    ]
    mem_panel['options'] = {
        "displayMode": "gradient",
        "maxVizHeight": 300,
        "minVizHeight": 16,
        "minVizWidth": 8,
        "namePlacement": "auto",
        "orientation": "horizontal",
        "reduceOptions": {
            "calcs": ["lastNotNull"],
            "fields": "",
            "values": False
        },
        "showUnfilled": True,
        "sizing": "auto",
        "valueMode": "color"
    }

# ============================================================
# 4. CONNECTED/BLOCKED CLIENTS (id 16): split by node + threshold
# ============================================================
_, clients_ts = find_panel(panels, 16)
if clients_ts:
    clients_ts['title'] = 'Connected Clients / Blocked Clients by Node'
    clients_ts['description'] = (
        'Connected and blocked client counts per node. '
        'Blocked clients are connections waiting on a blocking command '
        '(e.g., BLPOP, BRPOP) or a query lock. '
        'The dashed red line shows 80% of the maxclients configuration '
        'value as a warning threshold.'
    )
    clients_ts['targets'] = [
        {
            "datasource": {"type": "prometheus", "uid": "${datasource}"},
            "editorMode": "code",
            "expr": "redis_connected_clients{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"}",
            "format": "time_series",
            "intervalFactor": 1,
            "legendFormat": "{{ pod }} connected",
            "refId": "A"
        },
        {
            "datasource": {"type": "prometheus", "uid": "${datasource}"},
            "editorMode": "code",
            "expr": "redis_blocked_clients{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"}",
            "format": "time_series",
            "intervalFactor": 1,
            "legendFormat": "{{ pod }} blocked",
            "refId": "B"
        },
        {
            "datasource": {"type": "prometheus", "uid": "${datasource}"},
            "editorMode": "code",
            "expr": "0.8 * max(redis_config_maxclients{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"})",
            "format": "time_series",
            "intervalFactor": 1,
            "legendFormat": "maxclients 80%",
            "refId": "C"
        }
    ]
    clients_ts['fieldConfig']['overrides'] = [
        {
            "matcher": {"id": "byName", "options": "maxclients 80%"},
            "properties": [
                {"id": "color", "value": {"fixedColor": "red", "mode": "fixed"}},
                {"id": "custom.lineStyle", "value": {"dash": [10, 10], "fill": "dash"}},
                {"id": "custom.fillOpacity", "value": 0},
                {"id": "custom.lineWidth", "value": 2}
            ]
        }
    ]

# ============================================================
# 5. NETWORK I/O (id 10): per-node with stacking
# ============================================================
_, net_panel = find_panel(panels, 10)
if net_panel:
    net_panel['title'] = 'Network I/O by Node'
    net_panel['targets'] = [
        {
            "datasource": {"type": "prometheus", "uid": "${datasource}"},
            "editorMode": "code",
            "expr": "rate(redis_net_input_bytes_total{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"}[5m])",
            "format": "time_series",
            "intervalFactor": 2,
            "legendFormat": "{{ pod }} rx",
            "range": True,
            "refId": "A",
            "step": 240
        },
        {
            "datasource": {"type": "prometheus", "uid": "${datasource}"},
            "editorMode": "code",
            "expr": "rate(redis_net_output_bytes_total{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\"}[5m])",
            "format": "time_series",
            "interval": "",
            "intervalFactor": 2,
            "legendFormat": "{{ pod }} tx",
            "range": True,
            "refId": "B",
            "step": 240
        }
    ]
    net_panel['fieldConfig']['defaults']['custom']['stacking'] = {
        "group": "A",
        "mode": "normal"
    }
    net_panel['fieldConfig']['defaults']['custom']['fillOpacity'] = 30

# ============================================================
# 6. COMMAND LATENCY: filter to graph commands
# ============================================================

# Avg Query Latency (id 20)
_, avg_panel = find_panel(panels, 20)
if avg_panel:
    avg_panel['title'] = 'Avg Query Latency (Graph Commands)'
    avg_panel['description'] = (
        'Average execution time per FalkorDB graph command. '
        'Shows: graph.QUERY, graph.RO_QUERY, graph.EFFECT, '
        'graph.LIST, graph.SLOWLOG.'
    )
    graph_cmd_filter = 'cmd=~"graph.QUERY|graph.RO_QUERY|graph.EFFECT|graph.LIST|graph.SLOWLOG"'
    avg_panel['targets'][0]['expr'] = (
        "sum(irate(redis_commands_duration_seconds_total"
        "{pod =~ \"$pod\", namespace=~\"$namespace\", container=~\"$container\", "
        + graph_cmd_filter +
        "}[1m])) by (cmd)\n  /\n"
        "sum(irate(redis_commands_total"
        "{pod =~ \"$pod\", namespace=~\"$namespace\", container=~\"$container\", "
        + graph_cmd_filter +
        "}[1m])) by (cmd)\n"
    )
    avg_panel['gridPos'] = {"h": 7, "w": 12, "x": 0, "y": 21}

# Total Query Time (id 14)
_, total_time = find_panel(panels, 14)
if total_time:
    total_time['title'] = 'Total Query Time (Graph Commands)'
    total_time['description'] = 'Total time spent per second on FalkorDB graph commands.'
    total_time['targets'][0]['expr'] = (
        "sum(irate(redis_commands_duration_seconds_total"
        "{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\", "
        + graph_cmd_filter +
        "}[1m])) by (cmd) != 0"
    )
    total_time['gridPos'] = {"h": 7, "w": 12, "x": 12, "y": 21}

# ============================================================
# 7. TOTAL COMMANDS/SEC (id 18): exclude internal commands
# ============================================================
_, total_cmds = find_panel(panels, 18)
if total_cmds:
    internal_exclude = (
        'cmd!~"ping|cluster.*|command|config.*|auth|client.*|'
        'bgrewriteaof|exists|latency.*|slowlog.*|info|replconf|unlink"'
    )
    total_cmds['title'] = 'Total Commands / sec (excl. internal)'
    total_cmds['description'] = (
        'Command throughput excluding internal Redis protocol commands '
        '(ping, cluster, config, auth, client, info, replconf, etc.).'
    )
    total_cmds['targets'][0]['expr'] = (
        "sum(rate(redis_commands_total"
        "{pod=~\"$pod\", namespace=~\"$namespace\", container=~\"$container\", "
        + internal_exclude +
        "} [1m])) by (cmd)"
    )
    total_cmds['gridPos'] = {"h": 7, "w": 24, "x": 0, "y": 28}
    total_cmds['options']['legend']['showLegend'] = True

# ============================================================
# 8. GRAPH DATA / STORAGE — collapsed row
# ============================================================
if graph_count_panel and items_panel:
    graph_count_panel['gridPos'] = {"h": 7, "w": 12, "x": 0, "y": 36}

    items_panel['title'] = 'Keys per DB / per Node'
    items_panel['description'] = (
        'Number of keys in each Redis database per pod. '
        'Reflects the Redis keyspace, not FalkorDB graph-level data.'
    )
    items_panel['gridPos'] = {"h": 7, "w": 12, "x": 12, "y": 36}

    panels.append({
        "collapsed": True,
        "gridPos": {"h": 1, "w": 24, "x": 0, "y": 35},
        "id": 100,
        "panels": [graph_count_panel, items_panel],
        "title": "Graph Data / Storage",
        "type": "row"
    })

# ============================================================
# 9. ADVANCED — collapsed row (Max Uptime)
# ============================================================
if uptime_panel:
    uptime_panel['gridPos'] = {"h": 7, "w": 8, "x": 0, "y": 53}
    panels.append({
        "collapsed": True,
        "gridPos": {"h": 1, "w": 24, "x": 0, "y": 52},
        "id": 101,
        "panels": [uptime_panel],
        "title": "Advanced",
        "type": "row"
    })

# ============================================================
# 10. ADJUST SLOWLOG + LOGS positions (shifted by collapsed rows)
# ============================================================
_, slowlog = find_panel(panels, 24)
if slowlog:
    slowlog['gridPos'] = {"h": 8, "w": 24, "x": 0, "y": 36}

_, logs = find_panel(panels, 25)
if logs:
    logs['gridPos'] = {"h": 8, "w": 24, "x": 0, "y": 44}

# ============================================================
# WRITE OUTPUT
# ============================================================
with open(FILEPATH, 'w') as f:
    json.dump(dashboard, f, indent=2)
    f.write('\n')

print("Dashboard updated successfully!")
print(f"Total panels: {len(dashboard['panels'])}")
for p in dashboard['panels']:
    if p['type'] == 'row':
        print(f"  ROW: {p['title']} (collapsed={p.get('collapsed', False)}, "
              f"{len(p.get('panels', []))} children)")
    else:
        title = p.get('title', 'untitled')
        print(f"  Panel: {title} (type={p['type']}, id={p['id']}, "
              f"gridPos={p['gridPos']})")
