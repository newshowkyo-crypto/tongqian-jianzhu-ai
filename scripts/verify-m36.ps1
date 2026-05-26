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

$rf = Get-Content 'apps/api/data/contract-red-flags/zh-CN-construction.json' -Raw
$count = ([regex]::Matches($rf, '"id":')).Count
Check 'M36.1 red-flag 80+ items' ($count -ge 80)

foreach ($testSet in 'contract-review','tender-summary','qualification-checkup','cost-estimate','red-flag-scan','report-quality','due-diligence') {
  Check "M36.test $testSet" (Test-Path "apps/api/data/golden-test-sets/$testSet.test.json")
}

Check 'M36.9 golden-runner' (Test-Path 'apps/api/src/modules/prompt-testing/golden-runner.service.ts')

$results = Get-Content '.kiro/state/M36-GOLDEN-RESULTS.json' -Raw -ErrorAction SilentlyContinue
$lowF1 = if ($results) { ($results -split "`n" | Select-String '"f1":\s*0\.[0-6]').Count } else { 99 }
Check 'M36.10 all F1 >= 0.70' ($lowF1 -eq 0)

Check 'M36.11 audit trail' (Test-Path 'docs/prompt-audit/2026-05-23-m36-baseline.md')

pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M36.12 typecheck' ($LASTEXITCODE -eq 0)

Write-Host ''
Write-Host "M36 verify: $pass PASS / $fail FAIL"
exit $fail
