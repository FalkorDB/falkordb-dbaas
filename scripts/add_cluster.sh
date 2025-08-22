#!/bin/bash

# YAML Configuration Template:
# ---
# argocd_server: x
# argocd_username: x
# argocd_password: x
# pagerduty_api_key: x
# control_plane_context: x
# app_plane_clusters:
#  - platform: gcp
#    context: x
#    cluster_name: x
#    project: x
#    region: x
#  - platform: aws
#    context: x
#    cluster_name: x
#    node_role: x
#    aws_profile: x
#    region: x
#    network_id: x
#  - platform: azure
#    context: x
#    cluster_name: x
#    resource_group: x

# Require yq
if ! command -v yq &>/dev/null; then
    echo "yq could not be found. Please install it before running this script."
    exit 1
fi

# Enable error handling
set -euo pipefail
trap 'echo "Error on line $LINENO: $(tail -n +$LINENO "$0" | head -n 1)"; exit 1' ERR
trap "echo 'Script interrupted by user'; exit" SIGINT

# Ensure a configuration file is passed as an argument
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <config.yaml>"
    exit 1
fi
CONFIG_FILE=$1

# Read YAML file
export ARGOCD_SERVER=$(yq e '.argocd_server' $CONFIG_FILE)
export ARGOCD_USERNAME=$(yq e '.argocd_username' $CONFIG_FILE)
export ARGOCD_PASSWORD=$(yq e '.argocd_password' $CONFIG_FILE)
export PAGERDUTY_API_KEY=$(yq e '.pagerduty_api_key' $CONFIG_FILE)
export CTRL_PLANE_CTX=$(yq e '.control_plane_context' $CONFIG_FILE)

