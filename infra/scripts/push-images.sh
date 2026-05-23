#!/usr/bin/env bash
set -euo pipefail

TAG=${1:-prod-latest}
REGISTRY=${ACR_REGISTRY:-registry.cn-hangzhou.aliyuncs.com/tongqian}

echo "$ACR_PASSWORD" | docker login --username "$ACR_USERNAME" --password-stdin "$REGISTRY"

for svc in api worker web admin agent gov nginx; do
  docker push "$REGISTRY/$svc:$TAG"
done
