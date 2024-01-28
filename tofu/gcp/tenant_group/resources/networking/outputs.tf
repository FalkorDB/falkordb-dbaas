output "network_name" {
  value = module.vpc.network_name
}

output "subnets" {
    value = local.subnets
}
output "ip_address_name" {
  value = module.lb_ip.names[0]
}

output "ip_address" {
  value = module.lb_ip.addresses[0]
}