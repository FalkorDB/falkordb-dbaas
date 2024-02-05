

resource "helm_release" "falkordb" {
  name      = "falkordb"
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
  ###### EXTERNAL DNS ######
  set {
    name  = "useExternalDNS.enabled"
    value = "true"
  }
  set {
    name  = "useExternalDNS.annotationKey"
    value = false
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

  ###### MASTER ######
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
  # set {
  #   name  = "metrics.serviceMonitor.enabled"
  #   value = true
  # }
  # set {
  #   name  = "metrics.serviceMonitor.namespace"
  #   value = var.deployment_namespace
  # }
  # set {
  #   name  = "metrics.serviceMonitor.additionalLabels.release"
  #   value = "falkordb-monitoring"
  # }
  # set {
  #   name  = "metrics.serviceMonitor.additionalLabels.app\\.kubernetes\\.io/part-of"
  #   value = "google-cloud-managed-prometheus"
  # }

  # set_list {
  #   name  = "metrics.serviceMonitor.relabelings[0].sourceLabels"
  #   value = ["__meta_kubernetes_pod_name"]
  # }
  # set {
  #   name  = "metrics.serviceMonitor.relabelings[0].action"
  #   value = "Replace"
  # }
  # set {
  #   name  = "metrics.serviceMonitor.relabelings[0].targetLabel"
  #   value = "instance"
  # }
  # set {
  #   name  = "metrics.serviceMonitor.relabelings[0].regex"
  #   value = "(.*redis.*)"
  # }
  # set {
  #   name  = "metrics.podMonitor.enabled"
  #   value = true
  # }
  # set {
  #   name  = "metrics.podMonitor.namespace"
  #   value = var.deployment_namespace
  # }
  # set {
  #   name  = "metrics.podMonitor.additionalLabels.app\\.kubernetes\\.io/part-of"
  #   value = "google-cloud-managed-prometheus"
  # }

}
