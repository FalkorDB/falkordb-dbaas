
resource "google_dns_managed_zone" "dns_zone" {
  project = var.project_id
  name    = "${var.tenant_group_name}-dns"

  dns_name   = "${var.tenant_group_name}.${var.dns_domain}."
  visibility = "public"
}
