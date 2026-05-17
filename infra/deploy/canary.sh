#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
TAG="${1:-${TAG:-prod-latest}}"
ROLLBACK_TAG="${ROLLBACK_TAG:-prod-previous}"
CANARY_STEPS="${CANARY_STEPS:-5 25 50 100}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-90}"
STEP_PAUSE_SECONDS="${STEP_PAUSE_SECONDS:-5}"
AUTO_ROLLBACK="${AUTO_ROLLBACK:-0}"

cd "$ROOT_DIR"

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is required" >&2
    exit 1
  fi
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

wait_for_health() {
  local label="$1"
  local deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))

  while [ "$SECONDS" -lt "$deadline" ]; do
    local unhealthy
    unhealthy="$(compose ps --format json | grep -E 'unhealthy|starting|exited|dead' || true)"
    if [ -z "$unhealthy" ]; then
      compose ps
      echo "Canary step healthy: $label"
      return 0
    fi
    sleep 5
  done

  compose ps
  compose logs --tail 120
  echo "Canary step failed health check: $label" >&2
  return 1
}

rollback_if_enabled() {
  if [ "$AUTO_ROLLBACK" != "1" ]; then
    return
  fi

  echo "Attempting rollback to tag: $ROLLBACK_TAG" >&2
  export TAG="$ROLLBACK_TAG"
  if [ "${SKIP_PULL:-0}" != "1" ]; then
    compose pull || true
  fi
  compose up -d
  wait_for_health "rollback-$ROLLBACK_TAG" || true
}

require_docker

echo "Starting canary deployment: $TAG"
export TAG

if [ -n "${ACR_USERNAME:-}" ] && [ -n "${ACR_PASSWORD:-}" ] && [ -n "${ACR_LOGIN_REGISTRY:-}" ]; then
  echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_REGISTRY" -u "$ACR_USERNAME" --password-stdin
fi

if [ "${SKIP_PULL:-0}" != "1" ]; then
  compose pull
fi

for weight in $CANARY_STEPS; do
  export CANARY_WEIGHT="$weight"
  echo "Applying canary weight: ${CANARY_WEIGHT}%"
  compose up -d

  if ! wait_for_health "${TAG}-${CANARY_WEIGHT}"; then
    rollback_if_enabled
    exit 1
  fi

  if [ "$CANARY_WEIGHT" != "100" ]; then
    sleep "$STEP_PAUSE_SECONDS"
  fi
done

echo "Canary deployment complete: $TAG"
