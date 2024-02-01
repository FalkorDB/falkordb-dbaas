resource "google_dns_record_set" "dns_record" {
  name         = "${var.tenant_name}.${var.dns_domain}."
  type         = "A"
  ttl          = 15
  managed_zone = var.dns_zone_name

  rrdatas = [
    var.ip_address
  ]
}
