locals {
  pod_affinity = {
    "podAntiAffinity" : {
      "requiredDuringSchedulingIgnoredDuringExecution" : [
        # Place one pod per zone
        {
          "weight" : 100,
          "topologyKey" : "topology.kubernetes.io/zone",
          "labelSelector" : {
            "matchLabels" : {
              "app.kubernetes.io/instance" : var.deployment_name
            }
          }
        }
      ]
    }
  }
}

resource "helm_release" "falkordb" {
  name      = var.deployment_name
  namespace = var.deployment_namespace

  # Necessary so there's enough time to finish installing
  timeout = 900

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
  # set {
  #   name  = "sentinel.service.type"
  #   value = "LoadBalancer"
  # }
  # set {
  #   name  = "sentinel.service.loadBalancerIP"
  #   value = var.dns_ip_address
  # }
  # set {
  #   name  = "sentinel.service.annotations.external-dns\\.alpha\\.kubernetes\\.io/hostname"
  #   value = var.dns_hostname
  # }
  # set {
  #   name  = "sentinel.service.annotations.external-dns\\.alpha\\.kubernetes\\.io/ttl"
  #   value = var.dns_ttl
  #   type  = "string"
  # }
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

  ###### MASTER ######
  set {
    name  = "master.containerPorts.redis"
    value = var.redis_port
  }


  ###### REPLICA ######
  set {
    name  = "replica.replicaCount"
    value = var.falkordb_replicas
  }
  set_list {
    name  = "replica.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/src/falkordb.so"]
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
    name  = "replica.resources.requests.cpu"
    value = var.falkordb_min_cpu
  }
  set {
    name  = "replica.resources.requests.memory"
    value = var.falkordb_min_memory
  }
  set {
    name  = "replica.persistence.size"
    value = var.persistence_size
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
  # Node Selector to node_pool_name
  set {
    name  = "replica.nodeSelector.cloud\\.google\\.com/gke-nodepool"
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
}

resource "kubernetes_service" "read_write_service" {
  metadata {
    name      = "${var.deployment_name}-read-write"
    namespace = helm_release.falkordb.namespace
  }

  spec {
    selector = {
      "app.kubernetes.io/instance" : var.deployment_name
      "cloud.falkordb.io/role" : "master"
    }

    type             = "LoadBalancer"
    load_balancer_ip = var.dns_ip_address

    port {
      port        = var.redis_port
      target_port = var.redis_port
    }
  }
}
