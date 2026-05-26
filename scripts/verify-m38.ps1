$ErrorActionPreference = 'Continue'
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n"; $script:pass++ } else { Write-Host "FAIL $n"; $script:fail++ } }

pnpm --config.engine-strict=false --filter @tongqian/api lint 2>&1 | Out-Null
Check 'M38.1 api lint pass' ($LASTEXITCODE -eq 0)

pnpm --config.engine-strict=false lint 2>&1 | Out-Null
Check 'M38.2 full lint pass' ($LASTEXITCODE -eq 0)

Check 'M38.3 AiDisclaimer component' (Test-Path 'packages/ui/src/feedback/ai-disclaimer.tsx')

$disHits = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'AiDisclaimer' -List).Count
Check 'M38.4 AiDisclaimer usage 8+' ($disHits -ge 8)

$tpl = Get-Content 'apps/api/src/modules/bi/bi-templates.ts' -Raw -ErrorAction SilentlyContinue
$tplCount = if ($tpl) { ([regex]::Matches($tpl, "id:\s*'")).Count } else { 0 }
Check 'M38.5 bi 30+ templates' ($tplCount -ge 30)
$bisvc = Get-Content 'apps/api/src/modules/bi/bi-query.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M38.6 bi tenant guard' ($bisvc -and $bisvc -match 'tenantId')

$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M38.7 BidProposal schema' ($schema -match 'model BidProposal' -and $schema -match 'scoringCriteria')
$bidPrompt = Get-Content 'apps/api/src/prompts/tender/bid-section-generator.prompt.ts' -Raw -ErrorAction SilentlyContinue
$bidShots = if ($bidPrompt) { ([regex]::Matches($bidPrompt, "name:\s*'")).Count } else { 0 }
Check 'M38.8 bid prompt 5+ fewshots no absolute' ($bidShots -ge 5 -and $bidPrompt.Contains('guaranteed win'))

Check 'M38.9 decision advisor' ((Test-Path 'apps/api/src/prompts/decision/bid-go-no-go.prompt.ts') -and (Test-Path 'apps/api/src/modules/decision/decision-advisor.service.ts'))

$followup = Get-Content 'apps/api/src/prompts/agent/followup-script-generator.prompt.ts' -Raw -ErrorAction SilentlyContinue
Check 'M38.10 followup 5 scenarios' ($followup -and ($followup -match 'inquiry_no_order') -and ($followup -match 'free_quota') -and ($followup -match 'renewal') -and ($followup -match 'payment_failed') -and ($followup -match 'report_unread'))
Check 'M38.11 AgentFollowupReminder schema' ($schema -match 'model AgentFollowupReminder')

$nextCfg = Get-Content 'apps/web/next.config.mjs' -Raw
Check 'M38.12 next-pwa configured' ($nextCfg -match 'next-pwa|withPWA')
Check 'M38.13 offline-queue' (Test-Path 'apps/web/src/lib/offline-queue.ts')

$src = Get-Content 'apps/api/data/policy-sources/sources-31-provinces.json' -Raw -ErrorAction SilentlyContinue
$provinceCount = if ($src) { ([regex]::Matches($src, '"province":')).Count } else { 0 }
Check 'M38.14 31 provinces' ($provinceCount -ge 31)

$ops = Get-Content 'apps/api/src/prompts/agent/customer-ops.prompt.ts' -Raw -ErrorAction SilentlyContinue
$opsTypes = if ($ops) { ([regex]::Matches($ops, 'moments|holiday|followUp|renewal')).Count } else { 0 }
Check 'M38.15 customer ops 4 types' ($opsTypes -ge 4)

$pkgs = Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue
$heavy = $pkgs -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex'
Check 'M38.16 no heavy deps' (-not $heavy)

pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null
$tc = $LASTEXITCODE
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$vlHits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M38.17 typecheck + visual-lint' ($tc -eq 0 -and $vlHits -eq 0)

pnpm --config.engine-strict=false test 2>&1 | Out-Null
Check 'M38.18 test pass' ($LASTEXITCODE -eq 0)

Write-Host ""
Write-Host "M38 verify: $pass PASS / $fail FAIL"
exit $fail
