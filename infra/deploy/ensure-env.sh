#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"

touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

has_key() {
  local key="$1"
  grep -Eq "^${key}=" "$ENV_FILE"
}

random_hex() {
  local bytes="$1"

  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "$bytes"
    return
  fi

  tr -dc 'A-Za-z0-9' </dev/urandom | head -c $((bytes * 2))
}

append_secret_if_missing() {
  local key="$1"
  local bytes="$2"

  if has_key "$key"; then
    return
  fi

  printf '%s=%s\n' "$key" "$(random_hex "$bytes")" >>"$ENV_FILE"
  echo "Generated missing runtime key: $key"
}

append_secret_if_missing POSTGRES_PASSWORD 24
append_secret_if_missing REDIS_PASSWORD 24

echo "Runtime env ready: $ENV_FILE"
