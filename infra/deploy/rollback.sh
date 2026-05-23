#!/usr/bin/env bash
set -euo pipefail

cd /opt/tongqian
TAG=prod-previous docker compose -f infra/docker-compose.prod.yml up -d
bash infra/deploy/health-check.sh
echo "$(date -Iseconds) rollback to prod-previous" >> /opt/tongqian/deploy.log
