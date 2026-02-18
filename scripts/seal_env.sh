#!/bin/sh

ENV_FILE=$1
NAMESPACE=${2:-'api'}
CERT_FILE=${3:-'./certs/observability/sealed-secrets/dev/pub-cert.pem'}

if [ -z "$ENV_FILE" ] || [ -z "$NAMESPACE" ] || [ -z "$CERT_FILE" ]; then
  echo "Usage: $0 <env_file> [namespace] [cert_file]"
  exit 1
fi

ENV_FILE_DIR=$(dirname "$ENV_FILE")
ENV_FILE_BASENAME=$(basename "$ENV_FILE")
ENV_FILE_NAME=$(printf "%s" "$ENV_FILE_BASENAME" | sed 's/\./-/g')
OUTPUT_FILE="$ENV_FILE_DIR/$ENV_FILE_NAME-secret.yaml"
TMP_DIR=$(mktemp -d)

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

current_name=""
current_file=""

while IFS= read -r line || [ -n "$line" ]; do
  # Section header: "# secret-name"
  case "$line" in
    "#"*)
      case "$line" in
        "#""---"*)
          current_name=""
          current_file=""
          ;;
        *)
          current_name=$(printf "%s" "$line" \
            | sed -E 's/^#[[:space:]]*//; s/[[:space:]]*$//' \
            | tr '[:upper:]' '[:lower:]' \
            | sed -E 's/[[:space:]]+/-/g; s/[^a-z0-9-]//g; s/^-+//; s/-+$//')
          if [ -n "$current_name" ]; then
            current_file="$TMP_DIR/$current_name.env"
            : > "$current_file"
          fi
          ;;
      esac
      continue
      ;;
  esac

  # Skip empty lines
  if [ -z "$(printf "%s" "$line" | tr -d '[:space:]')" ]; then
    continue
  fi

  # Only process key-values when a section header is set
  if [ -z "$current_name" ]; then
    continue
  fi

  # Support both "key=value" and "key: value" formats
  key=$(printf "%s" "$line" | sed -E 's/^[[:space:]]*([^:=[:space:]]+)[[:space:]]*[:=].*$/\1/')
  val=$(printf "%s" "$line" | sed -E 's/^[^:=]+[:=][[:space:]]*(.*)$/\1/')

  if [ -n "$key" ]; then
    printf '%s=%s\n' "$key" "$val" >> "$current_file"
  fi
done < "$ENV_FILE"

generated_any="0"
doc_count="0"
: > "$OUTPUT_FILE"

for secret_env in "$TMP_DIR"/*.env; do
  if [ ! -f "$secret_env" ]; then
    continue
  fi

  generated_any="1"
  secret_name=$(basename "$secret_env" .env)
  secret_yaml="$TMP_DIR/$secret_name.yaml"

  kubectl create secret generic "$secret_name" --dry-run=client -n "$NAMESPACE" --from-env-file="$secret_env" -o yaml >"$secret_yaml"
  if [ "$doc_count" -gt 0 ]; then
    printf '%s\n' '---' >>"$OUTPUT_FILE"
  fi
  kubeseal --cert "$CERT_FILE" -o yaml -n "$NAMESPACE" -f "$secret_yaml" >>"$OUTPUT_FILE"
  printf '\n' >>"$OUTPUT_FILE"
  doc_count=$((doc_count + 1))
done

# Fallback: if no sections were found, behave like the original script
if [ "$generated_any" = "0" ]; then
  secret_yaml="$TMP_DIR/$ENV_FILE_NAME.yaml"

  kubectl create secret generic "$ENV_FILE_NAME" --dry-run=client -n "$NAMESPACE" --from-env-file="$ENV_FILE" -o yaml >"$secret_yaml"
  kubeseal --cert "$CERT_FILE" -o yaml -n "$NAMESPACE" -f "$secret_yaml" >"$OUTPUT_FILE"
fi
