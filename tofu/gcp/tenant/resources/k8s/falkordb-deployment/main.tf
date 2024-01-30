

resource "random_password" "falkordb_password" {
  length  = 8
  special = false
}

locals {
  falkordb_password = var.falkordb_password != null ? var.falkordb_password : random_password.falkordb_password.result
}

resource "kubernetes_namespace" "falkordb" {
  metadata {
    name = "${var.tenant_name}-falkordb"
  }
}


resource "helm_release" "falkordb" {
  name      = "falkordb"
  namespace = kubernetes_namespace.falkordb.metadata[0].name

  # Necessary so there's enough time to finish installing
  timeout = 600

  chart = "https://charts.bitnami.com/bitnami/redis-18.6.3.tgz"

  set {
    name  = "global.redis.password"
    value = local.falkordb_password
  }
  set {
    name  = "image.repository"
    value = "falkordb/falkordb"
  }
  set {
    name  = "image.tag"
    value = var.falkordb_version
  }
  set_list {
    name  = "master.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "master.resources.requests.cpu"
    value = var.falkordb_cpu
  }
  set {
    name  = "master.resources.requests.memory"
    value = var.falkordb_memory
  }
  set {
    name  = "master.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "sentinel.service.type"
    value = "ClusterIP"
  }
  set {
    name  = "replica.replicaCount"
    value = var.falkordb_replicas
  }
  set_list {
    name  = "replica.extraFlags"
    value = ["--loadmodule", "/FalkorDB/bin/linux-x64-release/src/falkordb.so"]
  }
  set {
    name  = "replica.resources.requests.cpu"
    value = var.falkordb_cpu
  }
  set {
    name  = "replica.resources.requests.memory"
    value = var.falkordb_memory
  }
  set {
    name  = "replica.persistence.size"
    value = var.persistance_size
  }
  set {
    name  = "sentinel.enabled"
    value = true
  }
  set {
    name  = "sentinel.service.annotations.cloud\\.google\\.com/neg"
    value = "\\{\"exposed_ports\":\\{\"${var.deployment_port}\":\\{\"name\":\"${var.deployment_neg_name}\"\\}\\}\\}"
    # value = jsonencode({
    #   "cloud.google.com/neg" : {
    #     "exposed_ports" : {
    #       "${var.deployment_port}" : {
    #         "name" : "${var.deployment_neg_name}"
    #       }
    #     }
    #   }
    # })
  }
  set {
    name  = "metrics.enabled"
    value = true
  }
  set {
    name  = "metrics.serviceMonitor.enabled"
    value = true
  }
  set {
    name  = "metrics.serviceMonitor.namespace"
    value = kubernetes_namespace.falkordb.metadata[0].name
  }
  set {
    name  = "metrics.serviceMonitor.additionalLabels.release"
    value = "falkordb-monitoring"
  }
  set_list {
    name  = "metrics.serviceMonitor.relabelings[0].sourceLabels"
    value = ["__meta_kubernetes_pod_name"]
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].action"
    value = "Replace"
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].targetLabel"
    value = "instance"
  }
  set {
    name  = "metrics.serviceMonitor.relabelings[0].regex"
    value = "(.*redis.*)"
  }
  set {
    name  = "useExternalDNS.enabled"
    value = "true"
  }
  set {
    name  = "useExternalDNS.suffix"
    value = "falkordb.io"
  }

  # set {
  #   name  = "global.storageClass"
  #   value = "falkordb-storage-class"
  # }

}

