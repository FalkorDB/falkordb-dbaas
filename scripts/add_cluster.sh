#!/bin/bash

# Require gum (https://github.com/charmbracelet/gum)
if ! command -v gum &> /dev/null
then
    echo "gum could not be found. Please install it before running this script."
    echo "Installation instructions:"
    echo "- macOS: brew install charmbracelet/tap/gum"
    echo "- Linux: sudo apt install gum (if available) or download the binary from https://github.com/charmbracelet/gum/releases"
    echo "- Windows: Use Scoop: scoop install gum or download from https://github.com/charmbracelet/gum/releases"
    exit
fi

# Enable error handling
set -euo pipefail
trap 'echo "Error on line $LINENO: $(tail -n +$LINENO "$0" | head -n 1)"; exit 1' ERR
trap "echo 'Script interrupted by user'; exit" SIGINT

# Main menu
PLATFORM=$(gum choose "GCP" "AWS")

# Environment variables
export ARGOCD_SERVER=$(gum input --placeholder "Enter ArgoCD Server")
export PAGERDUTY_API_KEY=$(gum input --placeholder "Enter PagerDuty API Key")
export CTRL_PLANE_CTX=$(gum input --placeholder "Enter Control Plane Context Name")

if [ "$PLATFORM" == "GCP" ]; then
    export PROJECT=$(gum input --placeholder "Enter GCP Project ID")
    export REGION=$(gum input --placeholder "Enter GCP Region")
    export CLUSTER=$(gum input --placeholder "Enter GCP App Plane Cluster Name")
    export APP_PLANE_CTX=$(gum input --placeholder "Enter App Plane Cluster Context Name")
else
    export REGION=$(gum input --placeholder "Enter AWS Region")
    export CLUSTER=$(gum input --placeholder "Enter AWS App Plane Cluster Name")
    export APP_PLANE_CTX=$(gum input --placeholder "Enter App Plane Cluster Context Name")
    export NODE_ROLE=$(gum input --placeholder "Enter AWS Node Role")
    export SUBNETS=$(gum input --placeholder "Enter AWS Subnets (comma-separated)")
    AWS_PROFILE=$(gum input --placeholder "Enter AWS Profile (leave blank for default)" --value "default")
fi

# Review inputs
echo "Review your inputs:" > /tmp/review.txt
echo "Platform: $PLATFORM" >> /tmp/review.txt
echo "ArgoCD Server: $ARGOCD_SERVER" >> /tmp/review.txt
echo "PagerDuty API Key: [HIDDEN]" >> /tmp/review.txt
echo "Control Plane Context: $CTRL_PLANE_CTX" >> /tmp/review.txt
if [ "$PLATFORM" == "GCP" ]; then
    echo "Project: $PROJECT" >> /tmp/review.txt
    echo "Region: $REGION" >> /tmp/review.txt
    echo "Cluster: $CLUSTER" >> /tmp/review.txt
    echo "App Plane Context: $APP_PLANE_CTX" >> /tmp/review.txt
else
    echo "Region: $REGION" >> /tmp/review.txt
    echo "Cluster: $CLUSTER" >> /tmp/review.txt
    echo "App Plane Context: $APP_PLANE_CTX" >> /tmp/review.txt
    echo "Node Role: $NODE_ROLE" >> /tmp/review.txt
    echo "Subnets: $SUBNETS" >> /tmp/review.txt
    echo "AWS Profile: $AWS_PROFILE" >> /tmp/review.txt
fi
echo "" >> /tmp/review.txt
echo "Press ESC to continue" >> /tmp/review.txt
gum pager < /tmp/review.txt
gum confirm "Are the above details correct?" || exit

if [ "$PLATFORM" == "GCP" ]; then
    if ! gcloud container node-pools list --cluster=$CLUSTER --region=$REGION --project=$PROJECT | grep -q "observability"; then
        gum spin --spinner dot --title "Creating node pool..." --show-error -- \
        gcloud container node-pools create observability \
            --cluster=$CLUSTER \
            --region=$REGION \
            --machine-type=e2-standard-2 \
            --disk-size=50 \
            --enable-autoscaling \
            --max-nodes=10 \
            --project=$PROJECT \
            --node-labels=node_pool=observability
    else
        echo "Node pool 'observability' already exists, skipping creation."
    fi

    gum spin --spinner dot --title "Setting current context to $CLUSTER..." --show-error -- \
    gcloud container clusters get-credentials $CLUSTER --region=$REGION --project=$PROJECT

elif [ "$PLATFORM" == "AWS" ]; then
    if ! aws eks list-nodegroups --cluster-name $CLUSTER --profile $AWS_PROFILE | grep -q "observability"; then
        gum spin --spinner dot --title "Creating node group..." --show-error -- \
        aws eks create-nodegroup \
            --cluster-name $CLUSTER \
            --nodegroup-name observability \
            --node-role $NODE_ROLE \
            --subnets $SUBNETS \
            --instance-types m5.large \
            --disk-size 50 \
            --scaling-config minSize=1,maxSize=10,desiredSize=1 \
            --labels node_pool=observability \
            --profile $AWS_PROFILE
    else
        echo "Node group 'observability' already exists, skipping creation."
    fi

    gum spin --spinner dot --title "Setting current context to $CLUSTER..." --show-error -- \
    aws eks update-kubeconfig --name $CLUSTER --region=$REGION --profile $AWS_PROFILE
fi

# Login to ArgoCD
gum spin --spinner dot --title "Logging in to ArgoCD..." --show-error -- \
argocd login $ARGOCD_SERVER --username admin --password $(kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" --context $CTRL_PLANE_CTX | base64 --decode) --insecure --plaintext

# Create observability namespace
if ! kubectl get namespace observability &> /dev/null; then
    gum spin --spinner dot --title "Creating observability namespace..." --show-error -- \
    kubectl create namespace observability
else
    echo "Observability namespace already exists, skipping creation."
fi

# Create PagerDuty secret
if ! kubectl get secret pagerduty-service-key --namespace=observability &> /dev/null; then
    gum spin --spinner dot --title "Creating PagerDuty secret..." --show-error -- \
    kubectl create secret generic pagerduty-service-key \
        --from-literal=api-key=$PAGERDUTY_API_KEY \
        --namespace=observability
else
    echo "PagerDuty secret already exists, skipping creation."
fi

# Add cluster credentials
if ! argocd cluster list | grep -q "$APP_PLANE_CTX"; then
    gum spin --spinner dot --title "Adding cluster credentials to control plane..." --show-error -- \
    argocd cluster add $APP_PLANE_CTX --server $ARGOCD_SERVER --label role=app-plane --label cloud_provider="$(echo $PLATFORM | tr '[:upper:]' '[:lower:]')"
else
    echo "Cluster credentials for '$APP_PLANE_CTX' already added, skipping."
fi

# Wait for vmuser secret
echo "Waiting for vmuser secret..."
while ! kubectl get secret $CLUSTER-vmuser -n observability --context $CTRL_PLANE_CTX &> /dev/null; do
    sleep 2
    echo -n "."
done

echo "vmuser secret created."

# Create vmuser secret
if ! kubectl get secret vmuser --namespace=observability &> /dev/null; then
    gum spin --spinner dot --title "Creating vmuser secret..." --show-error -- \
    kubectl create secret generic vmuser \
        --from-literal=password=$(kubectl get secret $CLUSTER-vmuser -n observability -o jsonpath="{.data.password}" --context $CTRL_PLANE_CTX | base64 --decode) \
        --namespace=observability
else
    echo "vmuser secret already exists, skipping creation."
fi

echo "Observability stack setup complete for $PLATFORM cluster."
