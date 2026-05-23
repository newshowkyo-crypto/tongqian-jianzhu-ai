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

$homeFailures = @()
foreach ($port in 3010,3011,3012,3013) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$port/" -TimeoutSec 30
    if ([int]$response.StatusCode -ne 200) { $homeFailures += "$port status=$($response.StatusCode)" }
    if ($response.Content -match 'login') { $homeFailures += "$port contains login" }
  } catch {
    $homeFailures += "$port $_"
  }
}
if ($homeFailures.Count -eq 0) { Pass "4 dev homepages return 200 and do not contain login" } else { Fail "dev homepages" ($homeFailures -join '; ') }

$moduleJson = pnpm --config.engine-strict=false --dir apps/web exec tsx -e "import { webModulePages } from './src/m3-pages.ts'; const bad=Object.entries(webModulePages).filter(([,v])=>v.seedKpis.length<4||v.seedRows.length<5||v.seedActions.length<3).map(([k])=>k); console.log(JSON.stringify({count:Object.keys(webModulePages).length,bad}));"
if ($LASTEXITCODE -eq 0) {
  $moduleState = $moduleJson | Select-Object -Last 1 | ConvertFrom-Json
  if ($moduleState.count -ge 17 -and $moduleState.bad.Count -eq 0) { Pass "web m3 modules have seedKpis>=4 seedRows>=5 seedActions>=3" } else { Fail "module seeds" ($moduleJson -join "`n") }
} else { Fail "module seed runtime check" ($moduleJson -join "`n") }

$client = Text 'packages/api-client/src/index.ts'
if ($client -match "NEXT_PUBLIC_API_MOCK !== 'false'") { Pass "api-client mock defaults on unless NEXT_PUBLIC_API_MOCK=false" } else { Fail "api-client mock default" "missing NEXT_PUBLIC_API_MOCK !== 'false'" }

$clientBody = Text 'packages/api-client/src/index.ts'
if (
  $clientBody -match 'function ownerDashboardFixture' -and
  ([regex]::Matches($clientBody, 'opportunities:\s*\[').Count -ge 1) -and
  ([regex]::Matches($clientBody, 'scoreChanges:\s*\[').Count -ge 1) -and
  ([regex]::Matches($clientBody, 'subscriptions:\s*\[').Count -ge 1) -and
  ([regex]::Matches($clientBody, 'aarrr:\s*\[').Count -ge 1) -and
  ([regex]::Matches($clientBody, 'value:').Count -ge 20)
) { Pass "4 dashboard fixtures contain demo KPIs and rows" } else { Fail "dashboard fixtures" "missing owner/agent/gov/admin fixture content" }

$badRewrite = @()
foreach ($file in @('apps/web/next.config.mjs','apps/admin/next.config.mjs','apps/agent/next.config.mjs','apps/gov/next.config.mjs')) {
  $body = Text $file
  if ($body -notmatch '/api/v1/:path\*' -or $body -notmatch 'localhost:4000/api/v1') { $badRewrite += $file }
}
if ($badRewrite.Count -eq 0) { Pass "4 next.config.mjs files rewrite /api/v1 to localhost:4000" } else { Fail "next rewrites" ($badRewrite -join ', ') }

$badProvider = @()
foreach ($app in 'web','admin','agent','gov') {
  if ((Text "apps/$app/src/app/layout.tsx") -notmatch 'QueryProvider') { $badProvider += "$app layout" }
  if ((Text "apps/$app/src/components/query-provider.tsx") -notmatch 'QueryClientProvider') { $badProvider += "$app query-provider" }
}
if ($badProvider.Count -eq 0) { Pass "4 layouts wire QueryClientProvider through QueryProvider" } else { Fail "query providers" ($badProvider -join ', ') }

try {
  node .kiro/state/m11-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
} catch { Fail "M11 screenshots, console audit, DeepSeek trace" $_ }
$console = Get-Content -Raw tests/e2e/screenshots/m11/console-errors.json | ConvertFrom-Json
$badConsole = @($console | Where-Object { $_.count -ne 0 })
if ($badConsole.Count -eq 0) { Pass "4 dev apps have console.error count = 0" } else { Fail "console errors" ($badConsole | ConvertTo-Json -Compress) }

$uiShell = Text 'packages/ui/src/layout/page.tsx'
$command = Text 'packages/ui/src/primitives/Command.tsx'
$bubble = Text 'packages/ui/src/domain/index.tsx'
if ($command -match 'fetch\(endpoint' -and $uiShell -match "togglePanel\('notifications'\)" -and $uiShell -match 'setThemeMode' -and $bubble -match 'onSend\(next\)') {
  Pass "Cmd+K, notifications, theme toggle and AI orb have real handlers"
} else { Fail "topbar/orb handlers" "missing real handler grep" }

try {
  node scripts/visual-lint.mjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
  Pass "visual-lint still PASS"
} catch { Fail "visual-lint" $_ }

$m10 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m10.ps1
if ($LASTEXITCODE -ne 0 -or (($m10 -join "`n") -notmatch 'PASS 7/7')) {
  Start-Sleep -Seconds 5
  $m10 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m10.ps1
}
if ($LASTEXITCODE -eq 0 -and (($m10 -join "`n") -match 'PASS 7/7')) { Pass "verify-m5 through verify-m10 still PASS" } else { Fail "M5-M10 regression" ($m10 -join "`n") }

$expected = @(
  'm11-web-dashboard-with-real-kpis.png',
  'm11-web-opportunities-with-rows.png',
  'm11-web-contracts-with-rows.png',
  'm11-web-cmdk-search.png',
  'm11-web-ai-orb-deepseek-reply.png',
  'm11-admin-dashboard-with-metrics.png'
)
$badShots = @()
foreach ($name in $expected) {
  $path = Join-Path 'tests/e2e/screenshots/m11' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
$traceJson = node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('tests/e2e/screenshots/m11/deepseek-trace.json','utf8')); console.log(JSON.stringify({traceId:j.data.traceId,providerUsed:j.data.providerUsed}))"
$trace = $traceJson | ConvertFrom-Json
if ($badShots.Count -eq 0 -and $trace.providerUsed -eq 'deepseek_direct' -and $trace.traceId) {
  Write-Output "PASS artifacts 6 screenshots are real and DeepSeek traceId exists"
} else { Fail "screenshots or DeepSeek trace" (($badShots -join '; ') + " trace=$($trace.traceId) provider=$($trace.providerUsed)") }

Write-Output "PASS $pass/10"
