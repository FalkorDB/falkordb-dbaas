#!/bin/bash

# Default values
PROJECT_ID=""
DRY_RUN=false
LIMIT=0
NODE_POOL_NAME="observability"

usage() {
    echo "Usage: $0 -p <project_id> [-d] [-l <limit>]"
    echo "  -p : Google Cloud Project ID"
    echo "  -d : Dry run (no changes applied)"
    echo "  -l : Limit the number of clusters to process"
    exit 1
}

while getopts "p:dl:" opt; do
    case $opt in
        p) PROJECT_ID="$OPTARG" ;;
        d) DRY_RUN=true ;;
        l) LIMIT="$OPTARG" ;;
        *) usage ;;
    esac
done

if [[ -z "$PROJECT_ID" ]]; then usage; fi

echo "--- Starting GKE Node Pool Upgrade (Sync to Master Version) ---"

# Get all clusters (Name, Location, and Current Master Version)
clusters=$(gcloud container clusters list --project="$PROJECT_ID" --format="value(name,location,currentMasterVersion)")

if [[ -z "$clusters" ]]; then
    echo "No clusters found in project $PROJECT_ID."
    exit 0
fi

count=0

while read -r line; do
    if [[ "$LIMIT" -gt 0 && "$count" -ge "$LIMIT" ]]; then break; fi

    cluster_name=$(echo "$line" | awk '{print $1}')
    location=$(echo "$line" | awk '{print $2}')
    master_version=$(echo "$line" | awk '{print $3}')

    # Verify if the node pool exists
    pool_check=$(gcloud container node-pools list --cluster="$cluster_name" --location="$location" --project="$PROJECT_ID" --format="value(name)" --filter="name=$NODE_POOL_NAME")

    if [[ "$pool_check" == "$NODE_POOL_NAME" ]]; then
        echo "Found '$NODE_POOL_NAME' in $cluster_name"
        echo "  -> Target Version (Master): $master_version"
        
        if [[ "$DRY_RUN" == true ]]; then
            echo "  [DRY RUN] Executing: gcloud container clusters upgrade $cluster_name --node-pool=$NODE_POOL_NAME --cluster-version=$master_version"
        else
            echo "  [!] Syncing node pool to version $master_version..."
            gcloud container clusters upgrade "$cluster_name" \
                --project="$PROJECT_ID" \
                --location="$location" \
                --node-pool="$NODE_POOL_NAME" \
                --cluster-version="$master_version" \
                --quiet
        fi
        ((count++))
    else
        echo "Skipping $cluster_name (pool '$NODE_POOL_NAME' not found)"
    fi
done <<< "$clusters"

echo "-----------------------------------------------"
echo "Done. Processed $count clusters."