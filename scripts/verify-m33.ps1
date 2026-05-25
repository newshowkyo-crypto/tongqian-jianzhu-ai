$ErrorActionPreference = 'Stop'
$pass = 0
$fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name" -ForegroundColor Green; $script:pass++ } else { Write-Host "FAIL $name" -ForegroundColor Red; $script:fail++ } }

$count = 0
foreach ($app in 'web','admin','agent','gov') {
  $glob = Get-Content "apps/$app/src/styles/globals.css" -Raw -ErrorAction SilentlyContinue
  if ($glob -and $glob -match 'PingFang SC|Microsoft YaHei') { $count++ }
}
Check 'M33.1 4 apps system font stack' ($count -eq 4)

$gf = 0
foreach ($app in 'web','admin','agent','gov') {
  $lay = Get-Content "apps/$app/src/app/layout.tsx" -Raw -ErrorAction SilentlyContinue
  if ($lay -and ($lay -match 'next/font/google' -or $lay -match 'fonts.googleapis.com')) { $gf++ }
}
Check 'M33.2 no google font dep' ($gf -eq 0)

$agentI18n = Get-Content 'apps/agent/src/i18n/zh-CN.ts' -Raw
Check 'M33.3 agent i18n complete' ($agentI18n -match 'dashboard|home' -and $agentI18n -match 'dispatch' -and $agentI18n -match 'reputation')

$vl = Get-Content 'scripts/visual-lint.mjs' -Raw
Check 'M33.4 R9 contrast rule' ($vl -match 'R9' -and $vl -match 'low-contrast')

$vlOut = node scripts/visual-lint.mjs 2>&1 | Out-String
$hits = ($vlOut -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M33.5 visual-lint 0 violations' ($hits -eq 0)

$shots = (Get-ChildItem 'tests/e2e/screenshots/m33' -Filter *.png -ErrorAction SilentlyContinue).Count
Check 'M33.6 4 screenshots' ($shots -ge 4)

Check 'M33.7 legibility report' (Test-Path 'tests/e2e/screenshots/m33/legibility-report.html')

$pkg = Get-Content 'apps/web/package.json' -Raw
Check 'M33.8 puppeteer removed' (-not ($pkg -match 'puppeteer'))

$ErrorActionPreference = 'Continue'
pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
Check 'M33.9 typecheck' ($LASTEXITCODE -eq 0)

pnpm --config.engine-strict=false lint 2>&1 | Out-Null
Check 'M33.10 lint' ($LASTEXITCODE -eq 0)
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "M33 verify: $pass PASS / $fail FAIL"
exit $fail
