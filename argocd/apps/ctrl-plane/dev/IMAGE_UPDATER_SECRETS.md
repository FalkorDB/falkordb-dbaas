# ArgoCD Image Updater — Sealed Secrets (dev)
#
# Before the ArgoCD Image Updater Application can sync, two secrets must be
# manually created and sealed for the dev cluster:
#
# 1. argocd-image-updater-pull-secret
#    Used to pull images from us-central1-docker.pkg.dev (GCR json key or WI token).
#    kubectl create secret docker-registry argocd-image-updater-pull-secret \
#      -n argocd \
#      --docker-server=us-central1-docker.pkg.dev \
#      --docker-username=_json_key \
#      --docker-password="$(cat sa-key.json)"
#    kubeseal --controller-name=sealed-secrets -o yaml > \
#      argocd/ctrl_plane/dev/manifests/argocd-image-updater-pull-secret.yaml
#
# 2. argocd-image-updater-git-secret
#    Used for git write-back (GitHub token with repo write permission).
#    kubectl create secret generic argocd-image-updater-git-secret \
#      -n argocd \
#      --from-literal=username=falkordb-bot \
#      --from-literal=password=<GH_TOKEN>
#    kubeseal --controller-name=sealed-secrets -o yaml > \
#      argocd/ctrl_plane/dev/manifests/argocd-image-updater-git-secret.yaml
#
# Then git add + commit those sealed secret files and apply them to the cluster.
# Once sealed, they can be committed safely.
