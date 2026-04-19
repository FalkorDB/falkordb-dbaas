# ArgoCD Image Updater — Sealed Secrets (dev)
#
# Secrets are managed via seal_env.sh. Fill in the placeholder values in:
#   argocd/kustomize/argocd-image-updater/overlays/dev/secrets.env
# then run:
#   ./scripts/seal_env.sh \
#     argocd/kustomize/argocd-image-updater/overlays/dev/secrets.env \
#     argocd
# This outputs:
#   argocd/kustomize/argocd-image-updater/overlays/dev/secrets-env-secret.yaml
# Commit the sealed file (the .env is gitignored).
#
# Secrets managed:
#
# 1. argocd-image-updater-git-secret
#    GitHub token for git write-back (repo write permission).
#    Set in secrets.env:
#      username=falkordb-bot
#      password=<GITHUB_TOKEN_WITH_REPO_WRITE>
#
# 2. argocd-image-updater-pull-secret (docker-registry type — NOT via seal_env.sh)
#    Required to pull from us-central1-docker.pkg.dev.
#    Create and seal manually:
#    kubectl create secret docker-registry argocd-image-updater-pull-secret \
#      -n argocd \
#      --docker-server=us-central1-docker.pkg.dev \
#      --docker-username=_json_key \
#      --docker-password="$(cat sa-key.json)" \
#      --dry-run=client -o yaml \
#    | kubeseal --cert ./certs/observability/sealed-secrets/dev/pub-cert.pem \
#        -o yaml > argocd/kustomize/argocd-image-updater/overlays/dev/pull-secret.yaml
#    Add pull-secret.yaml to the kustomization.yaml resources list and commit.
