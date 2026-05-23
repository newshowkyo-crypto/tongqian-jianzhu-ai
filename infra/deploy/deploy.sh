#!/usr/bin/env bash
set -euo pipefail

TAG=${1:-prod-latest}
cd /opt/tongqian

echo "$ACR_PASSWORD" | docker login --username "$ACR_USERNAME" --password-stdin "$ACR_REGISTRY"

for svc in api worker web admin agent gov nginx; do
  docker tag "$ACR_REGISTRY/$svc:prod-latest" "$ACR_REGISTRY/$svc:prod-previous" 2>/dev/null || true
done

TAG="$TAG" docker compose -f infra/docker-compose.prod.yml pull
TAG="$TAG" docker compose -f infra/docker-compose.prod.yml up -d

for i in {1..30}; do
  unhealthy=$(docker compose -f infra/docker-compose.prod.yml ps --format json | jq -r 'select(.Health != "healthy" and .Health != "") | .Name' || true)
  [[ -z "$unhealthy" ]] && break
  echo "等待 healthy ($i/30): $unhealthy"
  sleep 10
done

bash infra/deploy/health-check.sh
echo "$(date -Iseconds) deploy $TAG ok" >> /opt/tongqian/deploy.log
