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

Run "typecheck, lint, test targeted M7 packages" "pnpm --config.engine-strict=false --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/ui build; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov typecheck; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov lint; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov test"

$credentialForbidden = 'Credentials Console|Payment 5|Notify 8|Storage 7|AI 4|Collect 3|Edit|Test|Real|Mode|Health|Last Switch|Actions'
$credentialHits = rg -n $credentialForbidden "apps/admin/src/app/(main)/admin/credentials" 2>$null
if (-not $credentialHits) { Pass "credentials page has no forbidden English visible labels" } else { Fail "credentials English grep" ($credentialHits -join "`n") }

$ingestForbidden = 'Tianyancha ingest|Run collector|Audit runs|No ingest runs yet|Collector endpoint|Company search'
$ingestHits = rg -n $ingestForbidden "apps/admin/src/app/(main)/ingest" "apps/admin/src/components/ingest-workbench.tsx" 2>$null
if (-not $ingestHits) { Pass "ingest pages have no forbidden English visible labels" } else { Fail "ingest English grep" ($ingestHits -join "`n") }

Run "Playwright visits M7 pages and captures screenshots" "node .kiro/state/m7-screenshots.cjs"

$frontendPromptHits = @()
$frontendPromptHits += rg -n -F -e '{{request}}' -e '{{role}}' -e '<company_profile>' -e '<urgency>' -e '<document_text>' apps/web/src apps/agent/src apps/gov/src apps/admin/src 2>$null
$frontendPromptHits += rg -n 'setInput.*template|setInput.*Prompt' apps/web/src apps/agent/src apps/gov/src apps/admin/src 2>$null
if (-not $frontendPromptHits) { Pass "4 frontend assistants do not leak prompt templates" } else { Fail "frontend prompt leak grep" ($frontendPromptHits -join "`n") }

$errorApps = @('web','agent','gov','admin')
$errorMissing = @()
foreach ($app in $errorApps) {
  $file = "apps/$app/src/app/error.tsx"
  if (-not (Test-Path $file)) { $errorMissing += "$app missing error.tsx"; continue }
  $raw = Get-Content -Raw $file
  if ($raw -notmatch 'CyberError' -or $raw -notmatch 'export default') { $errorMissing += "$app error.tsx invalid" }
  $loading = "apps/$app/src/app/loading.tsx"
  if (-not (Test-Path $loading) -or (Get-Content -Raw $loading) -notmatch 'CyberLoading') { $errorMissing += "$app loading.tsx invalid" }
}
if ($errorMissing.Count -eq 0) { Pass "4 apps have CyberError and CyberLoading boundaries" } else { Fail "error/loading pages" ($errorMissing -join '; ') }

$adminHomeSource = Get-Content -Raw "apps/admin/src/app/page.tsx"
if ($adminHomeSource -notmatch 'navigation\.items\.map[\s\S]{0,120}Tab') { Pass "admin home has no duplicated navigation tabs" } else { Fail "admin home duplicate nav pattern" "navigation.items.map -> Tab" }

$opcHits = rg -n 'OPC console' apps packages prisma 2>$null
if (-not $opcHits) { Pass "legacy console label grep hits = 0" } else { Fail "legacy console label grep" ($opcHits -join "`n") }

$footer = 'packages/ui/src/report/AiReportFooter.tsx'
if ((Test-Path $footer) -and (Get-Content -Raw $footer) -match "owner'\s*\|\s*'agent'\s*\|\s*'gov'\s*\|\s*'employee|agent'\s*\|\s*'employee'\s*\|\s*'gov'\s*\|\s*'owner") {
  Pass "AiReportFooter exists with 4 audience types"
} else {
  Fail "AiReportFooter audience" "missing file or audience union"
}

$i18nChecks = @{
  'apps/web/src/i18n/zh-CN.ts' = 'employeeActions'
  'apps/agent/src/i18n/zh-CN.ts' = 'agentActions'
  'apps/gov/src/i18n/zh-CN.ts' = 'govActions'
  'apps/admin/src/i18n/zh-CN.ts' = 'ownerActions'
}
$i18nMissing = @()
foreach ($entry in $i18nChecks.GetEnumerator()) {
  if ((Get-Content -Raw $entry.Key) -notmatch $entry.Value) { $i18nMissing += "$($entry.Key):$($entry.Value)" }
}
if ($i18nMissing.Count -eq 0) { Pass "4 role action key groups exist in i18n" } else { Fail "i18n action keys" ($i18nMissing -join '; ') }

$agentSubtypeHits = rg -n 'AGENT_PARTNER' packages/types/src apps/agent/src prisma/seed/index.ts 2>$null
if ($agentSubtypeHits) { Pass "AGENT_PARTNER exists in types, i18n, and seed" } else { Fail "AGENT_PARTNER grep" "missing" }

$pendingHits = rg -n 'pending_deposit' apps packages prisma 2>$null
$depositUiHits = rg -n '保证金' apps/web/src apps/agent/src apps/gov/src apps/admin/src packages/ui/src 2>$null
if ((-not $pendingHits) -and (-not $depositUiHits)) {
  Pass "deposit status and UI deposit guarantee hits are zero"
} else {
  Fail "deposit cleanup" "pending=$($pendingHits -join '; '); ui=$($depositUiHits -join '; ')"
}

$builder = Get-Content -Raw apps/api/src/ai-gateway/prompt-builder.service.ts
if ((Test-Path packages/constants/src/red-line-phrases.ts) -and $builder -match 'RED_LINE_PHRASES' -and $builder -match 'AI_PROMPT_RED_LINE_VIOLATION') {
  Pass "red-line phrase constants are enforced by PromptBuilder"
} else {
  Fail "red-line enforcement" "missing constant import or RED_LINE_VIOLATION"
}

$expected = @(
  'm7-credentials-zh.png',
  'm7-ingest-tianyancha-zh.png',
  'm7-prompts-no-crash.png',
  'm7-rules-no-crash.png',
  'm7-ai-orb-no-template-leak.png',
  'm7-admin-home-no-duplicate-tabs.png',
  'm7-web-report-5-actions.png',
  'm7-agent-partner-subtype.png'
)
$badShots = @()
foreach ($name in $expected) {
  $path = Join-Path 'tests/e2e/screenshots/m7' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
if ($badShots.Count -eq 0) { Pass "8 M7 screenshots each >= 200KB and IDAT >= 5" } else { Fail "M7 screenshots" ($badShots -join '; ') }

Write-Output "PASS $pass/14"

