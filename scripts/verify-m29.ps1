$ErrorActionPreference = 'Stop'

$passed = 0
$failed = 0

function Check($name, $ok) {
  if ($ok) {
    Write-Host "PASS $name"
    $script:passed += 1
  } else {
    Write-Host "FAIL $name"
    $script:failed += 1
  }
}

$schema = Get-Content 'prisma/schema.prisma' -Raw
$schedule = Get-Content 'apps/api/src/modules/project-site/schedule.service.ts' -Raw
$historical = Get-Content 'apps/api/src/modules/cost-estimate/historical-cost.service.ts' -Raw
$safety = Get-Content 'apps/api/src/prompts/safety/safety-briefing.prompt.ts' -Raw
$technical = Get-Content 'apps/api/src/prompts/technical/technical-briefing.prompt.ts' -Raw
$autoSummary = Get-Content 'apps/api/src/modules/report-center/auto-summary.service.ts' -Raw
$dd = Get-Content 'apps/api/src/modules/customer-due-diligence/due-diligence.service.ts' -Raw
$photo = Get-Content 'apps/api/src/modules/project-site/photo.service.ts' -Raw
$photoPrompt = Get-Content 'apps/api/src/prompts/site/photo-classifier.prompt.ts' -Raw
$apiPkg = Get-Content 'apps/api/package.json' -Raw
$webPkg = Get-Content 'apps/web/package.json' -Raw
$workerPkg = Get-Content 'apps/worker/package.json' -Raw

Check 'M29.1 schedule schema' ($schema -match 'model ProjectSchedule' -and $schema -match 'model ScheduleTask' -and $schema -match 'isCriticalPath')
Check 'M29.2 cpm algorithm' ($schedule -match 'computeCriticalPath' -and $schedule -match 'forward|backward|earliest|latest' -and $schedule -match 'dependencies')
Check 'M29.3 historical cost schema' ($schema -match 'model HistoricalProjectCost' -and $schema -match 'unitCostCnyPerSqm')
Check 'M29.4 deviation threshold' ($historical -match 'deviation' -and $historical -match '0\.2|20')
Check 'M29.5 briefing prompts' ((Test-Path 'apps/api/src/prompts/safety/safety-briefing.prompt.ts') -and (Test-Path 'apps/api/src/prompts/technical/technical-briefing.prompt.ts'))
Check 'M29.6 briefing fewshots gb' ($safety -match 'fewShotExamples' -and $safety -match 'GB' -and $technical -match 'GB')
Check 'M29.7 summary prompts' ((Test-Path 'apps/api/src/prompts/report/daily-summary.prompt.ts') -and (Test-Path 'apps/api/src/prompts/report/weekly-summary.prompt.ts') -and (Test-Path 'apps/api/src/prompts/report/monthly-summary.prompt.ts'))
Check 'M29.8 summary cron' ($autoSummary -match 'cron|@Cron|06:30|07:00')
Check 'M29.9 due diligence sources' ($dd -match 'tianyancha' -and $dd -match 'creditchina')
Check 'M29.10 site photo classifier' ($schema -match 'model SitePhoto' -and $schema -match 'defectFound' -and $photoPrompt -match 'photo-classifier|qwen-vl-plus|defectFound' -and $photo -match 'uploadAndClassify')
Check 'M29.11 no heavy deps' (($apiPkg + $webPkg + $workerPkg) -notmatch 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n')

$typecheck = cmd /c "pnpm --config.engine-strict=false typecheck 2>&1"
$typecheckOk = $LASTEXITCODE -eq 0
Check 'M29.12 typecheck' $typecheckOk

Write-Host "RESULT PASS $passed/12"
if ($failed -gt 0) {
  Write-Host $typecheck
  exit 1
}
