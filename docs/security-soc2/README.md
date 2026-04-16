# Multi-Cloud Security & SOC 2 Evidence Engine

Hub-spoke security monitoring architecture providing continuous compliance scanning, host-level intrusion detection, and runtime vulnerability analysis across all FalkorDB cloud environments.

## Architecture Overview

```
                          ┌─────────────────────────────────────────────┐
                          │         GCP Control Plane (Hub)             │
                          │                                             │
                          │  ┌─────────────┐   ┌───────────────────┐   │
                          │  │   Wazuh      │   │   ThreatMapper    │   │
                          │  │   Manager    │   │   Console         │   │
                          │  │  (Helm 4.9.2)│   │  (Helm 2.4.0)    │   │
                          │  │  :1514 mTLS  │   │  :443 HTTPS       │   │
                          │  └──────┬───────┘   └────────┬──────────┘   │
                          │         │                    │              │
                          │  ┌──────┴────────────────────┴──────────┐  │
                          │  │        GCS Evidence Locker            │  │
                          │  │  gs://falkordb-evidence-locker-*      │  │
                          │  │  (Prowler reports, topology exports)  │  │
                          │  └──────────────────────────────────────┘  │
                          └────────────────┬───────────────────────────┘
                                           │
               ┌───────────────────────────┼───────────────────────────┐
               │                           │                           │
    ┌──────────▼──────────┐    ┌───────────▼─────────┐    ┌───────────▼─────────┐
    │   GCP Spoke Cluster  │    │  AWS Spoke Cluster   │    │ Azure Spoke Cluster  │
    │                      │    │                      │    │                      │
    │  ● Wazuh Agent (DS)  │    │  ● Wazuh Agent (DS)  │    │  ● Wazuh Agent (DS)  │
    │  ● TM Sensor (DS)   │    │  ● TM Sensor (DS)   │    │  ● TM Sensor (DS)   │
    │  ● Prowler (CJ)     │    │  ● Prowler (CJ)     │    │  ● Prowler (CJ)     │
    │    (Workload Identity)│    │    (IRSA + GCS key)  │    │    (SP + GCS key)    │
    └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

## Components

| Component | Type | Version | Purpose |
|-----------|------|---------|---------|
| **Wazuh Manager** | Helm chart | 4.9.2 | Central SIEM — receives agent events, runs FIM, vulnerability detection |
| **Wazuh Agent** | DaemonSet | 4.9.2 | Host-level log collection, file integrity monitoring, rootkit detection |
| **Wazuh Custom Rules** | ConfigMap | — | SOC 2 rules: Prowler FAIL detection, FIM critical alerts, auth anomalies |
| **ThreatMapper Console** | Helm chart | 2.4.0 | Runtime vulnerability scanning console, network topology visualization |
| **ThreatMapper Sensor** | DaemonSet | 2.4.0 | Container/host vulnerability scanning, network topology discovery |
| **Prowler** | CronJob | 4.6.1 | Cloud security posture (SOC 2 compliance), daily at 02:00 UTC |
| **GCS Evidence Locker** | GCS bucket | — | Centralized storage for all compliance artifacts |
| **VMRule alerts** | VMRule CRD | — | VictoriaMetrics alerts for component health |
| **Grafana dashboard** | ConfigMap | — | SOC 2 Compliance overview dashboard |

## Namespace

All security workloads run in the **`security`** namespace on every cluster.

## File Layout

```
tofu/
  runtime/gcp/infra/security.tf          # Wazuh IP, GCS bucket, Prowler SA, firewall
  runtime/gcp/infra/gke.tf               # Security node pool
  org/aws/org/prowler.tf                 # AWS IAM role for Prowler
  runtime/azure/prowler.tf               # Azure AD service principal for Prowler

argocd/
  apps/ctrl-plane/{dev,prod}/
    wazuh.yaml                           # Wazuh Manager Application
    wazuh-rules.yaml                     # Custom rules Application
    threatmapper.yaml                    # ThreatMapper Console Application
    wazuh-agent.yaml                     # Ctrl-plane Wazuh Agent Application
    threatmapper-sensor.yaml             # Ctrl-plane TM Sensor Application
  apps/app-plane/{dev,prod}/
    prowler.yaml                         # Prowler ApplicationSet (spoke clusters)
    wazuh-agent.yaml                     # Wazuh Agent ApplicationSet (spoke clusters)
    threatmapper-sensor.yaml             # TM Sensor ApplicationSet (spoke clusters)
  kustomize/
    prowler/                             # CronJob + 8 overlays (cloud × env)
    wazuh-agent/                         # DaemonSet + 4 overlays (plane × env)
    wazuh-rules/                         # Custom rules + dashboard saved objects
    threatmapper-sensor/                 # DaemonSet + 2 overlays (env)

observability/
  rules/soc2-security.rules.yml          # VMRule alerts
  grafana/dashboards/soc2-compliance.json # Grafana dashboard

scripts/
  generate_compliance_report.sh          # On-demand evidence collection
```

## Documentation

| Document | Description |
|----------|-------------|
| [Deployment Runbook](deployment-runbook.md) | Step-by-step first-time deployment procedure |
| [Operations Guide](operations-guide.md) | Day-to-day operations, troubleshooting, maintenance |
| [Alert Runbook](alert-runbook.md) | Response procedures for each SOC 2 alert |

## Quick Links

| Resource | Dev URL | Prod URL |
|----------|---------|----------|
| Wazuh Dashboard | `wazuh.security.dev.internal.falkordb.cloud` | `wazuh.security.internal.falkordb.cloud` |
| ThreatMapper Console | `threatmapper.security.dev.internal.falkordb.cloud` | `threatmapper.security.internal.falkordb.cloud` |
| Grafana SOC 2 Dashboard | Grafana → Dashboards → SOC 2 Compliance | Same |
| GCS Evidence Locker | `gs://falkordb-evidence-locker-<suffix>` | Same naming |
