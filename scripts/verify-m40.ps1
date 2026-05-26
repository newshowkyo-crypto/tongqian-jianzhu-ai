$ErrorActionPreference = 'Stop'
$pass = 0
$fail = 0
function Check($name, $condition) {
  if ($condition) { Write-Host "PASS $name"; $script:pass++ } else { Write-Host "FAIL $name"; $script:fail++ }
}
function ReadText($path) { if (Test-Path -LiteralPath $path) { return Get-Content -LiteralPath $path -Raw } return '' }
function HasPath($path) { return Test-Path -LiteralPath $path }

$schema = ReadText 'prisma/schema.prisma'
$govShell = ReadText 'apps/gov/src/app-shell.tsx'
$seedRaw = ReadText 'apps/api/data/policy-funds/seed.ts'
$fundCount = if ($seedRaw -match 'length:\s*32') { 32 } else { ([regex]::Matches($seedRaw, 'code\s*:\s*[`''"]')).Count }
$tplDir = 'apps/api/src/prompts/gov-document/templates'
$tplCount = if (Test-Path -LiteralPath $tplDir) { (Get-ChildItem -LiteralPath $tplDir -Filter '*.prompt.ts').Count } else { 0 }
$tplNames = if (Test-Path -LiteralPath $tplDir) { (Get-ChildItem -LiteralPath $tplDir -Filter '*.prompt.ts').Name -join ',' } else { '' }

