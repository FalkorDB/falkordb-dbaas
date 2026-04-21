# Security infrastructure: Wazuh Manager static IP + GCS Evidence Locker.
#
# wazuh-ip          — Regional static IP for Wazuh Agent enrollment (port 1514)
#                     and Wazuh API (port 55000). Agents in spoke clusters connect here.
# evidence-locker   — GCS bucket for centralized SOC 2 compliance evidence
#                     (Prowler reports, Wazuh exports).

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
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.prowler_uploader.email}"
}

# Read-only project access for Prowler CIS compliance scanning.
resource "google_project_iam_member" "prowler_viewer" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "serviceAccount:${google_service_account.prowler_uploader.email}"
}

resource "google_project_iam_member" "prowler_security_reviewer" {
  project = var.project_id
  role    = "roles/iam.securityReviewer"
  member  = "serviceAccount:${google_service_account.prowler_uploader.email}"
}

# Browser role grants resourcemanager.projects.list which Prowler needs
# to discover projects (projects().list() API call).
resource "google_project_iam_member" "prowler_browser" {
  project = var.project_id
  role    = "roles/browser"
  member  = "serviceAccount:${google_service_account.prowler_uploader.email}"
}

resource "google_service_account_iam_member" "prowler_workload_identity" {
  service_account_id = google_service_account.prowler_uploader.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[security/prowler]"
}

# Grype CVE scanner reuses the same SA for uploading evidence to GCS.
resource "google_service_account_iam_member" "grype_workload_identity" {
  service_account_id = google_service_account.prowler_uploader.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[security/grype]"
}

# Static JSON key for non-GCP spokes (AWS/Azure) that cannot use Workload Identity.
# Sealed into prowler-gcs-credentials / grype-gcs-credentials as sa-key.json.
# Rotate by tainting this resource and re-applying.
resource "google_service_account_key" "prowler_uploader_key" {
  service_account_id = google_service_account.prowler_uploader.name
}

# -----------------------------------------------------------------------
# Firewall: allow Wazuh agent traffic from any source.
# Spoke clusters are created dynamically so their NAT IPs are not known
# ahead of time. All sources are permitted; the Manager itself enforces
# enrollment keys for authentication.
# -----------------------------------------------------------------------

resource "google_compute_firewall" "wazuh_agent_ingress" {
  name    = "allow-wazuh-agent-ingress"
  project = var.project_id
  network = module.vpc.network_name

  direction = "INGRESS"
  priority  = 900

  allow {
    protocol = "tcp"
    ports    = ["1514", "1515"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["wazuh-manager"]

  description = "Allow Wazuh agent traffic from any source. Agents authenticate via enrollment keys."
}

# -----------------------------------------------------------------------
# oauth2-proxy Google Groups service account.
#
# Used by oauth2-proxy to verify that the authenticated user belongs to
# the devops@falkordb.com Google Group via the Directory API.
# Requires domain-wide delegation — see deployment-runbook.md Step 3.5.2.
# -----------------------------------------------------------------------

resource "google_service_account" "oauth2_proxy_groups" {
  account_id   = "oauth2-proxy-groups"
  display_name = "oauth2-proxy Google Groups lookup"
  project      = var.project_id
}

# Static JSON key — sealed into oauth2-proxy-credentials as google-admin-sa-json.
# Rotate by tainting this resource and re-applying.
resource "google_service_account_key" "oauth2_proxy_groups_key" {
  service_account_id = google_service_account.oauth2_proxy_groups.name
}

# -----------------------------------------------------------------------
# OAuth2 client for oauth2-proxy (security dashboard access control).
#
# The google_iap_brand and google_iap_client resources were removed because
# the IAP OAuth Admin APIs were permanently shut down on 2026-03-19.
#
# Create the OAuth2 client manually in the Google Cloud Console:
#   APIs & Services → Credentials → Create OAuth client ID → Web application
#   Authorized redirect URIs:
#     - https://auth.security.dev.internal.falkordb.cloud/oauth2/callback
#     - https://auth.security.internal.falkordb.cloud/oauth2/callback
#
# Place the client-id and client-secret into the oauth2-proxy secrets.env
# and seal with seal_env.sh.
# -----------------------------------------------------------------------
