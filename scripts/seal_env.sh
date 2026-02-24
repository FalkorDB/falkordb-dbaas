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
current_dir=""
in_multiline="0"
multiline_key=""
multiline_val=""

# Parse a single key=value (or key: value) line into per-key value files.
# Values wrapped in double quotes have the surrounding quotes stripped.
# Multiline values (opening " without a closing " on the same line) are
# accumulated across subsequent lines until the closing " is found.
while IFS= read -r line || [ -n "$line" ]; do
  # Handle continuation of a multiline quoted value
  if [ "$in_multiline" = "1" ]; then
    last_char=$(printf "%s" "$line" | tail -c 1)
    if [ "$last_char" = '"' ]; then
      # Strip trailing quote, append final segment and flush
      cont=$(printf "%s" "$line" | sed 's/"$//')
      multiline_val="${multiline_val}
${cont}"
      printf '%s' "$multiline_val" > "$current_dir/$multiline_key"
      in_multiline="0"
      multiline_key=""
      multiline_val=""
    else
      multiline_val="${multiline_val}
${line}"
    fi
    continue
  fi

  # Section header: "# secret-name"
  case "$line" in
    "#"*)
      case "$line" in
        "#""---"*)
          current_name=""
          current_dir=""
          ;;
        *)
          current_name=$(printf "%s" "$line" \
            | sed -E 's/^#[[:space:]]*//; s/[[:space:]]*$//' \
            | tr '[:upper:]' '[:lower:]' \
            | sed -E 's/[[:space:]]+/-/g; s/[^a-z0-9-]//g; s/^-+//; s/-+$//')
          if [ -n "$current_name" ]; then
            current_dir="$TMP_DIR/$current_name"
            mkdir -p "$current_dir"
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
    first_char=$(printf "%s" "$val" | cut -c1)
    last_char=$(printf "%s" "$val" | tail -c 1)
    if [ "$first_char" = '"' ] && [ "$last_char" != '"' ]; then
      # Multiline quoted value: strip opening quote and start accumulating
      in_multiline="1"
      multiline_key="$key"
      multiline_val=$(printf "%s" "$val" | cut -c2-)
    else
      # Single-line value: strip surrounding double quotes if present
      if [ "$first_char" = '"' ] && [ "$last_char" = '"' ]; then
        val=$(printf "%s" "$val" | sed 's/^"//; s/"$//')
      fi
      printf '%s' "$val" > "$current_dir/$key"
    fi
  fi
done < "$ENV_FILE"

# Build and seal one secret per section directory
generated_any="0"
doc_count="0"
: > "$OUTPUT_FILE"

for secret_dir in "$TMP_DIR"/*/; do
  [ -d "$secret_dir" ] || continue

  secret_name=$(basename "$secret_dir")
  secret_yaml="$TMP_DIR/${secret_name}.yaml"

  # Build --from-file=key=path args (one per key file)
  from_file_args=""
  for key_file in "$secret_dir"*; do
    [ -f "$key_file" ] || continue
    key=$(basename "$key_file")
    from_file_args="$from_file_args --from-file=${key}=${key_file}"
  done

  [ -n "$from_file_args" ] || continue
  generated_any="1"

  # shellcheck disable=SC2086
  kubectl create secret generic "$secret_name" --dry-run=client -n "$NAMESPACE" $from_file_args -o yaml >"$secret_yaml"
  if [ "$doc_count" -gt 0 ]; then
    printf '%s\n' '---' >>"$OUTPUT_FILE"
  fi
  kubeseal --cert "$CERT_FILE" -o yaml -n "$NAMESPACE" -f "$secret_yaml" >>"$OUTPUT_FILE"
  printf '\n' >>"$OUTPUT_FILE"
  doc_count=$((doc_count + 1))
done

# Fallback: no section headers found – parse the file directly into per-key
# value files under a single default secret, then seal it.
if [ "$generated_any" = "0" ]; then
  fallback_dir="$TMP_DIR/$ENV_FILE_NAME"
  mkdir -p "$fallback_dir"
  in_multiline="0"
  multiline_key=""
  multiline_val=""

  while IFS= read -r line || [ -n "$line" ]; do
    if [ "$in_multiline" = "1" ]; then
      last_char=$(printf "%s" "$line" | tail -c 1)
      if [ "$last_char" = '"' ]; then
        cont=$(printf "%s" "$line" | sed 's/"$//')
        multiline_val="${multiline_val}
${cont}"
        printf '%s' "$multiline_val" > "$fallback_dir/$multiline_key"
        in_multiline="0"; multiline_key=""; multiline_val=""
      else
        multiline_val="${multiline_val}
${line}"
      fi
      continue
    fi

    case "$line" in "#"*) continue ;; esac
    [ -n "$(printf "%s" "$line" | tr -d '[:space:]')" ] || continue

    key=$(printf "%s" "$line" | sed -E 's/^[[:space:]]*([^:=[:space:]]+)[[:space:]]*[:=].*$/\1/')
    val=$(printf "%s" "$line" | sed -E 's/^[^:=]+[:=][[:space:]]*(.*)$/\1/')

    if [ -n "$key" ]; then
      first_char=$(printf "%s" "$val" | cut -c1)
      last_char=$(printf "%s" "$val" | tail -c 1)
      if [ "$first_char" = '"' ] && [ "$last_char" != '"' ]; then
        in_multiline="1"; multiline_key="$key"
        multiline_val=$(printf "%s" "$val" | cut -c2-)
      else
        [ "$first_char" = '"' ] && [ "$last_char" = '"' ] && \
          val=$(printf "%s" "$val" | sed 's/^"//; s/"$//')
        printf '%s' "$val" > "$fallback_dir/$key"
      fi
    fi
  done < "$ENV_FILE"

  from_file_args=""
  for key_file in "$fallback_dir"/*; do
    [ -f "$key_file" ] || continue
    key=$(basename "$key_file")
    from_file_args="$from_file_args --from-file=${key}=${key_file}"
  done

  if [ -n "$from_file_args" ]; then
    secret_yaml="$TMP_DIR/$ENV_FILE_NAME.yaml"
    # shellcheck disable=SC2086
    kubectl create secret generic "$ENV_FILE_NAME" --dry-run=client -n "$NAMESPACE" $from_file_args -o yaml >"$secret_yaml"
    kubeseal --cert "$CERT_FILE" -o yaml -n "$NAMESPACE" -f "$secret_yaml" >"$OUTPUT_FILE"
  fi
fi
