#!/bin/bash

# Default values
PROFILE="default"
DRY_RUN=false
LIMIT=0
NODE_POOL_NAME="observability"

usage() {
    echo "Usage: $0 [-p <profile>] [-d] [-l <limit>]"
    echo "  -p : AWS Profile name (default: 'default')"
    echo "  -d : Dry run (no changes applied)"
    echo "  -l : Limit total number of clusters to process"
    exit 1
}

# Parse flags
while getopts "p:dl:" opt; do
    case $opt in
        p) PROFILE="$OPTARG" ;;
        d) DRY_RUN=true ;;
        l) LIMIT="$OPTARG" ;;
        *) usage ;;
    esac
done

echo "--- EKS Nodegroup AMI/Version Upgrade (Profile: $PROFILE) ---"

# 1. Get all enabled regions
# Using 'command' to bypass any shell aliases/wrappers
regions=$(command aws ec2 describe-regions \
    --profile "$PROFILE" \
    --query "Regions[?OptInStatus!='not-opted-in'].RegionName" \
    --output text 2>/dev/null)

if [[ -z "$regions" ]]; then
    echo "ERROR: Could not retrieve regions. Verify profile '$PROFILE'."
    exit 1
fi

count=0

for region in $regions; do
    echo ">> Checking region: $region"

    # 2. List clusters in the region
    clusters=$(command aws eks list-clusters \
        --profile "$PROFILE" \
        --region "$region" \
        --query "clusters" \
        --output text 2>/dev/null)

    if [[ -z "$clusters" || "$clusters" == "None" ]]; then
        echo "  No clusters found in region '$region'. Skipping."
        continue
    fi

    for cluster_name in $clusters; do
        if [[ "$LIMIT" -gt 0 && "$count" -ge "$LIMIT" ]]; then
            echo "--- Limit reached ($LIMIT). Stopping. ---"
            break 2
        fi

        # 3. Check if the specific Managed Nodegroup exists
        nodegroup=$(command aws eks list-nodegroups \
            --profile "$PROFILE" \
            --cluster-name "$cluster_name" \
            --region "$region" \
            --query "nodegroups[?@=='$NODE_POOL_NAME']" \
            --output text 2>/dev/null)

        if [[ "$nodegroup" == "$NODE_POOL_NAME" ]]; then
            # Get Current Version Info for logging
            current_ver=$(command aws eks describe-nodegroup \
                --profile "$PROFILE" \
                --cluster-name "$cluster_name" \
                --nodegroup-name "$NODE_POOL_NAME" \
                --region "$region" \
                --query "nodegroup.[version,releaseVersion]" \
                --output text 2>/dev/null)

            echo "  [FOUND] Cluster: $cluster_name"
            echo "          Current: $current_ver"

            if [[ "$DRY_RUN" == true ]]; then
                echo "  [DRY RUN] Would trigger AMI update for '$NODE_POOL_NAME'"
            else
                echo "  [!] Triggering rolling update..."
                
                # We OMIT --version to force EKS to pick the latest AMI 
                # available for the current Kubernetes version.
                command aws eks update-nodegroup-version \
                    --force \
                    --profile "$PROFILE" \
                    --cluster-name "$cluster_name" \
                    --nodegroup-name "$NODE_POOL_NAME" \
                    --region "$region" > /dev/null 2>&1

                if [[ $? -eq 0 ]]; then
                    echo "  [✓] Update initiated successfully."
                else
                    # Usually means no update is needed or one is already in progress
                    echo "  [-] Update not required or already in progress."
                fi
            fi
            ((count++))
        else 
            echo "  Cluster '$cluster_name' does not have nodegroup '$NODE_POOL_NAME'. Skipping."
        fi
    done
done

echo "--- Finished. Total clusters processed: $count ---"