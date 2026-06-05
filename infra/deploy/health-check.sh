#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"
TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-180}"

cd "$ROOT_DIR"

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

deadline=$((SECONDS + TIMEOUT_SECONDS))
while [ "$SECONDS" -lt "$deadline" ]; do
  unhealthy="$(compose ps --format json | jq -r 'select((.Health != "" and .Health != "healthy") or (.State != "running" and .State != "exited")) | .Name + ":" + .State + ":" + .Health' || true)"
  if [ -z "$unhealthy" ]; then
    compose ps
    echo "ALL HEALTHY"
    exit 0
  fi

  echo "Waiting for healthy services:"
  echo "$unhealthy"
  sleep 5
done

compose ps
compose logs --tail 120
echo "Health check timed out after ${TIMEOUT_SECONDS}s" >&2
exit 1
