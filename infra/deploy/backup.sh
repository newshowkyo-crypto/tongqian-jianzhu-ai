#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-tongqian_prod}"
BACKUP_DIR="${BACKUP_DIR:-./data/backup}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
OSS_TARGET="${OSS_TARGET:-}"

cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

timestamp="$(date +%Y%m%d-%H%M%S)"
backup_file="$BACKUP_DIR/pg-$timestamp.sql.gz"

echo "Creating PostgreSQL backup: $backup_file"
docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip >"$backup_file"

gzip -t "$backup_file"
echo "Backup verified: $backup_file"

if [ -n "$OSS_TARGET" ]; then
  if ! command -v ossutil >/dev/null 2>&1; then
    echo "OSS_TARGET is set but ossutil is not installed" >&2
    exit 1
  fi
  ossutil cp "$backup_file" "$OSS_TARGET/"
  echo "Backup uploaded to OSS: $OSS_TARGET"
else
  echo "OSS_TARGET not set; kept local backup only."
fi

find "$BACKUP_DIR" -name "pg-*.sql.gz" -type f -mtime "+$RETENTION_DAYS" -delete
echo "Backup retention applied: ${RETENTION_DAYS} days"
