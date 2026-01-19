#!/bin/bash

# Default values
current_context=$(kubectl config current-context)
namespace="default"
aof_enabled="false"
kubernetes_context="$current_context"
pod_name="node-f-0"
rdb_path="/data/dump.rdb"
aof_path="/data/appendonlydir.tar.gz"

while getopts "n:a:c:p:" opt; do
  case $opt in
    n) namespace="$OPTARG" ;;
    a) aof_enabled="$OPTARG" ;;
    c) kubernetes_context="$OPTARG" ;;
    p) pod_name="$OPTARG" ;;
    *) echo "Usage: $0 [-n namespace] [-a aof_enabled] [-c kubernetes_context] [-p pod_name]" >&2
       exit 1 ;;
  esac
done

shift $((OPTIND-1))

if [[ ! ${aof_enabled} =~ ^(true|True|TRUE|false|False|FALSE)$ ]]; then
  echo "Error: aof_enabled must be 'true' or 'false'."
  exit 1
fi

echo "Using namespace: $namespace"
echo "AOF Enabled: $aof_enabled"
echo "Kubernetes Context: $kubernetes_context"
echo "Pod Name: $pod_name"


put_urls() {
    local namespace=$1
    local rdb_put_url=$(gcloud storage sign-url gs://falkordb_rdbs_test_eu/${namespace}/dump.rdb \
        --duration 1h \
        --impersonate-service-account falkordb-rdb-storage-reader@pipelines-development-f7a2434f.iam.gserviceaccount.com \
        --region eu \
        --http-verb=PUT)
    if [[ ${aof_enabled} =~ ^(true|True|TRUE)$ ]]; then
        local aof_put_url=$(gcloud storage sign-url gs://falkordb_aofs_test_eu/${namespace}/appendonlydir.tar.gz \
        --duration 1h \
        --impersonate-service-account falkordb-rdb-storage-reader@pipelines-development-f7a2434f.iam.gserviceaccount.com \
        --region eu \
        --http-verb=PUT)
    fi
    echo "$rdb_put_url" | grep signed_url | awk '{print $2}'
    if [[ ${aof_enabled} =~ ^(true|True|TRUE)$ ]]; then
        echo "$aof_put_url" | grep signed_url | awk '{print $2}'
    fi
}

upload_to_gcp(){
    local rdb=$1
    local aof=$2
    local rdb_put_url=$3
    local aof_put_url=$4
    kubectl exec -it -n "$namespace" --context "$kubernetes_context" "$pod_name" -- \
    curl -X PUT \
    -H "Content-Type: application/octet-stream" \
    --upload-file "$rdb" \
    "$rdb_put_url" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
      echo "Failed to upload RDB file to GCP."
      exit 1
    fi
    echo "RDB file uploaded successfully to GCP."
    if [ "$aof_enabled" = true ]; then
      kubectl exec -it -n "$namespace" --context "$kubernetes_context" "$pod_name" -- \
      tar -czvf /data/appendonlydir.tar.gz -C /data/appendonlydir .
      
      kubectl exec -it -n "$namespace" --context "$kubernetes_context" "$pod_name" -- \
      curl -X PUT \
      -H "Content-Type: application/octet-stream" \
      --upload-file "$aof" \
      "$aof_put_url" > /dev/null 2>&1
      
      if [ $? -ne 0 ]; then
        echo "Failed to upload AOF file to GCP."
        exit 1
      fi
      echo "AOF file uploaded successfully to GCP."
    fi
}

return_download_url(){
    local rdb_download_url=$(gcloud storage sign-url gs://falkordb_rdbs_test_eu/${namespace}/dump.rdb \
        --duration 12h \
        --impersonate-service-account falkordb-rdb-storage-reader@pipelines-development-f7a2434f.iam.gserviceaccount.com \
        --region eu)
    echo "RDB Download URL: $(echo "$rdb_download_url" | grep signed_url | awk '{print $2}')"
    
    if [ "$aof_enabled" = true ]; then
      local aof_download_url=$(gcloud storage sign-url gs://falkordb_rdbs_test_eu/${namespace}/appendonlydir.tar.gz \
        --duration 12h \
        --impersonate-service-account falkordb-rdb-storage-reader@pipelines-development-f7a2434f.iam.gserviceaccount.com \
        --region eu)
      echo "AOF Download URL: $(echo "$aof_download_url" | grep signed_url | awk '{print $2}')"
    fi
}

if [ "$aof_enabled" = true ]; then
  urls=$(put_urls "$namespace")
  rdb_put_url=$(echo "$urls" | awk 'NR==1{print $0}')
  aof_put_url=$(echo "$urls" | awk 'NR==2{print $0}')
  upload_to_gcp "$rdb_path" "$aof_path" "$rdb_put_url" "$aof_put_url"
else
  rdb_put_url=$(put_urls "$namespace")
  upload_to_gcp "$rdb_path" "" "$rdb_put_url" ""
fi

return_download_url
