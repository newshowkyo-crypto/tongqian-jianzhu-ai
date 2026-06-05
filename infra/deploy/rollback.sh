#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"

cd "$ROOT_DIR"

TAG=prod-previous docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
bash infra/deploy/health-check.sh
echo "$(date -Iseconds) rollback to prod-previous" >> "$ROOT_DIR/deploy.log"
