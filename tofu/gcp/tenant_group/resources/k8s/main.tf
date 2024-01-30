
resource "kubernetes_role" "tenant_provision_sa_role" {
    metadata {
        name = "provisioner-sa-role"
    }
    
    rule {
        api_groups = ["*"]
        resources  = ["*"]
        verbs      = ["*"]
    }
}

resource "kubernetes_role_binding" "tenant_provision_sa_role_binding" {
    metadata {
        name = "provisioner-sa-role-binding"
    }
    
    role_ref {
        api_group = "rbac.authorization.k8s.io"
        kind      = "Role"
        name      = kubernetes_role.tenant_provision_sa_role.metadata[0].name
    }
    
    subject {
        kind      = "ServiceAccount"
        name      = var.tenant_provision_sa
        namespace = "default"
    }
}