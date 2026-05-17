#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-tongqian_prod}"
BACKUP_DIR="${BACKUP_DIR:-./data/backup}"
RESTORE_CONFIRM="${RESTORE_CONFIRM:-}"

cd "$ROOT_DIR"

usage() {
  echo "Usage: RESTORE_CONFIRM=YES $0 <backup-file-or-oss-uri>" >&2
}

if [ $# -ne 1 ]; then
  usage
  exit 1
fi

if [ "$RESTORE_CONFIRM" != "YES" ]; then
  echo "Refusing to restore without RESTORE_CONFIRM=YES" >&2
  exit 1
fi

case "$POSTGRES_DB" in
  *[!a-zA-Z0-9_]* | "")
    echo "POSTGRES_DB must contain only letters, numbers, and underscore" >&2
    exit 1
    ;;
esac

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

source_ref="$1"
restore_file="$source_ref"

if [[ "$source_ref" == oss://* ]]; then
  if ! command -v ossutil >/dev/null 2>&1; then
    echo "ossutil is required to restore from OSS" >&2
    exit 1
  fi
  mkdir -p "$BACKUP_DIR"
  restore_file="$BACKUP_DIR/$(basename "$source_ref")"
  ossutil cp "$source_ref" "$restore_file"
fi

if [ ! -f "$restore_file" ]; then
  echo "Backup file not found: $restore_file" >&2
  exit 1
fi

gzip -t "$restore_file"
echo "Restoring database $POSTGRES_DB from $restore_file"

docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d postgres \
  -v ON_ERROR_STOP=1 \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
  -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" \
  -c "CREATE DATABASE $POSTGRES_DB;"

gunzip -c "$restore_file" | docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1

docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -tAc "SELECT 1;" >/dev/null

echo "Restore completed: $POSTGRES_DB"
