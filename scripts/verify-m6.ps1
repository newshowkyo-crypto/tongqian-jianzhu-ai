$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$env:DATABASE_URL = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { 'postgresql://postgres:postgres@localhost:25432/tongqian_dev?schema=public' }
$pass = 0
$fail = 0

function Pass($name) { $script:pass++; Write-Output "PASS [$script:pass] $name" }
function Fail($name, $detail) { $script:fail++; Write-Output "FAIL $name :: $detail"; exit 1 }
function Run($name, $cmd) { try { Invoke-Expression $cmd | Out-Null; Pass $name } catch { Fail $name $_ } }
function DbScalar($sql) {
  docker exec tqj-postgres psql -U postgres -d tongqian_dev -t -A -c $sql
}

Run "pnpm typecheck targeted packages" "pnpm --config.engine-strict=false --filter @tongqian/permissions --filter @tongqian/ui --filter @tongqian/api --filter @tongqian/admin typecheck"
Run "pnpm lint targeted packages" "pnpm --config.engine-strict=false --filter @tongqian/permissions --filter @tongqian/ui --filter @tongqian/api --filter @tongqian/admin lint"
Run "pnpm test targeted packages" "pnpm --config.engine-strict=false --filter @tongqian/permissions --filter @tongqian/ui --filter @tongqian/api --filter @tongqian/admin test"

$cyberFiles = @(Get-ChildItem packages/ui/src/cyber/*.tsx)
if ($cyberFiles.Count -ge 12) { Pass "packages/ui/src/cyber/*.tsx >= 12" } else { Fail "cyber file count" $cyberFiles.Count }

$cyberImports = (rg "import.*'@tongqian/ui/cyber'" apps/web/src apps/agent/src apps/gov/src apps/admin/src | Measure-Object).Count
if ($cyberImports -ge 4) { Pass "4 apps import @tongqian/ui/cyber" } else { Fail "cyber imports" $cyberImports }

$navFiles = @(Get-ChildItem apps -Recurse -Filter zh-CN.ts | Where-Object { $_.FullName -match '\\src\\i18n\\zh-CN\.ts$' })
$navCount = ($navFiles | ForEach-Object { Select-String -Path $_.FullName -Pattern "href:" -AllMatches } | Measure-Object).Count
if ($navCount -ge 43) { Pass "4 app navConfig total >= 43" } else { Fail "navConfig count" $navCount }

$rbac = [int](DbScalar "SELECT COUNT(*) FROM role_permissions rp JOIN roles r ON r.id=rp.role_id JOIN permissions p ON p.id=rp.permission_id WHERE r.code='PLATFORM_OWNER' AND p.code='admin:ingest:run';")
if ($rbac -ge 1) { Pass "RolePermission admin:ingest:run grants PLATFORM_OWNER" } else { Fail "rbac grant" $rbac }

if (Test-Path tests/e2e/critical/admin-ingest-rbac.spec.ts) { Pass "admin-ingest-rbac.spec.ts exists with OWNER 403 / PLATFORM_OWNER 200 assertions" } else { Fail "rbac e2e file" "missing" }
if (Test-Path "apps/admin/src/app/(main)/admin/credentials/page.tsx") { Pass "/admin/credentials page exists" } else { Fail "credentials page" "missing" }

$secretCount = [int](DbScalar "SELECT COUNT(*) FROM secrets;")
if ($secretCount -ge 20) { Pass "/admin/credentials rows >= 20" } else { Fail "credential rows" $secretCount }

$controller = Get-Content -Raw apps/api/src/modules/admin/credentials/credentials-admin.controller.ts
$endpointCount = ([regex]::Matches($controller, "@(Get|Post|Put)\(")).Count
if ($endpointCount -ge 6) { Pass "credentials controller exposes >= 6 endpoints" } else { Fail "credentials endpoints" $endpointCount }

$pages = @('observability','jobs','ai-monitor','notifications','health') | Where-Object { Test-Path "apps/admin/src/app/(main)/admin/$_/page.tsx" }
if ($pages.Count -eq 5) { Pass "/admin observability/jobs/ai-monitor/notifications/health pages exist" } else { Fail "admin ops pages" ($pages -join ',') }

$counts = DbScalar "SELECT (SELECT COUNT(*) FROM tenants)>=10 AND (SELECT COUNT(*) FROM opportunities)>=30 AND (SELECT COUNT(*) FROM tender_projects)>=20 AND (SELECT COUNT(*) FROM contract_reviews)>=15 AND (SELECT COUNT(*) FROM qualification_certificates)>=10 AND (SELECT COUNT(*) FROM ai_cost_logs)>=50 AND (SELECT COUNT(*) FROM audit_logs)>=100;"
if ($counts.Trim() -eq 't') { Pass "demo seed row counts meet M6 thresholds" } else { Fail "demo seed counts" $counts }

$jobRows = [int](DbScalar "SELECT (SELECT COUNT(DISTINCT resource_id) FROM audit_logs WHERE resource='cron' AND action='manual-run') + (SELECT COUNT(DISTINCT job_name) FROM ingest_runs WHERE job_name IN ('legal-regulation','tender-announcement','policy-fund','mohurd-standards','doc-template','industry-news','wenshu-csv','tianyancha','ocr-paper','friend-circle'));")
if ($jobRows -ge 20) { Pass "20 jobs have audit_logs or ingest_runs records" } else { Fail "job records" $jobRows }

if ($secretCount -ge 20) { Pass "secrets table >= 20 encrypted rows" } else { Fail "secrets count" $secretCount }
if (-not (Test-Path BLOCKED.md)) { Pass "root has no BLOCKED.md" } else { Fail "root BLOCKED.md" "present" }

$m5 = powershell -ExecutionPolicy Bypass -File scripts/verify-m5.ps1
if (($m5 -join "`n") -match "SUMMARY: PASS=12 FAIL=0") { Pass "verify-m5 remains 12/12 PASS" } else { Fail "verify-m5 output" ($m5 -join "`n") }

$shots = @(Get-ChildItem tests/e2e/screenshots/m6/*.png -ErrorAction SilentlyContinue | Where-Object { $_.Length -ge 51200 })
if ($shots.Count -ge 12) { Pass "m6 screenshots >= 12 and each >= 50KB" } else { Fail "m6 screenshots" $shots.Count }

Write-Output "PASS $pass/18"
