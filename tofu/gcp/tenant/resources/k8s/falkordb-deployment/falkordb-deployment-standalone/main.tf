locals {
  falkordb_memory_amount = regex("([0-9])+", var.falkordb_memory)[0]
  falkordb_memory_unit   = regex("([A-Za-z]+)", var.falkordb_memory)[0]
  max_memory_factor      = local.falkordb_memory_unit == "Gi" ? pow(1024, 3) : local.falkordb_memory_unit == "Mi" ? pow(1024, 2) : pow(1024, 1)
  max_memory_bytes       = floor(local.falkordb_memory_amount * local.max_memory_factor)
}

resource "helm_release" "falkordb" {
  name      = var.deployment_name
  namespace = var.deployment_namespace

  # Necessary so there's enough time to finish installing
  timeout = 600

  chart   = "oci://registry-1.docker.io/bitnamicharts/redis"
  version = "18.9.1"

  set {
    name  = "global.redis.password"
    value = var.falkordb_password
  }
  set {
    name  = "image.repository"
    value = "falkordb/falkordb"
  }
  set {
    name  = "image.tag"
    value = var.falkordb_version
  }

  set {
    name  = "architecture"
    value = "standalone"
  }

  ###### MASTER ######
  set {
    name  = "master.service.type"
    value = var.service_type
  }
  set {
    name  = "master.service.loadBalancerIP"
    value = var.dns_ip_address
  }
  set_list {
    name  = "master.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/src/falkordb.so"]
  }
  set {
    name  = "master.resources.limits.cpu"
    value = var.falkordb_cpu
  }
  set {
    name  = "master.resources.limits.memory"
    value = var.falkordb_memory
  }
  set {
    name  = "master.resources.requests.cpu"
    value = var.falkordb_min_cpu
  }
  set {
    name  = "master.resources.requests.memory"
    value = var.falkordb_min_memory
  }
  set {
    name  = "master.persistence.size"
    value = var.persistence_size
  }
  set {
    name  = "master.containerPorts.redis"
    value = var.redis_port
  }
  set {
    name  = "master.service.ports.redis"
    value = var.redis_port
  }
  set {
    name  = "master.persistence.enabled"
    value = true
  }
  set {
    name  = "master.persistence.storageClass"
    value = var.storage_class_name
  }
  set {
    name  = "master.persistentVolumeClaimRetentionPolicy.enabled"
    value = true
  }
  set {
    name  = "master.persistentVolumeClaimRetentionPolicy.whenScaled"
    value = "Delete"
  }
  set {
    name  = "master.persistentVolumeClaimRetentionPolicy.whenDeleted"
    value = "Delete"
  }
  # Node Selector to node_pool_name
  set {
    name  = "master.nodeSelector.cloud\\.google\\.com/gke-nodepool"
    value = var.node_pool_name
  }

  ###### METRICS ######
  set {
    name  = "metrics.enabled"
    value = true
  }
  set {
    name  = "metrics.extraArgs.redis\\.addr"
    value = "redis://localhost:${var.redis_port}"
  }
  set {
    name  = "metrics.podLabels.app\\.kubernetes\\.io/name"
    value = "redis"
  }


  set {
    name  = "commonConfiguration"
    value = <<EOF
appendonly yes
save ""
maxmemory ${local.max_memory_bytes}
EOF
  }
}
