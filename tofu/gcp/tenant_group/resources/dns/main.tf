
resource "google_dns_managed_zone" "dns_zone" {
  project = var.project_id
  name    = "${var.tenant_group_name}-dns"

  dns_name      = "${var.tenant_group_name}.${var.dns_domain}."
  visibility    = "public"
  force_destroy = true

  labels = var.labels
}

# Create DNS Service account
resource "google_service_account" "external_dns" {
  account_id   = var.dns_sa_name
  display_name = "external-dns-sa"
}

resource "google_dns_managed_zone_iam_member" "external_dns" {
  managed_zone = google_dns_managed_zone.dns_zone.name
  role         = "roles/dns.admin"
  member       = "serviceAccount:${google_service_account.external_dns.email}"
}

# Give view access to the DNS zone to the external-dns service account
resource "google_project_iam_member" "external_dns" {
  project = var.project_id
  role    = "roles/dns.reader"
  member  = "serviceAccount:${google_service_account.external_dns.email}"
}
