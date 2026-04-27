# ArgoCD installation on the control-plane GKE cluster.
#
# Creates:
#   - argocd namespace
#   - argocd-secret  (admin password, Dex OAuth, server secret key)
#   - argocd-google-groups secret (Google Workspace groups integration)
#   - ArgoCD Helm release (argo-cd chart, env-specific values files)
#
# The argocd-secret data block uses bcrypt() and timestamp(), both of which
# produce a new value on every plan. The lifecycle.ignore_changes guard ensures
# Terraform does not re-apply the secret after the first successful apply.

resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
    labels = {
      name = "argocd"
    }
  }
}

resource "random_id" "argocd" {
  byte_length = 16
}

resource "kubernetes_secret" "argocd-secret" {
  metadata {
    name      = "argocd-secret"
    namespace = kubernetes_namespace.argocd.metadata.0.name
  }

  data = {
    "admin.password"          = bcrypt(var.argocd_admin_password)
    "admin.passwordMtime"     = timestamp()
    "server.secretkey"        = random_id.argocd.hex
    "dex.google.clientId"     = var.dex_google_client_id
    "dex.google.clientSecret" = var.dex_google_client_secret
    "dex.google.adminEmail"   = var.dex_google_admin_email
  }

  # bcrypt() and timestamp() produce a new value on every plan; ignore after
  # initial bootstrap so CI does not re-apply the secret on every run.
  lifecycle {
    ignore_changes = [data]
  }

  depends_on = [kubernetes_namespace.argocd]
}

resource "kubernetes_secret" "argocd-google-groups" {
  metadata {
    name      = "argocd-google-groups"
    namespace = kubernetes_namespace.argocd.metadata.0.name
  }

  data = {
    "googleAuth.json" = base64decode(var.argocd_groups_sa_json)
  }

  depends_on = [kubernetes_namespace.argocd]
}

resource "helm_release" "argocd" {
  name = "argocd"

  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "9.1.5"

  skip_crds = false

  values = var.environment == "development" ? [file("./values/dev/argocd.yaml")] : [file("./values/prod/argocd.yaml")]

  depends_on = [kubernetes_secret.argocd-secret]
}
