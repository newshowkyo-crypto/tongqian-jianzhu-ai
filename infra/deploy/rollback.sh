#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
TAG="${1:-${ROLLBACK_TAG:-prod-previous}}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-90}"

cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

echo "Rolling back to tag: $TAG"
export TAG

if [ -n "${ACR_USERNAME:-}" ] && [ -n "${ACR_PASSWORD:-}" ] && [ -n "${ACR_LOGIN_REGISTRY:-}" ]; then
  echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_REGISTRY" -u "$ACR_USERNAME" --password-stdin
fi

if [ "${SKIP_PULL:-0}" != "1" ]; then
  docker compose -f "$COMPOSE_FILE" pull
fi
docker compose -f "$COMPOSE_FILE" up -d

deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))
while [ "$SECONDS" -lt "$deadline" ]; do
  unhealthy="$(docker compose -f "$COMPOSE_FILE" ps --format json | grep -E 'unhealthy|starting|exited|dead' || true)"
  if [ -z "$unhealthy" ]; then
    docker compose -f "$COMPOSE_FILE" ps
    echo "Rollback healthy: $TAG"
    exit 0
  fi
  sleep 5
done

docker compose -f "$COMPOSE_FILE" ps
docker compose -f "$COMPOSE_FILE" logs --tail 120
echo "Rollback failed health check: $TAG" >&2
exit 1
