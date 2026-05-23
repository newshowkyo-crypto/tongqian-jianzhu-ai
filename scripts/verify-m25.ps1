$ErrorActionPreference = 'Stop'
$pass = 0
$fail = 0
function Check($name, $cond) {
  if ($cond) { Write-Host "PASS $name" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "FAIL $name" -ForegroundColor Red; $script:fail++ }
}

$tauriConf = Get-Content 'apps/desktop/src-tauri/tauri.conf.json' -Raw
Check 'M25.1 tauri productName chinese' ($tauriConf -match '同乾方略')
Check 'M25.2 tauri updater endpoints' ($tauriConf -match 'updater' -and $tauriConf -match 'endpoints')
Check 'M25.3 build-msi.mjs' (Test-Path 'apps/desktop/scripts/build-msi.mjs')

$df = Get-Content 'infra/docker/Dockerfile.api' -Raw
Check 'M25.4 dockerfile api has healthcheck' ($df -match 'HEALTHCHECK' -and ($df -match '^CMD' -or $df -match "`nCMD"))

$dfn = Get-Content 'infra/docker/Dockerfile.next' -Raw
Check 'M25.5 dockerfile next multistage' ($dfn -match 'AS deps' -and $dfn -match 'AS runner')

Check 'M25.6 deploy scripts' (
  (Test-Path 'infra/deploy/bootstrap.sh') -and
  (Test-Path 'infra/deploy/deploy.sh') -and
  (Test-Path 'infra/deploy/rollback.sh') -and
  (Test-Path 'infra/deploy/health-check.sh')
)

$runbook = Get-Content 'docs/runbook/01-vps-bootstrap.md' -Raw -ErrorAction SilentlyContinue
Check 'M25.7 vps runbook chinese 200+ lines' ($runbook -and ($runbook -split "`n").Length -gt 200 -and $runbook -match 'ICP_RECORD_NO')

$wf = Get-Content '.github/workflows/release-prod.yml' -Raw -ErrorAction SilentlyContinue
Check 'M25.8 release workflow uses secrets' ($wf -and $wf -match 'secrets\.ACR_PASSWORD' -and $wf -notmatch 'password:\s*[a-zA-Z0-9]{8,}')

$dr = Get-Content '.github/workflows/desktop-release.yml' -Raw -ErrorAction SilentlyContinue
Check 'M25.9 desktop workflow windows runner' ($dr -and $dr -match 'windows-2022' -and $dr -match 'tauri|build:msi')

Check 'M25.10 image scripts' ((Test-Path 'infra/scripts/build-images.sh') -and (Test-Path 'infra/scripts/push-images.sh'))

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$tc = cmd /c "pnpm --config.engine-strict=false typecheck 2>&1"
$ErrorActionPreference = $previousErrorActionPreference
$tc | Out-Host
Check 'M25.11 typecheck' ($LASTEXITCODE -eq 0)

$compose = Get-Content 'infra/docker-compose.prod.yml' -Raw
$svcCount = ([regex]::Matches($compose, "(?m)^  [a-z][a-z-]+:")).Count
Check 'M25.12 compose 7+ services' ($svcCount -ge 7)

Write-Host ""
Write-Host "M25 verify: $pass PASS / $fail FAIL"
exit $fail
