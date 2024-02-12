locals {
  deployment_name = "falkordb"
  pod_name_prefix = "falkordb-redis"

  pod_affinity = {
    "podAffinity" : {
      "requiredDuringSchedulingIgnoredDuringExecution" : [
        {
          "topologyKey" : "topology.kubernetes.io/zone",
          "labelSelector" : {
            "matchLabels" : {
              "app.kubernetes.io/instance" : local.deployment_name
            }
          }
        }
      ]
    }
  }

}

resource "helm_release" "falkordb" {
  name      = local.deployment_name
  namespace = var.deployment_namespace

  # Necessary so there's enough time to finish installing
  timeout = 360

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

  ###### SENTINEL ######
  set {
    name  = "sentinel.enabled"
    value = true
  }
  set {
    name  = "sentinel.service.type"
    value = "LoadBalancer"
  }
  set {
    name  = "sentinel.service.loadBalancerIP"
    value = var.dns_ip_address
  }
  set {
    name  = "sentinel.service.annotations.external-dns\\.alpha\\.kubernetes\\.io/hostname"
    value = var.dns_hostname
  }
  set {
    name  = "sentinel.service.annotations.external-dns\\.alpha\\.kubernetes\\.io/ttl"
    value = var.dns_ttl
    type  = "string"
  }
  set {
    name  = "sentinel.containerPorts.sentinel"
    value = var.sentinel_port
  }
  set {
    name  = "sentinel.service.ports.sentinel"
    value = var.sentinel_port
  }
  set {
    name  = "sentinel.service.ports.redis"
    value = var.redis_port
  }

  ###### REPLICA ######
  set {
    name  = "replica.replicaCount"
    value = var.falkordb_replicas
  }
  set_list {
    name  = "replica.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "replica.resources.limits.cpu"
    value = var.falkordb_cpu
  }
  set {
    name  = "replica.resources.limits.memory"
    value = var.falkordb_memory
  }
  set {
    name  = "replica.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "replica.containerPorts.redis"
    value = var.redis_port
  }
  set {
    name  = "replica.service.ports.redis"
    value = var.redis_port
  }
  set {
    name  = "replica.persistence.enabled"
    value = true
  }
  set {
    name  = "replica.persistence.storageClass"
    value = var.storage_class_name
  }
  set {
    name  = "replica.persistentVolumeClaimRetentionPolicy.enabled"
    value = true
  }
  set {
    name  = "replica.persistentVolumeClaimRetentionPolicy.whenScaled"
    value = "Delete"
  }
  set {
    name  = "replica.persistentVolumeClaimRetentionPolicy.whenDeleted"
    value = "Delete"
  }

  set {
    name  = "replica.affinity"
    value = yamlencode(local.pod_affinity)
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
}
