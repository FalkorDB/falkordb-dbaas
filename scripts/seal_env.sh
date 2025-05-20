#!/bin/sh

ENV_FILE=$1
NAMESPACE=${2:-'api'}
CERT_FILE=${3:-'./certs/observability/sealed-secrets/dev/pub-cert.pem'}
if [ -z "$CERT_FILE" ] || [ -z "$ENV_FILE" ] || [ -z "$NAMESPACE" ]; then
  echo "Usage: $0 <cert_file> <namespace> <env_file>"
  exit 1
fi

ENV_FILE_NAME=$(basename "$ENV_FILE" | sed 's/\./-/g')
ENV_FILE_DIR=$(dirname "$ENV_FILE")

kubectl create secret generic $ENV_FILE_NAME --dry-run=client -n $NAMESPACE --from-env-file=$ENV_FILE -o yaml >"$ENV_FILE_DIR/$ENV_FILE_NAME.yaml"

kubeseal --cert $CERT_FILE -o yaml -n $NAMESPACE -f "$ENV_FILE_DIR/$ENV_FILE_NAME.yaml" -w "$ENV_FILE_DIR/$ENV_FILE_NAME-secret.yaml"

rm "$ENV_FILE_DIR/$ENV_FILE_NAME.yaml"