# Extract cluster details and process them sequentially
yq e '.app_plane_clusters[]' $CONFIG_FILE -o=json | jq -c '.' | while read -r cluster_json; do
    PLATFORM=$(echo "$cluster_json" | jq -r '.platform')    
    REGION=$(echo "$cluster_json" | jq -r '.region // empty')
    CLUSTER=$(echo "$cluster_json" | jq -r '.cluster_name')
    APP_PLANE_CTX=$(echo "$cluster_json" | jq -r '.context')

    echo "Setting up observability stack for $CLUSTER..."

    if [ "$PLATFORM" == "gcp" ]; then
        PROJECT=$(echo "$cluster_json" | jq -r '.project')
        if ! gcloud container node-pools list --cluster=$CLUSTER --region=$REGION --project=$PROJECT | grep -q "observability"; then
            gcloud container node-pools create observability \
                --cluster=$CLUSTER \
                --region=$REGION \
                --machine-type=e2-standard-2 \
                --disk-size=50 \
                --enable-autoscaling \
                --max-nodes=10 \
                --max-pods-per-node=25 \
                --project=$PROJECT \
                --node-labels=node_pool=observability
        fi
        gcloud container clusters get-credentials $CLUSTER --region=$REGION --project=$PROJECT

    elif [ "$PLATFORM" == "aws" ]; then
        export AWS_PAGER=""
        AWS_PROFILE=$(echo "$cluster_json" | jq -r '.aws_profile')
        NETWORK_ID=$(echo "$cluster_json" | jq -r '.network_id')
        NODE_ROLE=$(echo "$cluster_json" | jq -r '.node_role')

        VPC_ID=$(aws ec2 describe-vpcs --region $REGION --profile $AWS_PROFILE --filters "Name=tag:Name,Values=omnistrate-vpc-$CLUSTER" | jq -r '.Vpcs[0].VpcId')

        if [[ -z "$VPC_ID" || "$VPC_ID" == "null" ]]; then
            VPC_ID=$(aws ec2 describe-vpcs --region $REGION --profile $AWS_PROFILE --filters "Name=tag:Name,Values=omnistrate-vpc-$NETWORK_ID" | jq -r '.Vpcs[0].VpcId')
            if [[ -z "$VPC_ID" || "$VPC_ID" == "null" ]]; then
                echo "VPC not found for $NETWORK_ID."
                exit 1
            fi
        fi

        SUBNET_IDS=$(aws ec2 describe-subnets --region $REGION --profile $AWS_PROFILE --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=${REGION}a,${REGION}b,${REGION}c" | jq -r '.Subnets[].SubnetId' | tr '\n' ' ')

        if [[ -z "$SUBNET_IDS" ]]; then
            echo "Subnet not found for $CLUSTER."
            exit 1
        fi

        if ! aws eks list-nodegroups --cluster-name $CLUSTER --region $REGION --profile $AWS_PROFILE | grep -q "observability"; then
            command="aws eks create-nodegroup --cluster-name $CLUSTER --region $REGION --nodegroup-name observability --node-role $NODE_ROLE --subnets $SUBNET_IDS --instance-types m5.large --disk-size 50 --scaling-config minSize=1,maxSize=10,desiredSize=1 --labels node_pool=observability --profile $AWS_PROFILE --output text"
            echo "Running $command"
            eval $command
        fi
        aws eks update-kubeconfig --name $CLUSTER --region=$REGION --profile $AWS_PROFILE

    elif [ "$PLATFORM" == "azure" ]; then
        RESOURCE_GROUP=$(echo "$cluster_json" | jq -r '.resource_group')

        if ! az aks show --name "$CLUSTER" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
            echo "AKS Cluster $CLUSTER not found in resource group $RESOURCE_GROUP."
            exit 1
        fi

        if ! az aks nodepool list --cluster-name "$CLUSTER" --resource-group "$RESOURCE_GROUP" | jq -r '.[].name' | grep -q "^observe$"; then
            az aks nodepool add \
                --cluster-name "$CLUSTER" \
                --resource-group "$RESOURCE_GROUP" \
                --name observe \
                --node-count 1 \
                --min-count 1 \
                --max-count 10 \
                --enable-cluster-autoscaler \
                --node-vm-size Standard_B2ms \
                --labels node_pool=observability
        fi

        az aks get-credentials --name "$CLUSTER" --resource-group "$RESOURCE_GROUP" --overwrite-existing

    else
        echo "Unsupported platform: $PLATFORM"
        exit 1
    fi

    # Login to ArgoCD
    argocd login $ARGOCD_SERVER --username $ARGOCD_USERNAME --password $ARGOCD_PASSWORD

    # Create observability namespace
    if ! kubectl get namespace observability &>/dev/null; then
        kubectl create namespace observability
    fi

    # Create PagerDuty secret
    if ! kubectl get secret pagerduty-service-key --namespace=observability &>/dev/null; then
        kubectl create secret generic pagerduty-service-key \
            --from-literal=api-key=$PAGERDUTY_API_KEY \
            --namespace=observability
    fi

    # Add cluster credentials to ArgoCD
    if ! argocd cluster list | grep -q "$APP_PLANE_CTX"; then
        argocd cluster add $APP_PLANE_CTX --upsert -y --server $ARGOCD_SERVER --label role=app-plane --label cloud_provider=$(echo $PLATFORM | tr '[:upper:]' '[:lower:]')
    fi

    # Wait for vmuser secret
    echo "Waiting for vmuser secret..."
    while ! kubectl get secret $CLUSTER-vmuser -n observability --context $CTRL_PLANE_CTX &>/dev/null; do
        sleep 2
        echo -n "."
    done
    echo "vmuser secret created."

    # Create vmuser secret in app cluster
    if ! kubectl get secret vmuser --namespace=observability &>/dev/null; then
        kubectl create secret generic vmuser \
            --from-literal=password=$(kubectl get secret $CLUSTER-vmuser -n observability -o jsonpath="{.data.password}" --context $CTRL_PLANE_CTX | base64 --decode) \
            --namespace=observability
    fi

    echo "Observability stack setup complete for $CLUSTER."

done

echo "Observability stack setup complete for all clusters."
