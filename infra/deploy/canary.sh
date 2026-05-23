#!/usr/bin/env bash
#
# 灰度发布脚本
#
# 重要说明：本脚本当前是“分段健康守门员 + 自动回滚”，不是真流量灰度。
#   - 每步循环都会 100% 切流量到新版本，仅在 wait_for_health 通过后进下一步。
#   - 4 步阈值（5/25/50/100）通过 CANARY_WEIGHT 导出，但 nginx.conf 未消费。
#   - 真流量灰度需要 nginx upstream 配权重 + 同时双跑 api-new/api-old 两组容器。
#
# 适用场景：
#   - 上线初期 DAU < 1000，作为“分段验证 + 失败自动回滚”使用。
#   - DAU 上量后，建议补 nginx 双 upstream + 动态 reload，参见 docs/runbook/01-vps-bootstrap.md 灰度发布演练。
#
# 环境变量：
#   TAG                     目标镜像 tag，默认 prod-latest。
#   ROLLBACK_TAG            失败回滚 tag，默认 prod-previous。
#   CANARY_STEPS            步进权重列表，默认 "5 25 50 100"。
#   HEALTH_TIMEOUT_SECONDS  每步健康等待秒数，默认 90。
#   AUTO_ROLLBACK=1         health fail 时自动切回 ROLLBACK_TAG。
#   SKIP_SSH_DEPLOY=1       本地 dry-run，不进 ACR。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.prod.yml}"
TAG="${1:-${TAG:-prod-latest}}"
ROLLBACK_TAG="${ROLLBACK_TAG:-prod-previous}"
CANARY_STEPS="${CANARY_STEPS:-5 25 50 100}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-90}"
STEP_PAUSE_SECONDS="${STEP_PAUSE_SECONDS:-5}"
AUTO_ROLLBACK="${AUTO_ROLLBACK:-0}"

cd "$ROOT_DIR"

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is required" >&2
    exit 1
  fi
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

wait_for_health() {
  local label="$1"
  local deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))

  while [ "$SECONDS" -lt "$deadline" ]; do
    local unhealthy
    unhealthy="$(compose ps --format json | grep -E 'unhealthy|starting|exited|dead' || true)"
    if [ -z "$unhealthy" ]; then
      compose ps
      echo "Canary step healthy: $label"
      return 0
    fi
    sleep 5
  done

  compose ps
  compose logs --tail 120
  echo "Canary step failed health check: $label" >&2
  return 1
}

rollback_if_enabled() {
  if [ "$AUTO_ROLLBACK" != "1" ]; then
    return
  fi

  echo "Attempting rollback to tag: $ROLLBACK_TAG" >&2
  export TAG="$ROLLBACK_TAG"
  if [ "${SKIP_PULL:-0}" != "1" ]; then
    compose pull || true
  fi
  compose up -d
  wait_for_health "rollback-$ROLLBACK_TAG" || true
}

require_docker

echo "Starting canary deployment: $TAG"
export TAG

if [ "${SKIP_SSH_DEPLOY:-0}" = "1" ]; then
  start_epoch="$(date +%s)"
  echo "SKIP_SSH_DEPLOY=1: running local docker compose deployment only"
  if [ "${SKIP_PULL:-1}" != "1" ]; then
    compose pull
  fi
  compose up -d
  wait_for_health "local-${TAG}"
  end_epoch="$(date +%s)"
  duration=$((end_epoch - start_epoch))
  printf 'tag=%s duration_seconds=%s completed_at=%s\n' "$TAG" "$duration" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > infra/deploy/local-deploy-duration.log
  echo "Local deployment complete in ${duration}s"
  exit 0
fi

if [ -n "${ACR_USERNAME:-}" ] && [ -n "${ACR_PASSWORD:-}" ] && [ -n "${ACR_LOGIN_REGISTRY:-}" ]; then
  echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_REGISTRY" -u "$ACR_USERNAME" --password-stdin
fi

if [ "${SKIP_PULL:-0}" != "1" ]; then
  compose pull
fi

for weight in $CANARY_STEPS; do
  export CANARY_WEIGHT="$weight"
  echo "Applying canary weight: ${CANARY_WEIGHT}%"
  compose up -d

  if ! wait_for_health "${TAG}-${CANARY_WEIGHT}"; then
    rollback_if_enabled
    exit 1
  fi

  if [ "$CANARY_WEIGHT" != "100" ]; then
    sleep "$STEP_PAUSE_SECONDS"
  fi
done

echo "Canary deployment complete: $TAG"
