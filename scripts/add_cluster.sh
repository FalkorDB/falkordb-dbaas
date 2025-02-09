#!/bin/bash

# Require gum (https://github.com/charmbracelet/gum)
if ! command -v gum &> /dev/null
then
    echo "gum could not be found. Please install it before running this script."
    exit
fi

# Enable error handling
set -euo pipefail
trap 'echo "Error on line $LINENO"; exit 1' ERR

# Main menu
PLATFORM=$(gum choose "GCP" "AWS")
gum confirm "You selected $PLATFORM. Continue?" || exit

# Environment variables
export ARGOCD_SERVER=$(gum input --placeholder "Enter ArgoCD Server")
export PAGERDUTY_API_KEY=$(gum input --placeholder "Enter PagerDuty API Key")
export CTRL_PLANE_CTX=$(gum input --placeholder "Enter Control Plane Context Name")

if [ "$PLATFORM" == "GCP" ]; then
    export PROJECT=$(gum input --placeholder "Enter GCP Project ID")
    export REGION=$(gum input --placeholder "Enter GCP Region")
    export CLUSTER=$(gum input --placeholder "Enter GCP App Plane Cluster Name")
    export APP_PLANE_CTX=$(gum input --placeholder "Enter App Plane Cluster Context Name")

    gum spin --show-error --spinner dot --title "Creating node pool..." -- \
    gcloud container node-pools create observability \
        --cluster=$CLUSTER \
        --region=$REGION \
        --machine-type=e2-standard-2 \
        --disk-size=50 \
        --enable-autoscaling \
        --max-nodes=10 \
        --project=$PROJECT \
        --node-labels=node_pool=observability

    gum spin --show-error --spinner dot --title "Setting current context to $CLUSTER..." -- \
    gcloud container clusters get-credentials $CLUSTER --region=$REGION --project=$PROJECT

elif [ "$PLATFORM" == "AWS" ]; then
    export CLUSTER=$(gum input --placeholder "Enter AWS App Plane Cluster Name")
    export APP_PLANE_CTX=$(gum input --placeholder "Enter App Plane Cluster Context Name")
    export NODE_ROLE=$(gum input --placeholder "Enter AWS Node Role")
    export SUBNETS=$(gum input --placeholder "Enter AWS Subnets (comma-separated)")

    gum spin --show-error --spinner dot --title "Creating node group..." -- \
    aws eks create-nodegroup \
        --cluster-name $CLUSTER \
        --nodegroup-name observability \
        --node-role $NODE_ROLE \
        --subnets $SUBNETS \
        --instance-types m5.large \
        --disk-size 50 \
        --scaling-config minSize=1,maxSize=10,desiredSize=1 \
        --labels node_pool=observability

    gum spin --show-error --spinner dot --title "Setting current context to $CLUSTER..." -- \
    aws eks update-kubeconfig --name $CLUSTER --region=$REGION
fi

# Create PagerDuty secret
gum spin --show-error --spinner dot --title "Creating PagerDuty secret..." -- \
kubectl create secret generic pagerduty-service-key \
    --from-literal=api-key=$PAGERDUTY_API_KEY \
    --namespace=observability

# Add cluster credentials
gum spin --show-error --spinner dot --title "Adding cluster credentials to control plane..." -- \
argocd cluster add $APP_PLANE_CTX --server $ARGOCD_SERVER --label role=app-plane,cloud_provider=$PLATFORM

# Wait for vmuser secret
echo "Waiting for vmuser secret..."
while ! kubectl get secret $CLUSTER-vmuser -n observability --context $CTRL_PLANE_CTX &> /dev/null; do
    sleep 2
    echo -n "."
done

echo "vmuser secret created."

# Create vmuser secret
gum spin --show-error --spinner dot --title "Creating vmuser secret..." -- \
kubectl create secret generic vmuser \
    --from-literal=password=$(kubectl get secret $CLUSTER-vmuser -n observability -o jsonpath="{.data.password}" --context $CTRL_PLANE_CTX | base64 --decode) \
    --namespace=observability

echo "Observability stack setup complete for $PLATFORM cluster."
