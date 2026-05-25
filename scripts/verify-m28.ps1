$ErrorActionPreference = 'Stop'
$pass = 0; $fail = 0
function Check($name, $cond) { if ($cond) { Write-Host "PASS $name"; $script:pass++ } else { Write-Host "FAIL $name"; $script:fail++ } }
$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M28.1 CostCatalog + CostItem' ($schema -match 'model CostCatalog' -and $schema -match 'model CostItem')
$svc = Get-Content 'apps/api/src/modules/cost-catalog/cost-catalog.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M28.2 cost-catalog importFromCsv stream' ($svc -and $svc -match 'importFromCsv' -and $svc -match 'csv-parse')
Check 'M28.3 cost prompts text/photo/cad' ((Test-Path 'apps/api/src/prompts/cost/cost-from-text.prompt.ts') -and (Test-Path 'apps/api/src/prompts/cost/cost-from-photo.prompt.ts') -and (Test-Path 'apps/api/src/prompts/cost/cost-from-cad.prompt.ts'))
$textPrompt = Get-Content 'apps/api/src/prompts/cost/cost-from-text.prompt.ts' -Raw
Check 'M28.4 cost prompt has disclaimer + cwicr source flag' ($textPrompt -match 'disclaimer' -and $textPrompt -match 'cwicr|ai_estimate')
$rfp = Get-Content 'apps/api/src/modules/tender/rfp-rag.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M28.5 rfp-rag service' ($rfp -and $rfp -match 'searchAcrossRfp' -and $rfp -match 'ingestRfpDocs')
Check 'M28.6 RfpChunk schema' ($schema -match 'model RfpChunk')
$rf = Get-Content 'apps/api/data/contract-red-flags/zh-CN-construction.json' -Raw -ErrorAction SilentlyContinue
$count = if ($rf) { ([regex]::Matches($rf, '"id"')).Count } else { 0 }
Check 'M28.7 red flag 38 items' ($count -ge 38)
$rfs = Get-Content 'apps/api/src/modules/risk-review/red-flag-scan.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M28.8 red-flag-scan service' ($rfs -and $rfs -match 'scan' -and $rfs -match 'regex|keywords')
$tools = Get-Content 'apps/api/src/modules/chat-hub/tool-registry.service.ts' -Raw -ErrorAction SilentlyContinue
$toolCount = if ($tools) { ([regex]::Matches($tools, "name:\s*'(list|query|search)_")).Count } else { 0 }
Check 'M28.9 17 tools registered' ($toolCount -ge 17)
$exp = Get-Content 'apps/api/src/modules/report-center/report-export.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M28.10 4 export formats' ($exp -and $exp -match 'exportPdf' -and $exp -match 'exportDocx' -and $exp -match 'exportXlsx' -and $exp -match 'exportPptx')
$qc = Get-Content 'apps/api/src/modules/report-center/quality-check.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M28.11 quality-check 5 items' ($qc -and $qc -match 'disclaimer' -and $qc -match 'tier' -and $qc -match 'confidence')
$oldPreference = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
$tc = cmd /c "pnpm --config.engine-strict=false typecheck 2>&1"; $tc | Out-Host; $typecheckExit = $LASTEXITCODE; $ErrorActionPreference = $oldPreference
Check 'M28.12 typecheck' ($typecheckExit -eq 0)
Write-Host ""; Write-Host "M28 verify: $pass PASS / $fail FAIL"; exit $fail
