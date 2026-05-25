$ErrorActionPreference = 'Stop'
$pass = 0; $fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name"; $script:pass++ } else { Write-Host "FAIL $name"; $script:fail++ } }

$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M30.1 budget schema' ($schema -match 'model BaselineUnitCost' -and $schema -match 'model BudgetEstimate' -and $schema -match 'coefficients')
$bud = Get-Content 'apps/api/src/modules/cost-estimate/budget-estimator.service.ts' -Raw
Check 'M30.2 budget formula 5 coefficients' ($bud -and $bud -match 'region' -and $bud -match 'quality' -and $bud -match 'category' -and $bud -match 'structure' -and $bud -match 'time')
$bcsv = Get-Content 'apps/api/data/cost-baseline/seed/baseline-unit-cost.csv' -ErrorAction SilentlyContinue
Check 'M30.3 baseline csv 100+ rows' ($bcsv -and $bcsv.Length -ge 100)
Check 'M30.4 quantity schema' ($schema -match 'model QuantityIndicator' -and $schema -match 'model RoughQuantityEstimate')
$qcsv = Get-Content 'apps/api/data/quantity-indicators/seed/indicators.csv' -ErrorAction SilentlyContinue
Check 'M30.5 quantity csv 100+ rows' ($qcsv -and $qcsv.Length -ge 100)
$pl = Get-Content 'apps/api/src/modules/project-site/payment-ledger.service.ts' -Raw
Check 'M30.6 payment 5 events' ($pl -and $pl -match 'contract_signed' -and $pl -match 'work_completed' -and $pl -match 'invoice_issued' -and $pl -match 'payment_received')
Check 'M30.7 change/claim schema' ($schema -match 'model ChangeOrder' -and $schema -match 'model ClaimRecord' -and $schema -match 'submitDeadline' -and $schema -match 'aiSuccessScore')
$cl = Get-Content 'apps/api/src/modules/project-site/claim-record.service.ts' -Raw
Check 'M30.8 claim deadline alerts' ($cl -match 'deadline' -and ($cl -match '7|3|1|alert|notify'))
Check 'M30.9 carbon schema' ($schema -match 'model CarbonFactor' -and $schema -match 'model CarbonEstimate')
$ccsv = Get-Content 'apps/api/data/carbon-factors/seed/factors.csv' -ErrorAction SilentlyContinue
Check 'M30.10 carbon factors 30+ rows' ($ccsv -and $ccsv.Length -ge 30)
Check 'M30.11 task schema' ($schema -match 'model ProjectTask' -and $schema -match 'model TaskComment' -and $schema -match 'relatedScheduleTaskId')
$tb = Get-Content -LiteralPath 'apps/web/src/app/projects/[id]/tasks/page.tsx' -Raw
Check 'M30.12 task kanban 4 columns' ($tb -and $tb -match 'todo' -and $tb -match 'doing' -and $tb -match 'blocked' -and $tb -match 'done')
$pkg = Get-Content 'apps/api/package.json','apps/web/package.json','apps/worker/package.json' -Raw -ErrorAction SilentlyContinue
$hasHeavy = $pkg -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad'
Check 'M30.13 no heavy deps' (-not $hasHeavy)
cmd /c "pnpm --config.engine-strict=false typecheck 2>&1" | Out-Null
Check 'M30.14 typecheck' ($LASTEXITCODE -eq 0)
Write-Host "M30 verify: $pass PASS / $fail FAIL"
exit $fail
