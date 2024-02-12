
# Deny all policy
resource "kubernetes_network_policy" "default_deny_all" {
  metadata {
    name = "np-default-deny-all"
  }
  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" : var.deployment_name
      }
    }

    policy_types = ["Ingress", "Egress"]

    ingress {

    }

    egress {

    }
  }
}


# Allow same-set pod communication in ports defined
resource "kubernetes_network_policy" "allow_same_set_pod_communication" {
  metadata {
    name = "np-allow-same-set-pod-communication"
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
      to {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/instance" : var.deployment_name
          }
        }
      }
    }
  }
}


# Allow DNS policy
resource "kubernetes_network_policy" "allow_dns" {
  metadata {
    name = "np-allow-dns"
  }
  spec {
    pod_selector {
    }

    policy_types = ["Egress"]

    egress {
      to {
        namespace_selector {
          match_labels = {
            name = "kube-system"
          }

        }
      }

      ports {
        protocol = "UDP"
        port     = 53
      }
    }
  }
}


# Allow specific CIDR policy
resource "kubernetes_network_policy" "allow_specific_cidr" {
  metadata {
    name = "np-allow-specific-cidr"
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
        ip_block {
          cidr = var.cidr_block
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
      to {
        ip_block {
          cidr = var.cidr_block
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
