output "falkordb_host" {
  value = module.k8s.falkordb_host
}

output "falkordb_sentinel_port" { 
  value = module.k8s.falkordb_sentinel_port
}

output "falkordb_redis_port" { 
  value = module.k8s.falkordb_port
}