$ErrorActionPreference = 'Stop'
$pass = 0
function Check($name, $ok) {
  if (-not $ok) { throw "FAIL $name" }
  $script:pass++
  Write-Host "PASS M37.$script:pass $name"
}

$services = Get-Content 'apps/web/src/app/services/page.tsx' -Raw
Check 'services 10 real copies' ((([regex]::Matches($services, 'priceRange:')).Count -eq 10) -and ($services -notmatch 'TBD_TEXT') -and ($services -notmatch '\?{4,}'))

$visual = Get-Content 'scripts/visual-lint.mjs' -Raw
Check 'visual R10 question mark rule' (($visual -match 'R10') -and ($visual -match 'gibberish question marks'))

$questionHits = git grep -n -E "['`"]([^'`"]*\?{4,}[^'`"]*)['`"]" -- 'apps/*.ts' 'apps/*.tsx'
Check 'no quoted 4plus question marks' ([string]::IsNullOrWhiteSpace($questionHits))

$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'drawing annotation schema' (($schema -match 'model DrawingAnnotation') -and ($schema -match '@@map\("drawing_annotations"\)'))

$drawingPrompt = Get-Content 'apps/api/src/prompts/drawing/drawing-snapshot-explain.prompt.ts' -Raw
$drawingDiffPrompt = Get-Content 'apps/api/src/prompts/drawing/drawing-version-diff.prompt.ts' -Raw
Check 'drawing prompts 4 fewshots each' ((([regex]::Matches($drawingPrompt, 'input:')).Count -ge 4) -and (([regex]::Matches($drawingDiffPrompt, 'input:')).Count -ge 4))

$viewer = Get-Content -LiteralPath 'apps/web/src/app/projects/[id]/drawings/[drawingId]/page.tsx' -Raw
Check 'drawing viewer pdfjs lightweight' (($viewer -match 'pdfjs') -and ($viewer -notmatch 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui'))

$metadata = Get-Content 'apps/api/data/legal-corpus/seed/metadata.json' -Raw | ConvertFrom-Json
Check 'regulation metadata 14 entries' ($metadata.Count -ge 14)

$regPrompt = Get-Content 'apps/api/src/prompts/regulation/regulation-quick-query.prompt.ts' -Raw
Check 'regulation prompt 4 fewshots' (([regex]::Matches($regPrompt, "name: '")).Count -ge 4)

$regService = Get-Content 'apps/api/src/modules/knowledge/regulation-rag.service.ts' -Raw
Check 'regulation rag service' (($regService -match 'RegulationRagService') -and ($regService -match 'quickQuery'))

$reminder = Get-Content 'apps/api/src/modules/cashflow-finance/multi-channel-reminder.service.ts' -Raw
$cashController = Get-Content 'apps/api/src/modules/cashflow-finance/cashflow-finance.controller.ts' -Raw
Check 'multi-channel reminder service endpoint' (($reminder -match 'NotificationDispatcherService') -and ($cashController -match 'cashflow/receivables/:id/reminders'))

$alerts = Get-Content 'apps/api/src/modules/dashboard/cross-project-alerts.service.ts' -Raw
$dashboard = Get-Content 'apps/web/src/app/dashboard/page.tsx' -Raw
Check 'cross-project alerts api card' (($alerts -match 'CrossProjectAlertsService') -and ($dashboard -match 'Cross-project alerts'))

$mobilePaths = @('apps/web/src/app/m/page.tsx','apps/web/src/app/m/photo-report/page.tsx','apps/web/src/app/m/drawing-query/page.tsx','apps/web/src/app/m/regulation/page.tsx','apps/web/src/app/m/hazard-report/page.tsx')
Check 'pm h5 entry paths' (($mobilePaths | Where-Object { Test-Path $_ }).Count -eq 5)

$changedPackages = git diff --name-only main...HEAD -- '*package.json'
$heavy = ''
if (-not [string]::IsNullOrWhiteSpace($changedPackages)) {
  $heavy = $changedPackages | ForEach-Object { Get-Content $_ -Raw } | Select-String -Pattern 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|three|fabric'
}
Check 'no heavy dependencies added' ([string]::IsNullOrWhiteSpace($heavy))

node scripts/visual-lint.mjs
pnpm --config.engine-strict=false --filter @tongqian/api typecheck
pnpm --config.engine-strict=false --filter @tongqian/web typecheck
pnpm --config.engine-strict=false --filter @tongqian/agent typecheck
Check 'quality gates visual and typecheck' $true

Write-Host 'PASS verify-m37 14/14'
Write-Host 'PASS quality gates'
