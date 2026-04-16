# Alert Runbook — SOC 2 Security Alerts

Response procedures for each VMRule alert defined in `observability/rules/soc2-security.rules.yml`.

All alerts route through VictoriaMetrics → Alertmanager → PagerDuty / Slack.

---

## Prowler Alerts

### ProwlerScanFailing

| Field | Value |
|-------|-------|
| **Severity** | warning |
| **Fires when** | Prowler CronJob has failed runs for >30 minutes |
| **Expression** | `kube_job_status_failed{job_name=~"prowler-soc2-scan-.*"} > 0` |
| **Impact** | SOC 2 evidence collection is degraded. Missing compliance data for the day. |

**Response:**

1. Check the failed Job logs:
   ```bash
   kubectl get jobs -n security -l app=prowler --sort-by=.metadata.creationTimestamp | tail -5
   FAILED_JOB=$(kubectl get jobs -n security -l app=prowler --field-selector status.successful=0 -o name | tail -1)
   kubectl logs $FAILED_JOB -n security
   ```

2. Common causes:
   - **Cloud credential error**: Check the relevant secret (`prowler-aws-credentials`, `prowler-azure-credentials`, `prowler-gcs-credentials`)
   - **GCS upload error**: For GCP clusters, verify Workload Identity binding. For AWS/Azure, check `GOOGLE_APPLICATION_CREDENTIALS` mount.
   - **OOMKilled**: Increase memory limit in `cronjob.yaml` (current: 1Gi)
   - **Timeout (>2h)**: Large cloud accounts may exceed the deadline. Increase `activeDeadlineSeconds` or scope Prowler to specific services.

3. Trigger a manual retry:
   ```bash
   kubectl create job --from=cronjob/prowler-soc2-scan prowler-retry -n security
   ```

4. **SOC 2 implication**: If the scan cannot be fixed within 24 hours, document the gap. The `ProwlerScanStale` alert will fire after 48h with no successful run.

---

### ProwlerScanStale

| Field | Value |
|-------|-------|
| **Severity** | warning |
| **Fires when** | No successful Prowler scan in over 48 hours |
| **Expression** | `time() - max(kube_cronjob_status_last_successful_time{cronjob="prowler-soc2-scan"}) > 172800` |
| **Impact** | Compliance evidence is stale. Auditors expect daily scans. |

**Response:**

1. Check if the CronJob is suspended:
   ```bash
   kubectl get cronjob prowler-soc2-scan -n security -o jsonpath='{.spec.suspend}'
   ```
   If `true`, unsuspend: `kubectl patch cronjob prowler-soc2-scan -n security -p '{"spec":{"suspend":false}}'`

2. Check if recent Jobs exist but are still running:
   ```bash
   kubectl get jobs -n security -l app=prowler --sort-by=.metadata.creationTimestamp | tail -5
   ```

3. If no Jobs exist, the CronJob scheduler may be broken. Check kube-controller-manager logs.

4. Trigger a manual run:
   ```bash
   kubectl create job --from=cronjob/prowler-soc2-scan prowler-catchup -n security
   ```

5. **SOC 2 implication**: Document the outage period. Generate a backdated report once scanning resumes.

---

### ProwlerCronJobSuspended

| Field | Value |
|-------|-------|
| **Severity** | warning |
| **Fires when** | Prowler CronJob has `suspend: true` for >1 hour |
| **Expression** | `kube_cronjob_spec_suspend{cronjob="prowler-soc2-scan"} == 1` |
| **Impact** | Compliance scanning is intentionally stopped. No new evidence will be collected. |

**Response:**

1. Determine who suspended the CronJob and why (check ArgoCD sync history, git log)
2. If it was suspended for maintenance, ensure a plan to re-enable
3. Unsuspend:
   ```bash
   kubectl patch cronjob prowler-soc2-scan -n security -p '{"spec":{"suspend":false}}'
   ```

---

## Wazuh Alerts

### WazuhManagerDown

| Field | Value |
|-------|-------|
| **Severity** | critical |
| **Fires when** | Wazuh Manager is unreachable for >5 minutes |
| **Expression** | `up{job="wazuh-manager"} == 0` |
| **Impact** | **All agent communication is interrupted.** No security events are being collected from any cluster. FIM, vulnerability detection, and log analysis are all offline. |

**Response:**

1. Check Manager pod status:
   ```bash
   kubectl get pods -n security -l app=wazuh-manager
   kubectl describe pod -n security -l app=wazuh-manager
   ```

2. Check Manager logs:
   ```bash
   kubectl logs -n security -l app=wazuh-manager --tail=100
   ```

3. Common causes:
   - **Pod eviction**: Check node resource pressure. The Manager runs on the `security` node pool.
   - **Disk full**: Check Indexer PVC usage. Wazuh stores event indices.
   - **OOM**: Check if the container was OOMKilled. Increase memory limits.
   - **Node pool scaling**: If the security node pool scaled to 0, it may take time to scale back up.

4. If pod is stuck, try a restart:
   ```bash
   kubectl rollout restart deployment/wazuh-manager -n security  # or statefulset
   ```

5. **SOC 2 implication**: This is a **critical gap**. Document the outage duration. Agents buffer events locally and will forward them when the Manager recovers.

---

### WazuhAgentDaemonSetUnavailable

| Field | Value |
|-------|-------|
| **Severity** | warning |
| **Fires when** | Wazuh Agent DaemonSet has unavailable pods for >15 minutes |
| **Expression** | `kube_daemonset_status_number_unavailable{daemonset="wazuh-agent"} > 0` |
| **Impact** | Some nodes are not being monitored. Security coverage gap on those hosts. |

