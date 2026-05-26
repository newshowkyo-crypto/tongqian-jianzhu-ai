$ErrorActionPreference = 'Stop'
$pass = 0
$fail = 0

function Check($name, $condition) {
  if ($condition) {
    Write-Host "PASS $name"
    $script:pass++
  } else {
    Write-Host "FAIL $name"
    $script:fail++
  }
}

function ReadText($path) {
  if (Test-Path -LiteralPath $path) {
    return Get-Content -LiteralPath $path -Raw
  }
  return ''
}

function HasPath($path) {
  return Test-Path -LiteralPath $path
}

$schema = ReadText 'prisma/schema.prisma'
$materialService = ReadText 'apps/api/src/modules/material/material.service.ts'
$subcontractService = ReadText 'apps/api/src/modules/subcontract/subcontract.service.ts'
$actualService = ReadText 'apps/api/src/modules/actual-cost/actual-cost.service.ts'
$meetingService = ReadText 'apps/api/src/modules/meeting/meeting.service.ts'
$qualityService = ReadText 'apps/api/src/modules/quality/quality.service.ts'
$qualityPrompt = ReadText 'apps/api/src/prompts/quality/rectification-suggest.prompt.ts'
$changedFiles = git diff --name-only v0.1.4-pre-launch..HEAD
$heavyPattern = 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex|whisper'
$changedText = ($changedFiles | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | ForEach-Object { ReadText $_ }) -join "`n"

Check 'M40.1 material schema' ($schema -match 'model Material\s' -and $schema -match 'model Stock\s' -and $schema -match 'model StockMovement\s')
Check 'M40.2 material real loss service' ($materialService -match 'inbound' -and $materialService -match 'outbound' -and $materialService -match 'monthlyCheck' -and $materialService -match 'getHighLossList' -and $materialService -match 'lossQty / item\.theoreticalQty')
Check 'M40.3 material pages and ai' ((HasPath 'apps/web/src/app/projects/[id]/materials/page.tsx') -and (HasPath 'apps/web/src/app/projects/[id]/materials/loss-analysis/page.tsx') -and ((ReadText 'apps/web/src/app/projects/[id]/materials/loss-analysis/page.tsx') -match 'AiDisclaimer'))
Check 'M40.4 subcontract schema' ($schema -match 'model Subcontract\s' -and $schema -match 'model SubcontractEvaluation\s' -and $schema -match 'model SubcontractorBlacklist\s')
Check 'M40.5 subcontract 5d blacklist review' ($subcontractService -match 'quality' -and $subcontractService -match 'schedule' -and $subcontractService -match 'safety' -and $subcontractService -match 'cooperation' -and $subcontractService -match 'settlement' -and $subcontractService -match 'checkBlacklist' -and $subcontractService -match 'm14-review')
Check 'M40.6 subcontract pages' ((HasPath 'apps/web/src/app/projects/[id]/subcontracts/page.tsx') -and (HasPath 'apps/web/src/app/projects/[id]/subcontracts/[id]/evaluation/page.tsx') -and (HasPath 'apps/web/src/app/admin/subcontractor-blacklist/page.tsx'))
Check 'M40.7 actual cost schema' ($schema -match 'model ActualCost\s' -and $schema -match 'model CostBudgetVariance\s' -and $schema -match 'laborCost' -and $schema -match 'materialCost' -and $schema -match 'machineCost' -and $schema -match 'mgmtCost' -and $schema -match 'profit')
Check 'M40.8 actual cost variance service' ($actualService -match 'recordMonthly' -and $actualService -match 'computeVariance' -and $actualService -match 'getVarianceTrend' -and $actualService -match 'actualAmount - budgetAmount')
Check 'M40.9 actual cost pages prompt' ((HasPath 'apps/web/src/app/projects/[id]/actual-cost/page.tsx') -and (HasPath 'apps/web/src/app/projects/[id]/actual-cost/variance/page.tsx') -and (HasPath 'apps/api/src/prompts/cost/actual-vs-budget.prompt.ts'))
Check 'M40.10 meeting schema' ($schema -match 'model Meeting\s' -and $schema -match 'model MeetingMinute\s' -and $schema -match 'model Todo\s')
Check 'M40.11 meeting service todos' ($meetingService -match 'submitTranscript' -and $meetingService -match 'generateMinute' -and $meetingService -match 'actionItems' -and $meetingService -match 'listMyTodos')
Check 'M40.12 meeting pages voice' ((HasPath 'apps/gov/src/app/personal/meetings/page.tsx') -and (HasPath 'apps/gov/src/app/personal/meetings/[id]/page.tsx') -and (HasPath 'apps/gov/src/app/personal/todos/page.tsx') -and (HasPath 'apps/web/src/app/meetings/page.tsx') -and ((ReadText 'apps/gov/src/app/personal/meetings/[id]/page.tsx') -match 'VoiceInputButton'))
Check 'M40.13 quality schema' ($schema -match 'model QualityCheckpoint\s' -and $schema -match 'model RectificationOrder\s' -and $schema -match 'model HazardClosure\s')
Check 'M40.14 quality closure service prompt' ($qualityService -match 'recordCheck' -and $qualityService -match 'createRectification' -and $qualityService -match 'submitVerify' -and $qualityService -match 'closeOrReject' -and $qualityService -match 'rectifying' -and $qualityService -match 'verifying' -and $qualityService -match 'closed' -and $qualityService -match 'rejected' -and $qualityPrompt -match 'standardRef')
$aiCount = (rg -n 'AiDisclaimer' apps/web/src apps/gov/src | Measure-Object).Count
Check 'M40.15 ai disclaimer and no heavy deps' ($aiCount -ge 20 -and $changedText -notmatch $heavyPattern)

pnpm --config.engine-strict=false --filter @tongqian/ui typecheck
pnpm --config.engine-strict=false --filter @tongqian/api typecheck
pnpm --config.engine-strict=false --filter @tongqian/web typecheck
pnpm --config.engine-strict=false --filter @tongqian/gov typecheck
node scripts/visual-lint.mjs
Check 'M40.16 quality gates' ($LASTEXITCODE -eq 0)

if ($fail -ne 0) {
  Write-Host "FAIL M40 verify $pass/16 PASS, $fail FAIL"
  exit 1
}

Write-Host "PASS M40 verify 16/16 PASS"
