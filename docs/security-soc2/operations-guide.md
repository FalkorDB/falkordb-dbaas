# Operations & Maintenance Guide — Security & SOC 2 Evidence Engine

Day-to-day operations, routine maintenance, and troubleshooting procedures.

---

## Table of Contents

- [Daily Operations](#daily-operations)
- [Adding a New Spoke Cluster](#adding-a-new-spoke-cluster)
- [Removing a Spoke Cluster](#removing-a-spoke-cluster)
- [Component Upgrades](#component-upgrades)
- [Secret Rotation](#secret-rotation)
- [Evidence Locker Management](#evidence-locker-management)
- [Wazuh Operations](#wazuh-operations)
- [Prowler Operations](#prowler-operations)
- [Troubleshooting](#troubleshooting)

---

## Daily Operations

The security stack is designed to run autonomously. The following occur automatically:

| Time (UTC) | Event | Component |
|-------------|-------|-----------|
| Continuous | Host log collection, FIM | Wazuh Agents |
| 02:00 | SOC 2 compliance scan + upload | Prowler CronJob |
| Continuous | Alert evaluation | VMRule (VictoriaMetrics) |

**Daily checks** (recommended):

1. Verify the Grafana **SOC 2 Compliance** dashboard shows no red panels
2. Check that no `ProwlerScanStale` or `WazuhManagerDown` alerts are firing
3. If on-call, review Google Chat space for Wazuh rule 100101+ alerts (Prowler FAIL findings)

---

## Adding a New Spoke Cluster

When a new app-plane cluster is provisioned:

### 1. Register in ArgoCD with labels

```bash
argocd cluster add <CONTEXT_NAME> \
  --label role=app-plane \
  --label cloud_provider=gcp \
  --label host_mode=managed  # or byoa
```

### 2. Create required Secrets

On the new cluster, create secrets in the `security` namespace:

```bash
kubectl create secret generic wazuh-agent-key -n security \
  --from-literal=enrollment-key=<ENROLLMENT_PASSWORD>
```

For AWS spokes, also create:
```bash
kubectl create secret generic prowler-aws-credentials -n security \
  --from-literal=role-arn=<ROLE_ARN> \
  --from-literal=region=<REGION>

kubectl create secret generic prowler-gcs-credentials -n security \
  --from-file=sa-key.json=<GCS_KEY_FILE>
```

For Azure spokes, also create:
```bash
kubectl create secret generic prowler-azure-credentials -n security \
  --from-literal=client-id=<...> \
  --from-literal=client-secret=<...> \
  --from-literal=tenant-id=<...> \
  --from-literal=subscription-id=<...>

kubectl create secret generic prowler-gcs-credentials -n security \
  --from-file=sa-key.json=<GCS_KEY_FILE>
```

### 3. Verify

The ApplicationSets will automatically detect the new cluster and deploy:
- Wazuh Agent DaemonSet
- Prowler CronJob

```bash
# Check ArgoCD generated new Applications
argocd app list | grep <cluster-short-name>

# Verify on the new cluster
kubectl get ds,cronjob -n security
```

### 5. Validate agent registration

```bash
# Wazuh agent should appear in Manager
curl -k -u admin:admin \
  "https://<WAZUH_IP>:55000/agents?status=active" | jq '.data.affected_items[] | .name'
```

---

## Removing a Spoke Cluster

### 1. Delete ArgoCD Applications

ArgoCD will prune resources when the cluster label is removed:

```bash
argocd cluster set <CLUSTER_NAME> --label role-  # removes the role label
```

Or explicitly delete generated Applications:

```bash
argocd app delete <cluster>-prowler
argocd app delete <cluster>-wazuh-agent
```

### 2. Deregister Wazuh agent

```bash
# Find the agent IDs
curl -k -u admin:admin "https://<WAZUH_IP>:55000/agents?name=<node-name>"

# Delete agents from that cluster
curl -k -u admin:admin -X DELETE \
  "https://<WAZUH_IP>:55000/agents?agents_list=<ID1>,<ID2>&status=all&older_than=0s"
```

---

## Component Upgrades

### Wazuh (Manager + Agents)

1. Update the image tag/chart version in:
   - `argocd/apps/ctrl-plane/{dev,prod}/wazuh.yaml` (Helm chart version)
   - `argocd/kustomize/wazuh-agent/base/daemonset.yaml` (image tag)

2. **Upgrade Manager first**, then Agents. Agent → Manager version skew of one minor version is supported.

3. After Manager upgrade, verify:
   ```bash
   curl -k -u admin:admin "https://<WAZUH_IP>:55000/manager/info"
   ```

4. Roll Agents:
   ```bash
   kubectl rollout restart ds/wazuh-agent -n security
   ```

### Prowler

1. Update image tag in `argocd/kustomize/prowler/base/cronjob.yaml`:
   ```yaml
   image: toniblyx/prowler:<NEW_VERSION>
   ```

2. Review the [Prowler changelog](https://github.com/prowler-cloud/prowler/releases) for changes to SOC 2 checks.

3. Trigger a test run:
   ```bash
   kubectl create job --from=cronjob/prowler-soc2-scan prowler-upgrade-test -n security
   ```

---

## Secret Rotation

### Wazuh Enrollment Key

1. Update the enrollment password in the Wazuh Manager configuration
2. Update the `wazuh-agent-key` secret on all clusters
3. Rolling restart the agents: `kubectl rollout restart ds/wazuh-agent -n security`

### Prowler GCS Key (AWS/Azure spokes)

```bash
# Generate new key
gcloud iam service-accounts keys create /tmp/new-key.json \
  --iam-account=prowler-uploader@<PROJECT>.iam.gserviceaccount.com

# Update secret on each AWS/Azure spoke cluster
kubectl create secret generic prowler-gcs-credentials -n security \
  --from-file=sa-key.json=/tmp/new-key.json \
  --dry-run=client -o yaml | kubectl apply -f -

# Delete old key from GCP
gcloud iam service-accounts keys list \
  --iam-account=prowler-uploader@<PROJECT>.iam.gserviceaccount.com
gcloud iam service-accounts keys delete <OLD_KEY_ID> \
  --iam-account=prowler-uploader@<PROJECT>.iam.gserviceaccount.com

rm /tmp/new-key.json
```

### Azure Service Principal Secret

1. Rotate via Azure portal or Tofu:
   ```bash
   cd tofu/runtime/azure
   tofu taint azuread_application_password.prowler
   tofu apply
   ```
2. Update `prowler-azure-credentials` on Azure spoke clusters

---

## Evidence Locker Management

### Bucket lifecycle

The GCS evidence locker has automatic lifecycle rules:

| Age | Action |
|-----|--------|
| 0–365 days | Standard storage (hot access for auditors) |
| 365 days | Transition to COLDLINE |
| 730 days | Auto-deleted |

### Browsing evidence

```bash
# List all Prowler reports for a date
gsutil ls "gs://<BUCKET>/prowler/2025/01/15/"

# Download a specific cluster's report
gsutil cp -r "gs://<BUCKET>/prowler/2025/01/15/gcp-cluster-1/" ./evidence/
```

### Generating on-demand reports

```bash
export WAZUH_API_URL="https://wazuh.security.internal.falkordb.cloud:55000"
export WAZUH_API_TOKEN="<TOKEN>"

./scripts/generate_compliance_report.sh \
  --bucket <BUCKET> \
  --date 2025-01-15 \
  --output-dir ./reports
```

Output structure:
```
compliance-report-2025-01-15/
├── prowler/              # Prowler HTML + JSON + CSV reports
├── wazuh/
│   ├── agents.json       # Active agent inventory
│   ├── cve-list.json     # Detected CVEs
│   └── fim-events.json   # File integrity events (last 24h)
└── metadata.json         # Report metadata
```

---

## Wazuh Operations

### Custom Rules

Custom rules are in `argocd/kustomize/wazuh-rules/wazuh-custom-rules.yaml`.

| Rule ID | Level | Description |
|---------|-------|-------------|
| 100100 | 3 | Prowler result received (base) |
| 100101 | 10 | Prowler FAIL detected → Google Chat alert |
| 100102 | 13 | Prowler critical severity FAIL |
| 100200 | 12 | FIM critical path modified → Google Chat alert |
| 100300 | 10 | Auth anomaly: brute force detection |
| 100301 | 12 | Auth anomaly: privilege escalation |
| 100302 | 10 | Auth anomaly: after-hours access |
| 100303 | 13 | Auth anomaly: impossible travel |

To add/modify rules:
1. Edit `argocd/kustomize/wazuh-rules/wazuh-custom-rules.yaml`
2. Commit and push — ArgoCD syncs the ConfigMap
3. The Manager automatically reloads when the mounted ConfigMap changes

### Checking agent status

```bash
# Via Wazuh API
curl -k -u admin:admin "https://<WAZUH_IP>:55000/agents/summary/status"

# Expected: all agents "active", 0 "disconnected"
```

### Agent groups

| Group | Description |
|-------|-------------|
| `ctrl-plane-dev` | Control plane agents (dev) |
| `ctrl-plane-prod` | Control plane agents (prod) |
| `app-plane-dev` | Spoke cluster agents (dev) |
| `app-plane-prod` | Spoke cluster agents (prod) |

---

## Prowler Operations

### Manual scan trigger

```bash
kubectl create job --from=cronjob/prowler-soc2-scan prowler-manual -n security
kubectl logs -f job/prowler-manual -n security
```

### Checking schedule

```bash
kubectl get cronjob prowler-soc2-scan -n security
# SCHEDULE: 0 2 * * *    SUSPEND: False    LAST SCHEDULE: <timestamp>
```

### Suspending scans

```bash
kubectl patch cronjob prowler-soc2-scan -n security -p '{"spec":{"suspend":true}}'

# Note: this will trigger the ProwlerCronJobSuspended alert after 1 hour
```

### Viewing results

```bash
# Check last job status
kubectl get jobs -n security -l app=prowler --sort-by=.metadata.creationTimestamp | tail -5

# Check GCS
gsutil ls "gs://<BUCKET>/prowler/$(date +%Y/%m/%d)/"
```

---

## Troubleshooting

### Wazuh agents not connecting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Agent pod CrashLoopBackOff | Manager not reachable | Check `WAZUH_MANAGER` IP is correct; verify firewall rules allow spoke NAT IPs |
| Agent shows "disconnected" | Enrollment key mismatch | Verify `wazuh-agent-key` secret matches Manager enrollment password |
| Agent shows "never_connected" | Firewall blocking 1514/1515 | Verify GCP firewall rule `allow-wazuh-agent-ingress` exists and is not disabled |

```bash
# Debug connectivity from agent pod
kubectl exec -it ds/wazuh-agent -n security -- \
  /var/ossec/bin/agent_control -l

# Check agent logs
kubectl logs ds/wazuh-agent -n security | tail -50
```

### Prowler scan failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| Job fails immediately | Missing cloud credentials | Check the appropriate secret exists (`prowler-aws-credentials`, `prowler-azure-credentials`) |
| Job fails on upload | GCS auth issue | For GCP: check WI binding. For AWS/Azure: check `prowler-gcs-credentials` has valid key |
| Job times out (>2h) | Large cloud environment | Increase `activeDeadlineSeconds` in cronjob.yaml, or scope Prowler to specific services |
| ProwlerScanStale alert | CronJob suspended or failing | Check `kubectl get cronjob -n security`; check last job logs |

```bash
# Check last failed job
kubectl get jobs -n security -l app=prowler --field-selector status.successful=0
kubectl logs job/<JOB_NAME> -n security
```

### VMRule alerts not firing

```bash
# Verify VMRule is loaded
kubectl get vmrules -n observability | grep soc2

# Check VictoriaMetrics for the metrics
# kube_cronjob_status_last_successful_time{cronjob="prowler-soc2-scan"}
# kube_daemonset_status_number_unavailable{daemonset="wazuh-agent"}
```

### Grafana dashboard empty

The dashboard uses kube-state-metrics. Verify kube-state-metrics is running:

```bash
kubectl get pods -n observability -l app.kubernetes.io/name=kube-state-metrics
```

---

## Firewall Rules

Wazuh Manager ports are open to all sources. Agents authenticate via enrollment keys managed as SealedSecrets.

| Rule | Priority | Action | Source | Ports |
|------|----------|--------|--------|-------|
| `allow-wazuh-agent-ingress` | 900 | Allow | `0.0.0.0/0` | 1514, 1515, 55000 |

Since spoke clusters are created dynamically, the firewall does not restrict by source IP. The Wazuh Manager enforces agent authentication via enrollment keys.
