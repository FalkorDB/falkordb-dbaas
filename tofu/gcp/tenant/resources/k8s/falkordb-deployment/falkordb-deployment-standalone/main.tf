locals {
  deployment_name = "falkordb"
  pod_name_prefix = "falkordb-redis"

  pod_anti_affinity = {
    "podAntiAffinity" : {
      "preferredDuringSchedulingIgnoredDuringExecution" : [
        {
          "weight" : 100,
          "podAffinityTerm" : {
            "topologyKey" : "topology.kubernetes.io/zone",
            "labelSelector" : {
              "matchLabels" : {
                "app.kubernetes.io/instance" : local.deployment_name
              }
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

  set {
    name  = "architecture"
    value = "standalone"
  }

  ###### MASTER ######
  set {
    name  = "master.service.type"
    value = "LoadBalancer"
  }
  set {
    name  = "master.service.loadBalancerIP"
    value = var.dns_ip_address
  }
  set {
    name  = "master.service.annotations.external-dns\\.alpha\\.kubernetes\\.io/hostname"
    value = var.dns_hostname
  }
  set {
    name  = "master.service.annotations.external-dns\\.alpha\\.kubernetes\\.io/ttl"
    value = var.dns_ttl
    type  = "string"
  }
  set_list {
    name  = "master.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
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
    name  = "master.persistence.size"
    value = var.persistance_size
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
