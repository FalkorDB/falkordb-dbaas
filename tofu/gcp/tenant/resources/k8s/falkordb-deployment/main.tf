locals {
  deployment_name = "falkordb"
  pod_name_prefix = "falkordb-redis"
}

resource "kubernetes_persistent_volume_claim" "falkordb" {
  metadata {
    name      = "deployment-pvc"
    namespace = var.deployment_namespace
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = var.persistance_size
      }
    }
    storage_class_name = var.storage_class_name
  }

}

resource "helm_release" "falkordb" {
  name      = local.deployment_name
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
    name  = "replica.persistence.existingClaim"
    value = kubernetes_persistent_volume_claim.falkordb.metadata[0].name
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
  dynamic "set" {
    for_each = var.multi_zone != null ? [1] : []
    content {
      name  = "replica.topologySpreadConstraints[0].maxSkew"
      value = 1
    }
  }
  dynamic "set" {
    for_each = var.multi_zone != null ? [1] : []
    content {
      name  = "replica.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[0].topologyKey"
      value = "topology.kubernetes.io/zone"
    }
  }
  dynamic "set" {
    for_each = var.multi_zone != null ? [1] : []
    content {
      name  = "replica.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[0].labelSelector.matchExpressions[0].key"
      value = "app.kubernetes.io/instance"
    }
  }
  dynamic "set" {
    for_each = var.multi_zone != null ? [1] : []
    content {
      name  = "replica.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[0].labelSelector.matchExpressions[0].operator"
      value = "In"
    }
  }
  dynamic "set" {
    for_each = var.multi_zone != null ? [1] : []
    content {
      name  = "replica.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[0].labelSelector.matchExpressions[0].values[0]"
      value = local.deployment_name
    }
  }
  dynamic "set" {
    for_each = var.pod_zone != null ? [1] : []
    content {
      name  = "replica.nodeSelector.topology\\.kubernetes\\.io/zone"
      value = var.pod_zone
    }
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
