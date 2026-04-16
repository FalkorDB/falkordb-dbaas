# Security infrastructure: Wazuh Manager static IP + GCS Evidence Locker.
#
# wazuh-ip          — Regional static IP for Wazuh Agent enrollment (port 1514)
#                     and Wazuh API (port 55000). Agents in spoke clusters connect here.
# evidence-locker   — GCS bucket for centralized SOC 2 compliance evidence
#                     (Prowler reports, Wazuh exports, ThreatMapper diagrams).

module "wazuh_ip" {
  source  = "terraform-google-modules/address/google"
  version = "~> 3.2"

  project_id = var.project_id
  region     = var.region

  global       = false
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"

  names = ["wazuh-ip"]
}

resource "google_storage_bucket" "evidence_locker" {
  project  = var.project_id
  name     = "falkordb-evidence-locker-${random_string.cluster_suffix.result}"
  location = var.region

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 730
    }
    action {
      type = "Delete"
    }
  }
}

# Service account for Prowler CronJobs running in spoke clusters to push
# reports into the evidence locker via Workload Identity Federation.
resource "google_service_account" "prowler_uploader" {
  project      = var.project_id
  account_id   = "prowler-uploader"
  display_name = "Prowler Evidence Uploader"
  description  = "Used by Prowler CronJobs in spoke clusters to upload compliance reports to the evidence locker."
}

resource "google_storage_bucket_iam_member" "prowler_writer" {
  bucket = google_storage_bucket.evidence_locker.name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${google_service_account.prowler_uploader.email}"
}

resource "google_service_account_iam_member" "prowler_workload_identity" {
  service_account_id = google_service_account.prowler_uploader.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[security/prowler]"
}

# -----------------------------------------------------------------------
# Firewall: restrict Wazuh Manager ports to known spoke cluster NAT IPs.
# Spoke clusters connect outbound-only via their NAT gateway IPs.
# These rules allow *only* whitelisted IPs on ports 1514/1515/55000.
# -----------------------------------------------------------------------

resource "google_compute_firewall" "wazuh_agent_ingress" {
  name    = "allow-wazuh-agent-ingress"
  project = var.project_id
  network = module.vpc.network_name

  direction = "INGRESS"
  priority  = 900

  allow {
    protocol = "tcp"
    ports    = ["1514", "1515", "55000"]
  }

  # NAT IPs of spoke clusters allowed to reach the Wazuh Manager.
  # Populate via var.spoke_nat_cidrs; defaults to empty (deny-all) until
  # spokes are provisioned and their NAT IPs are known.
  source_ranges = var.spoke_nat_cidrs

  target_tags = ["wazuh-manager"]

  description = "Allow Wazuh agent traffic from whitelisted spoke cluster NAT IPs."
}

resource "google_compute_firewall" "wazuh_deny_all" {
  name    = "deny-wazuh-ports-all"
  project = var.project_id
  network = module.vpc.network_name

  direction = "INGRESS"
  priority  = 1000

  deny {
    protocol = "tcp"
    ports    = ["1514", "1515", "55000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["wazuh-manager"]

  description = "Default deny for Wazuh agent ports — overridden by higher-priority allow rule for spoke IPs."
}
