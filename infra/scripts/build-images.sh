#!/usr/bin/env bash
set -euo pipefail

TAG=${1:-prod-latest}
REGISTRY=${ACR_REGISTRY:-registry.cn-hangzhou.aliyuncs.com/tongqian}

docker build -f infra/docker/Dockerfile.api -t "$REGISTRY/api:$TAG" .
docker build -f infra/docker/Dockerfile.worker -t "$REGISTRY/worker:$TAG" .
docker build -f infra/docker/Dockerfile.migrate -t "$REGISTRY/migrate:$TAG" .

for svc in web admin agent gov; do
  docker build \
    -f infra/docker/Dockerfile.next \
    -t "$REGISTRY/$svc:$TAG" \
    --build-arg APP_NAME="$svc" \
    .
done

docker build -f infra/docker/Dockerfile.nginx -t "$REGISTRY/nginx:$TAG" .
