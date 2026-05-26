$pass = 0
$fail = 0

function Check($name, $condition) {
  if ($condition) {
    Write-Host "PASS $name" -ForegroundColor Green
    $script:pass += 1
  } else {
    Write-Host "FAIL $name" -ForegroundColor Red
    $script:fail += 1
  }
}

Check 'M34.1 port-allocator' (Test-Path 'scripts/dev-port-allocator.mjs')
Check 'M34.2 run-dev' (Test-Path 'scripts/run-dev.mjs')

$webPkg = Get-Content 'apps/web/package.json' -Raw
$adminPkg = Get-Content 'apps/admin/package.json' -Raw
$agentPkg = Get-Content 'apps/agent/package.json' -Raw
$govPkg = Get-Content 'apps/gov/package.json' -Raw
Check 'M34.3 4 apps use run-dev' (
  $webPkg -match 'run-dev.mjs web' -and
  $adminPkg -match 'run-dev.mjs admin' -and
  $agentPkg -match 'run-dev.mjs agent' -and
  $govPkg -match 'run-dev.mjs gov'
)

$prodCompose = Get-Content 'infra/docker-compose.prod.yml' -Raw
Check 'M34.4 prod compose unchanged' ($prodCompose -match 'PORT: 4000' -and $prodCompose -match 'PORT: 3000')
Check 'M34.5 dev:fixed escape' (
  $webPkg -match 'dev:fixed' -and
  $adminPkg -match 'dev:fixed' -and
  $agentPkg -match 'dev:fixed' -and
  $govPkg -match 'dev:fixed'
)

pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M34.6 typecheck' ($LASTEXITCODE -eq 0)

Write-Host ''
Write-Host "M34 verify: $pass PASS / $fail FAIL"
exit $fail
