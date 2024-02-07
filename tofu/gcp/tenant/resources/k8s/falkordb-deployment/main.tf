locals {
  deployment_name = "falkordb"
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
  dynamic "set" {
    for_each = var.multi_zone != null ? [1] : []
    content {
      name  = "replica.topologySpreadConstraints[0].maxSkew"
      value = 1
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


resource "kubernetes_manifest" "multizone_pod_anti_affinity" {
  count = var.multi_zone != null ? 1 : 0

  manifest = {
    apiVersion = "v1"
    kind       = "PodAntiAffinity"
    metadata = {
      name      = "falkordb-multizone-pod-anti-affinity"
      namespace = var.deployment_namespace
    }
    spec = {
      requiredDuringSchedulingIgnoredDuringExecution = [
        {
          labelSelector = {
            matchExpressions = [
              {
                key      = "app.kubernetes.io/instance"
                operator = "In"
                values   = [local.deployment_name]
              }
            ]
          }
          topologyKey = "topology.kubernetes.io/zone"
        }
      ]
    }
  }

}