Check 'M40.1 gov declarations restored' (HasPath 'apps/gov/src/app/declarations/new/page.tsx')
Check 'M40.2 gov funds restored' ((HasPath 'apps/gov/src/app/funds/page.tsx') -and (HasPath 'apps/gov/src/app/funds/calendar/page.tsx'))
Check 'M40.3 gov personal removed' (-not (Test-Path -LiteralPath 'apps/gov/src/app/personal'))
Check 'M40.4 gov shell positioning' ($govShell -notmatch '涓汉鍔炲叕|personal office' -and $govShell -match '鏀跨瓥|璧勯噾|鍏枃|椤圭洰|Gov|gov')
Check 'M40.5 m39 mistake adr' (HasPath 'docs/decisions/2026-05-26-adr-auto-revert-m39-gov-mistake.md')
Check 'M40.6 PolicyFund 4 model schema' ($schema -match 'model PolicyFund\b' -and $schema -match 'model PolicyFundMatch' -and $schema -match 'model PolicyFundSubscription' -and $schema -match 'model PolicyFundApplication')
Check 'M40.7 30+ funds seeded' ($fundCount -ge 30)
Check 'M40.8 4-layer update + match engine' ((ReadText 'apps/api/src/modules/policy-fund/policy-fund.service.ts') -match 'matchEngine|computeMatch' -and (ReadText 'apps/api/src/modules/policy-fund/policy-fund.service.ts') -match 'subscribe' -and (ReadText 'apps/api/src/modules/policy-fund/policy-fund.service.ts') -match 'remind|notify')
Check 'M40.9 gov document schema' ($schema -match 'model GovDocument' -and $schema -match 'model MeetingMinuteAsr')
Check 'M40.10 gov watermark with ip' ((ReadText 'packages/ui/src/feedback/gov-watermark.tsx') -match 'generatorIp|IP|Internal use')
Check 'M40.11 speech generator + minute asr pages' ((HasPath 'apps/gov/src/app/documents/speech/page.tsx') -and (HasPath 'apps/gov/src/app/documents/minute/page.tsx'))
Check 'M40.12 PolicyDoc + Sourcing 4 model schema' ($schema -match 'model PolicyDoc' -and $schema -match 'model PolicyImpactInterpretation' -and $schema -match 'model SourcingProject' -and $schema -match 'model SourcingChat')
Check 'M40.13 sourcing 2-way sanitizer' ((ReadText 'apps/api/src/modules/sourcing/sanitizer.ts') -match 'sanitize' -and (ReadText 'apps/api/src/modules/sourcing/sourcing.service.ts') -match 'gov_to_company' -and (ReadText 'apps/api/src/modules/sourcing/sourcing.service.ts') -match 'company_to_gov')
Check 'M40.14 web building 11 model schema' ($schema -match 'model Material\b' -and $schema -match 'model Stock\b' -and $schema -match 'model StockMovement' -and $schema -match 'model Subcontract\b' -and $schema -match 'model SubcontractEvaluation' -and $schema -match 'model SubcontractorBlacklist' -and $schema -match 'model ActualCost' -and $schema -match 'model CostBudgetVariance' -and $schema -match 'model QualityCheckpoint' -and $schema -match 'model RectificationOrder' -and $schema -match 'model HazardClosure')
Check 'M40.15 web building 4 pages' ((HasPath 'apps/web/src/app/projects/[id]/materials/page.tsx') -and (HasPath 'apps/web/src/app/projects/[id]/subcontracts/page.tsx') -and (HasPath 'apps/web/src/app/projects/[id]/actual-cost/page.tsx') -and (HasPath 'apps/web/src/app/projects/[id]/quality/page.tsx'))
Check 'M40.16 gov NOT polluted by building modules' (-not (HasPath 'apps/gov/src/app/projects/[id]/materials') -and -not (HasPath 'apps/gov/src/app/projects/[id]/subcontracts') -and -not (HasPath 'apps/gov/src/app/personal'))
Check 'M40.17 gov cn-only routing guard' ((ReadText 'apps/api/src/modules/ai-gateway/gov-only-routing.guard.ts') -match 'aliyun-bailian|deepseek|qwen')
Check 'M40.18 gov no gamification enforcement' ((ReadText 'apps/web/src/lib/gov-no-gamification.ts') -match 'govGamificationDisabled' -and (ReadText 'apps/web/src/lib/gov-no-gamification.ts') -match 'disabled')
$aoSeed = ReadText 'apps/api/data/agent-opportunity-sources/seed.ts'
$aoHasFifteen = $aoSeed -match 'length:\s*5' -and $aoSeed -match 'AGENT_QUAL' -and $aoSeed -match 'AGENT_TENDER' -and $aoSeed -match 'AGENT_FIN'
Check 'M40.19 agent opp 3 model + 15 sources (5 each)' ($schema -match 'model AgentOpportunitySource' -and $schema -match 'model AgentOpportunity\b' -and $schema -match 'model AgentOpportunityMatch' -and $aoHasFifteen)
Check 'M40.20 3 scanners (qual/tender/fin)' ((HasPath 'apps/api/src/modules/agent-opportunity/scanner/qual-scanner.ts') -and (HasPath 'apps/api/src/modules/agent-opportunity/scanner/tender-scanner.ts') -and (HasPath 'apps/api/src/modules/agent-opportunity/scanner/fin-scanner.ts'))
Check 'M40.21 agent crm-3a 3 model + training removed' ($schema -match 'model AgentCustomerNote' -and $schema -match 'model AgentDeal\b' -and $schema -match 'model AgentScript' -and -not (HasPath 'apps/agent/src/app/training/page.tsx') -and (ReadText 'apps/api/src/modules/auth/registration/agent-registration.service.ts') -notmatch 'passTraining' -and (ReadText 'apps/api/src/modules/auth/registration/unified-registration.service.ts') -notmatch '/agent/training')
Check 'M40.22 6-stage deal pipeline + 5 script categories' ((ReadText 'apps/api/src/modules/agent-crm/agent-crm.service.ts') -match 'lead.*contacted.*quoting.*negotiating.*won.*lost' -and (ReadText 'apps/api/src/modules/agent-crm/agent-crm.service.ts') -match 'first_contact.*objection_handling.*negotiation.*closing.*reactivation')
Check 'M40.23 agent crm-3b 4 model' ($schema -match 'model AgentCustomerBinding' -and $schema -match 'model AgentCommissionLedger' -and $schema -match 'model AgentCustomerHealthScore' -and $schema -match 'model AgentKnowledgeArticle')
Check 'M40.24 customer permanent binding unique constraint' ($schema -match 'customerTenantId String\s+@unique')
Check 'M40.25 commission ledger 4-state machine' ((ReadText 'apps/api/src/modules/agent-crm/customer-binding.service.ts') -match 'frozen.*settlable.*withdrawable.*paid')
Check 'M40.26 cockpit + knowledge feed + health score pages' ((HasPath 'apps/agent/src/app/dashboard/cockpit/page.tsx') -and (HasPath 'apps/agent/src/app/knowledge/page.tsx') -and (HasPath 'apps/agent/src/app/customers/[id]/binding/page.tsx'))
Check 'M40.27 ai routing - midlayer + non-gov guard + admin page' ($schema -match 'model AiRoutingMode' -and (HasPath 'apps/api/src/ai-gateway/providers/midlayer-provider.ts') -and (HasPath 'apps/api/src/ai-gateway/routing/non-gov-midlayer.guard.ts') -and (HasPath 'apps/admin/src/app/ai-routing/page.tsx'))
$creds = ReadText 'apps/api/src/modules/admin/credentials/credentials.service.ts'
Check 'M40.28 openrouter removed + midlayer credentials added' ($creds -notmatch 'OPENROUTER_API_KEY' -and $creds -match 'MIDLAYER_API_KEY' -and $creds -match 'MIDLAYER_BASE_URL' -and (ReadText 'prisma/seed/index.ts') -notmatch 'OPENROUTER_API_KEY' -and (ReadText 'packages/api-client/src/index.ts') -notmatch 'OPENROUTER_API_KEY')
Check 'M40.29 12+ gov doc templates incl proposal + feasibility' ($tplNames -match 'project-proposal' -and $tplNames -match 'feasibility-study' -and $tplCount -ge 12)
Check 'M40.30 project proposal + feasibility pages' ((HasPath 'apps/gov/src/app/documents/project-proposal/page.tsx') -and (HasPath 'apps/gov/src/app/documents/feasibility-study/page.tsx'))
Check 'M40.31 policy fund no one-case-two-books' ((ReadText 'apps/api/src/modules/policy-fund/policy-fund.service.ts') -notmatch 'one-case-two-books')
Check 'M40.32 qual 3 tools schema' ($schema -match 'model AgentQualMaterialCheck' -and $schema -match 'model AgentQualPerformanceArchive' -and $schema -match 'model AgentQualPersonnelGap')
Check 'M40.33 qual 3 services real' ((HasPath 'apps/api/src/modules/agent-toolkit/qual-material-check.service.ts') -and (HasPath 'apps/api/src/modules/agent-toolkit/qual-personnel-gap.service.ts') -and (HasPath 'apps/api/src/modules/agent-toolkit/qual-performance-archive.service.ts'))
Check 'M40.34 tender 3 tools schema' ($schema -match 'model AgentTenderQualifyMatch' -and $schema -match 'model AgentTenderProposalDraft' -and $schema -match 'model AgentTenderQaResponse')
Check 'M40.35 tender 3 services + proposal reuses M28 RFP RAG' ((HasPath 'apps/api/src/modules/agent-toolkit/tender-qualify-match.service.ts') -and (HasPath 'apps/api/src/modules/agent-toolkit/tender-proposal-draft.service.ts') -and (HasPath 'apps/api/src/modules/agent-toolkit/tender-qa-response.service.ts') -and (ReadText 'apps/api/src/modules/agent-toolkit/tender-proposal-draft.service.ts') -match 'RfpRag|tool-registry|M28|RFP')
Check 'M40.36 fin 2 tools + quick reply schema' ($schema -match 'model AgentFinFinancingProposal' -and $schema -match 'model AgentFinCreditReport' -and $schema -match 'model AgentQuickReplySession')
Check 'M40.37 quick reply 3 tones' ((ReadText 'apps/api/src/modules/agent-toolkit/quick-reply.service.ts') -match 'professional' -and (ReadText 'apps/api/src/modules/agent-toolkit/quick-reply.service.ts') -match 'friendly' -and (ReadText 'apps/api/src/modules/agent-toolkit/quick-reply.service.ts') -match 'urgent')
Check 'M40.38 toolkit entry + quick-reply page + dashboard top card' ((HasPath 'apps/agent/src/app/toolkit/page.tsx') -and (HasPath 'apps/agent/src/app/toolkit/quick-reply/page.tsx') -and (ReadText 'apps/agent/src/app/dashboard/page.tsx') -match 'toolkit')
$disHits = (Get-ChildItem apps/*/src -Recurse -Include *.tsx -ErrorAction SilentlyContinue | Select-String 'AiDisclaimer' -List).Count
Check 'M40.39 AiDisclaimer 38+ usage' ($disHits -ge 38)
$pkgText = (Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue) -join "`n"
$heavy = $pkgText -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex|whisper'
pnpm --config.engine-strict=false --filter @tongqian/types typecheck | Out-Null
pnpm --config.engine-strict=false --filter @tongqian/ui typecheck | Out-Null
pnpm --config.engine-strict=false --filter @tongqian/api typecheck | Out-Null
pnpm --config.engine-strict=false --filter @tongqian/web typecheck | Out-Null
pnpm --config.engine-strict=false --filter @tongqian/gov typecheck | Out-Null
pnpm --config.engine-strict=false --filter @tongqian/agent typecheck | Out-Null
pnpm --config.engine-strict=false --filter @tongqian/admin typecheck | Out-Null
$tc = $LASTEXITCODE
$vl = node scripts/visual-lint.mjs
$vlOk = $LASTEXITCODE -eq 0 -and (($vl -join "`n") -match 'PASS visual-lint')
Check 'M40.40 quality gates + no heavy deps' ($tc -eq 0 -and $vlOk -and -not $heavy)
Write-Host "M40 verify: $pass PASS / $fail FAIL"
if ($fail -ne 0) { exit 1 }
