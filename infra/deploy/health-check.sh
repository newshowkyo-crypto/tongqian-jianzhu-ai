#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-90}"
CHECK_INTERVAL_SECONDS="${CHECK_INTERVAL_SECONDS:-5}"
HTTP_CHECKS="${HTTP_CHECKS:-}"

cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

http_get() {
  local url="$1"

  if command -v curl >/dev/null 2>&1; then
    curl --fail --silent --show-error --max-time 10 "$url" >/dev/null
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -qO- "$url" >/dev/null
    return
  fi

  echo "curl or wget is required for HTTP checks" >&2
  return 1
}

compose_health_ready() {
  local unhealthy
  unhealthy="$(docker compose -f "$COMPOSE_FILE" ps --format json | grep -E 'unhealthy|starting|exited|dead' || true)"
  [ -z "$unhealthy" ]
}

deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))
while [ "$SECONDS" -lt "$deadline" ]; do
  if compose_health_ready; then
    docker compose -f "$COMPOSE_FILE" ps
    break
  fi
  sleep "$CHECK_INTERVAL_SECONDS"
done

if ! compose_health_ready; then
  docker compose -f "$COMPOSE_FILE" ps
  docker compose -f "$COMPOSE_FILE" logs --tail 120
  echo "Compose health check failed" >&2
  exit 1
fi

for url in $HTTP_CHECKS; do
  echo "Checking URL: $url"
  http_get "$url"
done

echo "Health check OK"