**Response:**

1. Identify which nodes are missing agents:
   ```bash
   kubectl get ds wazuh-agent -n security
   kubectl get pods -n security -l app=wazuh-agent -o wide | grep -v Running
   ```

2. Check pod events on failing nodes:
   ```bash
   kubectl describe pod <POD_NAME> -n security
   ```

3. Common causes:
   - **Node pressure**: Agent pod evicted due to resource pressure (DaemonSet has low priority)
   - **Image pull failure**: Check if `wazuh/wazuh-agent:4.9.2` is pullable
   - **Enrollment failure**: Agent can't register with Manager (check `wazuh-agent-key` secret)
   - **New node with taints**: The DaemonSet has `operator: Exists` tolerations; this shouldn't happen unless custom taints were added after deployment

---

### WazuhAgentDaemonSetMisscheduled

| Field | Value |
|-------|-------|
| **Severity** | warning |
| **Fires when** | Wazuh Agent pods are scheduled on unexpected nodes for >15 minutes |
| **Expression** | `kube_daemonset_status_number_misscheduled{daemonset="wazuh-agent"} > 0` |
| **Impact** | Agents are running on nodes where they shouldn't be. Investigate scheduling. |

**Response:**

1. Check which nodes have misscheduled pods:
   ```bash
   kubectl get pods -n security -l app=wazuh-agent -o wide
   ```

2. This usually indicates a node selector or affinity mismatch. The Wazuh Agent DaemonSet does **not** have a nodeSelector (intentionally runs on all nodes). If misscheduled pods appear, check if node taints/labels have changed.

---

## ThreatMapper Alerts

### ThreatMapperConsoleDown

| Field | Value |
|-------|-------|
| **Severity** | critical |
| **Fires when** | ThreatMapper Console is unreachable for >10 minutes |
| **Expression** | `up{job="threatmapper-console"} == 0` |
| **Impact** | Vulnerability scanning visibility is lost. Sensors continue collecting data but cannot report. |

**Response:**

1. Check Console pods:
   ```bash
   kubectl get pods -n security -l app=deepfence-console
   kubectl get pods -n security -l app=deepfence-router
   ```

2. The Console depends on several backing services. Check all:
   ```bash
   kubectl get pods -n security | grep deepfence
   # Should see: console, router, postgres, redis, neo4j, kafka, worker
   ```

3. Check PVC usage (Postgres, Neo4j, Kafka all use persistent storage):
   ```bash
   kubectl get pvc -n security | grep deepfence
   ```

4. Common causes:
   - **Postgres crash**: Console depends on Postgres. Check PG pod logs.
   - **Kafka volume full**: Kafka stores event data. Check PVC utilization.
   - **Node pool at capacity**: All ThreatMapper pods run on the `security` node pool.

5. **SOC 2 implication**: Document the outage. Sensors buffer locally but may lose data if the outage is prolonged.

---

### ThreatMapperSensorDaemonSetUnavailable

| Field | Value |
|-------|-------|
| **Severity** | warning |
| **Fires when** | ThreatMapper Sensor DaemonSet has unavailable pods for >15 minutes |
| **Expression** | `kube_daemonset_status_number_unavailable{daemonset="threatmapper-sensor"} > 0` |
| **Impact** | Some nodes are not being scanned. Runtime vulnerability detection coverage gap. |

**Response:**

1. Identify failing pods:
   ```bash
   kubectl get pods -n security -l app=threatmapper-sensor -o wide | grep -v Running
   kubectl describe pod <POD_NAME> -n security
   ```

2. Common causes:
   - **API key invalid**: Regenerate in Console, update `threatmapper-sensor-key` secret
   - **Console unreachable**: Check Console health first (see ThreatMapperConsoleDown)
   - **Privileged container denied**: Sensors require `privileged: true`. Check PodSecurityPolicy/Admission
   - **Docker/containerd socket missing**: Sensor needs `/var/run/docker.sock` or `/run/containerd/containerd.sock`

---

## Alert Escalation Matrix

| Alert | Severity | On-Call Response Time | Escalation |
|-------|----------|----------------------|------------|
| WazuhManagerDown | Critical | 15 minutes | Page infrastructure + security team |
| ThreatMapperConsoleDown | Critical | 30 minutes | Page infrastructure team |
| WazuhAgentDaemonSetUnavailable | Warning | 1 hour | Notify security team |
| WazuhAgentDaemonSetMisscheduled | Warning | 4 hours | Notify security team |
| ThreatMapperSensorDaemonSetUnavailable | Warning | 1 hour | Notify security team |
| ProwlerScanFailing | Warning | 4 hours | Notify security team |
| ProwlerScanStale | Warning | 8 hours | Notify security + compliance team |
| ProwlerCronJobSuspended | Warning | 4 hours | Notify security team |

---

## Silence Procedures

To silence an alert during planned maintenance:

```bash
# Via Alertmanager API
curl -X POST http://alertmanager:9093/api/v2/silences \
  -H "Content-Type: application/json" \
  -d '{
    "matchers": [{"name": "alertname", "value": "WazuhManagerDown", "isRegex": false}],
    "startsAt": "2025-01-15T00:00:00Z",
    "endsAt": "2025-01-15T04:00:00Z",
    "createdBy": "your-name",
    "comment": "Planned Wazuh Manager upgrade"
  }'
```

Or use the existing alert-silence-syncer if configured.

**Always document maintenance windows for SOC 2 audit trail.**
