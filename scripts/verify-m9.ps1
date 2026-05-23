$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $true
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0

function Pass($name) {
  $script:pass += 1
  Write-Output "PASS [$script:pass] $name"
}

function Fail($name, $detail) {
  Write-Output "FAIL $name :: $detail"
  exit 1
}

function Run($name, $cmd) {
  try {
    Invoke-Expression $cmd | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
    Pass $name
  } catch {
    Fail $name $_
  }
}

function IdatCount($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $latin = [System.Text.Encoding]::GetEncoding('ISO-8859-1').GetString($bytes)
  return ([regex]::Matches($latin, 'IDAT')).Count
}

Run "typecheck, lint, test 9 M9 packages" "pnpm --config.engine-strict=false --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/ui build; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov typecheck; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov lint; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov test"

Run "visual-lint R1-R8" "node scripts/visual-lint.mjs"

$colors = Get-Content -Raw packages/ui/src/tokens/colors.ts
if ($colors -match 'navy' -and $colors -match 'silver' -and $colors -match 'rose' -and $colors -match 'cyber') {
  Pass "colors token has navy, silver, rose, cyber"
} else {
  Fail "colors token semantic sets" "missing navy/silver/rose/cyber"
}

if ($colors -match "accent:\s*\{\s*500:\s*'#d99880'" -and $colors -notmatch '#d4953a') {
  Pass "accent.500 is rose gold #d99880 and old #d4953a is absent"
} else {
  Fail "accent token" "accent.500 not locked to #d99880 or old gold remains"
}

$whiteHits = rg -n 'text-white' 'apps/admin/src/app/(main)/admin/notifications/page.tsx' 'apps/admin/src/app/(main)/admin/jobs/page.tsx' 'apps/admin/src/app/(main)/admin/health/page.tsx' 'apps/admin/src/app/(main)/admin/ai-monitor/page.tsx' 'apps/admin/src/app/(main)/admin/observability/page.tsx' 2>$null
if (-not $whiteHits) { Pass "5 admin readable pages have no direct text-white" } else { Fail "admin text-white grep" ($whiteHits -join "`n") }

$englishHits = rg -n 'Search title|Wenshu CSV importer|Interface-first|Upload CSV|case field' apps/admin/src/app/admin/data-center 2>$null
if (-not $englishHits) { Pass "admin data-center pages have no M7 English leftovers" } else { Fail "data-center English grep" ($englishHits -join "`n") }

$stats = Get-Content -Raw .kiro/state/m9-codemod-results.json | ConvertFrom-Json
if ((Test-Path scripts/m9-color-codemod.mjs) -and (Test-Path scripts/m9-typography-codemod.mjs) -and $stats.totalReplacements -ge 50) {
  Pass "M9 codemods exist and replacement count >= 50"
} else {
  Fail "M9 codemod stats" "total=$($stats.totalReplacements)"
}

try {
  node .kiro/state/m9-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
} catch {
  Fail "M9 screenshot capture" $_
}

$expected = @(
  'm9-admin-notifications-readable.png',
  'm9-admin-jobs-readable.png',
  'm9-admin-health-readable.png',
  'm9-admin-ai-monitor-readable.png',
  'm9-admin-data-center-zh.png',
  'm9-web-dashboard-tokenized.png'
)
$badShots = @()
foreach ($name in $expected) {
  $path = Join-Path 'tests/e2e/screenshots/m9' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
if ($badShots.Count -eq 0) { Pass "6 M9 screenshots each >= 200KB and IDAT >= 5" } else { Fail "M9 screenshots" ($badShots -join '; ') }

try {
  node .kiro/state/m9-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
  Pass "axe-core color-contrast audit has no violations on 5+ M9 pages"
} catch {
  Fail "axe-core contrast audit" $_
}

$m5 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m5.ps1
if ($LASTEXITCODE -eq 0 -and (($m5 -join "`n") -match 'PASS 12/12' -or ($m5 -join "`n") -match 'PASS=12 FAIL=0')) {
  $m6 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m6.ps1
  if ($LASTEXITCODE -eq 0 -and (($m6 -join "`n") -match 'PASS 18/18' -or ($m6 -join "`n") -match 'PASS=18 FAIL=0')) {
    $m7 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m7.ps1
    if ($LASTEXITCODE -eq 0 -and (($m7 -join "`n") -match 'PASS 14/14' -or ($m7 -join "`n") -match 'PASS=14 FAIL=0')) {
      $m8 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m8.ps1
      if ($LASTEXITCODE -eq 0 -and (($m8 -join "`n") -match 'PASS 14/14' -or ($m8 -join "`n") -match 'PASS=14 FAIL=0')) {
        Pass "verify-m5, verify-m6, verify-m7, verify-m8 still all PASS"
      } else { Fail "verify-m8 regression" ($m8 -join "`n") }
    } else { Fail "verify-m7 regression" ($m7 -join "`n") }
  } else { Fail "verify-m6 regression" ($m6 -join "`n") }
} else { Fail "verify-m5 regression" ($m5 -join "`n") }

Write-Output "PASS $pass/10"
