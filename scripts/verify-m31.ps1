$ErrorActionPreference = 'Stop'
$pass = 0; $fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name"; $script:pass++ } else { Write-Host "FAIL $name"; $script:fail++ } }

cmd /c "pnpm --config.engine-strict=false --filter @tongqian/admin lint 2>&1" | Out-Null
Check 'M31.1 admin lint 0 errors' ($LASTEXITCODE -eq 0)

cmd /c "pnpm --config.engine-strict=false lint 2>&1" | Out-Null
Check 'M31.2 full lint 0 errors' ($LASTEXITCODE -eq 0)

$vl = cmd /c "node scripts/visual-lint.mjs 2>&1"
Check 'M31.3 visual-lint 0 violations' (-not (($vl | Out-String) -match '^R\d|hardcode|odd'))

foreach ($svc in 'cost-catalog/cost-catalog','tender/rfp-rag','risk-review/red-flag-scan','chat-hub/tool-registry','project-site/schedule','customer-due-diligence/due-diligence','cost-estimate/budget-estimator','project-site/claim-record') {
  Check "M31.spec $svc" (Test-Path "apps/api/src/modules/$svc.service.spec.ts")
}

cmd /c "pnpm --config.engine-strict=false typecheck 2>&1" | Out-Null
$tc = $LASTEXITCODE
cmd /c "pnpm --config.engine-strict=false test 2>&1" | Out-Null
$tt = $LASTEXITCODE
Check 'M31.12 typecheck + test pass' ($tc -eq 0 -and $tt -eq 0)

Write-Host "M31 verify: $pass PASS / $fail FAIL"
exit $fail
