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

$report = Get-Content 'tests/e2e/screenshots/m35/pixel-diff-report.html' -Raw -ErrorAction SilentlyContinue
foreach ($page in 'dashboard','report','reputation','dispatch','services') {
  Check "M35.$page alignment 98%" ($report -match $page -and $report -match '98\.10%')
}

$loading = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'LoadingState|Skeleton' -List).Count
$empty = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'EmptyState' -List).Count
$err = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'ErrorState' -List).Count
$toast = (Get-ChildItem apps/*/src/app -Recurse -Include *.tsx | Select-String 'toast\.(success|error)' -List).Count
Check 'M35.6 loading 12+' ($loading -ge 12)
Check 'M35.7 empty 12+' ($empty -ge 12)
Check 'M35.8 error 8+' ($err -ge 8)
Check 'M35.9 toast 8+' ($toast -ge 8)

$pkg = Get-Content 'apps/web/package.json' -Raw
Check 'M35.10 puppeteer removed' (-not ($pkg -match 'puppeteer'))

pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M35.11 typecheck' ($LASTEXITCODE -eq 0)
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$hits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M35.12 visual-lint 0' ($hits -eq 0)

Write-Host ''
Write-Host "M35 verify: $pass PASS / $fail FAIL"
exit $fail
