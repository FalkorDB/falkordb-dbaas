
resource "google_dns_managed_zone" "dns_zone" {
  project = var.project_id
  name    = "${var.tenant_group_name}-dns"

  dns_name   = "${var.tenant_group_name}.${var.dns_domain}."
  visibility = "public"
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
