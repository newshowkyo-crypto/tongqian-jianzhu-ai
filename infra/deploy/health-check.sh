#!/usr/bin/env bash
set -euo pipefail

endpoints=(
  "http://127.0.0.1:4000/health"
  "http://127.0.0.1:3000/api/health"
  "http://127.0.0.1:3010/api/health"
  "http://127.0.0.1:3011/api/health"
  "http://127.0.0.1:3012/api/health"
  "http://127.0.0.1/healthz"
)

for url in "${endpoints[@]}"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" "$url" || echo "fail")
  echo "$url -> $code"
  [[ "$code" == "200" ]] || exit 1
done

echo "ALL HEALTHY"
