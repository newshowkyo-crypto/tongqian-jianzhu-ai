#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"
TAG="${1:-${TAG:-prod-latest}}"
SCHEMA_SYNC="${SCHEMA_SYNC:-0}"

cd "$ROOT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  cp .env.example "$ENV_FILE"
fi

ENV_FILE="$ENV_FILE" bash infra/deploy/ensure-env.sh

compose() {
  TAG="$TAG" docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

if [ -n "${ACR_USERNAME:-}" ] && [ -n "${ACR_PASSWORD:-}" ] && [ -n "${ACR_REGISTRY:-}" ]; then
  echo "$ACR_PASSWORD" | docker login --username "$ACR_USERNAME" --password-stdin "$ACR_REGISTRY"
fi

for svc in api worker migrate web admin agent gov nginx; do
  docker tag "${ACR_REGISTRY:-registry.cn-hangzhou.aliyuncs.com/tongqian}/$svc:prod-latest" \
    "${ACR_REGISTRY:-registry.cn-hangzhou.aliyuncs.com/tongqian}/$svc:prod-previous" 2>/dev/null || true
done

if [ -n "$(compose ps --status running -q postgres 2>/dev/null || true)" ]; then
  COMPOSE_FILE="$COMPOSE_FILE" ENV_FILE="$ENV_FILE" bash infra/deploy/backup.sh
fi

compose pull
compose up -d postgres redis
compose run --rm migrate pnpm --dir prisma prisma migrate deploy

if [ "$SCHEMA_SYNC" = "1" ]; then
  echo "SCHEMA_SYNC=1: running prisma db push after backup. Use only for initial deploy or controlled schema-drift recovery."
  compose run --rm migrate pnpm --dir prisma prisma db push --accept-data-loss
fi

compose up -d

for i in {1..30}; do
  unhealthy="$(compose ps --format json | jq -r 'select(.Health != "healthy" and .Health != "") | .Name' || true)"
  [ -z "$unhealthy" ] && break
  echo "Waiting for healthy services ($i/30): $unhealthy"
  sleep 10
done

bash infra/deploy/health-check.sh
echo "$(date -Iseconds) deploy $TAG ok" >> "$ROOT_DIR/deploy.log"
