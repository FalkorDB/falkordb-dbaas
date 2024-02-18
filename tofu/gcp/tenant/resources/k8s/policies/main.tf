
# Deny all policy
resource "kubernetes_network_policy" "default_deny_all" {
  metadata {
    name      = "default-deny-all"
    namespace = var.deployment_namespace
  }
  spec {
    pod_selector {
    }

    policy_types = ["Ingress", "Egress"]
  }
}


# Allow same-set pod communication in ports defined
resource "kubernetes_network_policy" "allow_same_set_pod_communication" {
  metadata {
    name      = "allow-same-set-pod-communication"
    namespace = var.deployment_namespace
  }
  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" : var.deployment_name
      }
    }

    policy_types = ["Ingress", "Egress"]

    ingress {
      from {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/instance" : var.deployment_name
          }
        }
      }
      dynamic "ports" {
        for_each = var.allow_ports_pod
        content {
          protocol = "TCP"
          port     = ports.value
        }
      }
    }

    egress {
    }
  }
}


# Allow DNS policy
resource "kubernetes_network_policy" "allow_dns" {
  metadata {
    name      = "allow-dns"
    namespace = var.deployment_namespace
  }
  spec {
    pod_selector {
    }

    policy_types = ["Egress"]

    egress {
      to {
        namespace_selector {
        }
        pod_selector {
          match_labels = {
            "k8s-app" = "kube-dns"
          }
        }
      }

      ports {
        protocol = "UDP"
        port     = 53
      }
      ports {
        protocol = "TCP"
        port     = 53
      }
    }
  }
}

# Allow backup pod to connect to deployment
resource "kubernetes_network_policy" "allow_backup_all_egress" {
  metadata {
    name      = "allow-backup-all-egress"
    namespace = var.deployment_namespace
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" : "falkordb-backup"
      }
    }

    policy_types = ["Egress"]

    egress {

    }
  }
}

resource "kubernetes_network_policy" "allow_pod_backup" {
  metadata {
    name      = "allow-pod-backup"
    namespace = var.deployment_namespace
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" : var.deployment_name
      }
    }

    policy_types = ["Ingress"]

    ingress {
      from {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/instance" : "falkordb-backup"
          }
        }
      }
      dynamic "ports" {
        for_each = var.allow_ports_pod
        content {
          protocol = "TCP"
          port     = ports.value
        }
      }

    }

  }
}


# Allow backup pod to connect to deployment
resource "kubernetes_network_policy" "allow_labeler_falkordb" {
  metadata {
    name      = "allow-labeler-falkordb"
    namespace = var.deployment_namespace
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/name" : "labeler"
      }
    }

    policy_types = ["Egress"]

    egress {
      to {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/instance" : var.deployment_name
          }
        }
      }
      dynamic "ports" {
        for_each = var.allow_ports_pod
        content {
          protocol = "TCP"
          port     = ports.value
        }
      }
    }
  }
}

resource "kubernetes_network_policy" "allow_pod_labeler" {
  metadata {
    name      = "allow-pod-labeler"
    namespace = var.deployment_namespace
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" : var.deployment_name
      }
    }

    policy_types = ["Ingress"]

    ingress {
      from {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/name" : "labeler"
          }
        }
      }
      dynamic "ports" {
        for_each = var.allow_ports_pod
        content {
          protocol = "TCP"
          port     = ports.value
        }
      }

    }

  }
}



resource "kubernetes_network_policy" "allow_labeler_system" {
  metadata {
    name      = "allow-labeler-system"
    namespace = var.deployment_namespace
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/name" : "labeler"
      }
    }

    policy_types = ["Egress"]

    egress {
      to {
        ip_block {
          cidr = "10.96.0.1/32"
        }
      }
      to {
        ip_block {
          cidr = "10.0.0.2/32"
        }
      }
      ports {
        protocol = "TCP"
        port     = 443
      }
    }

  }
}






# Allow specific CIDR policy
resource "kubernetes_network_policy" "allow_specific_cidr" {
  metadata {
    name      = "allow-specific-cidr"
    namespace = var.deployment_namespace
  }
  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" : var.deployment_name
      }
    }

    policy_types = ["Ingress", "Egress"]

    ingress {
      dynamic "from" {
        for_each = length(var.cidr_blocks) > 0 ? [1] : []
        content {
          dynamic "ip_block" {
            for_each = var.cidr_blocks
            content {
              cidr = each.value
            }
          }
        }
      }
      dynamic "ports" {
        for_each = var.allow_ports_pod
        content {
          protocol = "TCP"
          port     = ports.value
        }
      }

    }

    egress {
      dynamic "to" {
        for_each = length(var.cidr_blocks) > 0 ? [1] : []
        content {
          dynamic "ip_block" {
            for_each = var.cidr_blocks
            content {
              cidr = each.value
            }
          }
        }
      }
      dynamic "ports" {
        for_each = var.allow_ports_pod
        content {
          protocol = "TCP"
          port     = ports.value
        }
      }
    }
  }
}
