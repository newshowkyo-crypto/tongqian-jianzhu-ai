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

function Text($path) { Get-Content -Raw -LiteralPath $path }

function IdatCount($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $latin = [System.Text.Encoding]::GetEncoding('ISO-8859-1').GetString($bytes)
  return ([regex]::Matches($latin, 'IDAT')).Count
}

$badTheme = @()
foreach ($file in @('apps/web/src/styles/globals.css','apps/admin/src/styles/globals.css','apps/agent/src/styles/globals.css','apps/gov/src/styles/globals.css')) {
  $body = Text $file
  if ($body -notmatch "\[data-theme='light'\]" -or $body -notmatch "\[data-theme='dark'\]" -or $body -notmatch '--text-primary') { $badTheme += $file }
}
if ($badTheme.Count -eq 0) { Pass "4 app globals.css contain light/dark CSS variables" } else { Fail "theme globals" ($badTheme -join ', ') }

$layoutChecks = @{
  'apps/web/src/app/layout.tsx' = 'data-theme="light"'
  'apps/agent/src/app/layout.tsx' = 'data-theme="light"'
  'apps/gov/src/app/layout.tsx' = 'data-theme="light"'
  'apps/admin/src/app/layout.tsx' = 'data-theme="dark"'
}
$badLayouts = @()
foreach ($entry in $layoutChecks.GetEnumerator()) {
  if ((Text $entry.Key) -notmatch [regex]::Escape($entry.Value)) { $badLayouts += $entry.Key }
}
if ($badLayouts.Count -eq 0) { Pass "4 layouts set default data-theme correctly" } else { Fail "layout data-theme" ($badLayouts -join ', ') }

$module = Text 'apps/web/src/components/module-page.tsx'
if ($module -match 'apiClient\.aiGateway\.invoke' -and $module -notmatch 'dispatchEvent') { Pass "module-page calls apiClient.aiGateway.invoke without dispatchEvent" } else { Fail "module AI action" "missing invoke or still dispatchEvent" }

$client = Text 'packages/api-client/src/index.ts'
if ($client -match 'aiGateway: createAiGatewayApi' -and $client -match 'function createAiGatewayApi' -and $client -match '/ai/invoke') { Pass "api-client exposes aiGateway.invoke" } else { Fail "api-client aiGateway" "missing createAiGatewayApi" }

if ($module -match 'useState<string \| null>' -and $module -match 'setRunning' -and $module -match 'setResult') { Pass "module-page has running/result state" } else { Fail "module states" "missing running/result state" }

$nav = Text 'apps/web/src/i18n/zh-CN.ts'
$groups = ([regex]::Matches($nav, "groupLabel:")).Count
if ($groups -ge 4 -and $nav -match "group: 'find-work'" -and $nav -match "group: 'avoid-risk'" -and $nav -match "group: 'collect'" -and $nav -match "group: 'manage'") {
  Pass "web navigation is grouped into at least 4 journey groups"
} else {
  Fail "navigation groups" "groupLabel count=$groups"
}

$dashboard = Text 'apps/web/src/app/dashboard/page.tsx'
if ($dashboard -match 'journeySteps' -and $dashboard -match 'index \+ 1' -and ([regex]::Matches($dashboard, "href: '/").Count -ge 5)) {
  Pass "dashboard contains 5-step recommended journey card"
} else {
  Fail "dashboard journey card" "missing 5-step journey"
}

$bad404 = @()
foreach ($file in @('apps/web/src/app/not-found.tsx','apps/admin/src/app/not-found.tsx','apps/agent/src/app/not-found.tsx','apps/gov/src/app/not-found.tsx')) {
  if (-not (Test-Path $file) -or (Text $file) -notmatch '404' -or (Text $file) -notmatch '/dashboard') { $bad404 += $file }
}
if ($bad404.Count -eq 0) { Pass "4 apps have friendly not-found.tsx" } else { Fail "not-found pages" ($bad404 -join ', ') }

try {
  node .kiro/state/m12-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
} catch { Fail "M12 screenshots, console audit, DeepSeek trace" $_ }
$console = Get-Content -Raw tests/e2e/screenshots/m12/console-errors.json | ConvertFrom-Json
$badConsole = @($console | Where-Object { $_.count -ne 0 })
if ($badConsole.Count -eq 0) { Pass "4 dev apps have console.error count = 0" } else { Fail "console errors" ($badConsole | ConvertTo-Json -Compress) }

$expected = @(
  'm12-light-theme-dashboard.png',
  'm12-light-theme-opportunities.png',
  'm12-ai-action-button-deepseek.png',
  'm12-nav-grouped-by-journey.png',
  'm12-dashboard-journey-card.png',
  'm12-404-friendly.png'
)
$badShots = @()
foreach ($name in $expected) {
  $path = Join-Path 'tests/e2e/screenshots/m12' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
$traceJson = node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('tests/e2e/screenshots/m12/deepseek-trace.json','utf8')); console.log(JSON.stringify({traceId:j.data.traceId,providerUsed:j.data.providerUsed}))"
$trace = $traceJson | ConvertFrom-Json
if ($badShots.Count -eq 0 -and $trace.providerUsed -eq 'deepseek_direct' -and $trace.traceId) {
  Pass "6 screenshots are real and DeepSeek traceId exists"
} else {
  Fail "screenshots or DeepSeek trace" (($badShots -join '; ') + " trace=$($trace.traceId) provider=$($trace.providerUsed)")
}

try {
  node scripts/visual-lint.mjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
  $m11 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m11.ps1
  if ($LASTEXITCODE -ne 0 -or (($m11 -join "`n") -notmatch 'PASS 10/10')) { throw ($m11 -join "`n") }
  Pass "visual-lint and verify-m5 through verify-m11 still PASS"
} catch { Fail "visual-lint or M5-M11 regression" $_ }

Write-Output "PASS $pass/11"
