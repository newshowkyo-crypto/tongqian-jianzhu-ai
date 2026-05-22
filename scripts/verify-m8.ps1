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
    if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
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

Run "typecheck, lint, test 9 M8 packages" "pnpm --config.engine-strict=false --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/ui build; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov typecheck; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov lint; pnpm --config.engine-strict=false --filter @tongqian/ui --filter @tongqian/types --filter @tongqian/constants --filter @tongqian/errors --filter @tongqian/api --filter @tongqian/admin --filter @tongqian/web --filter @tongqian/agent --filter @tongqian/gov test"

$ruleController = Get-Content -Raw apps/api/src/modules/rule-curation/rule-curation.controller.ts
$ruleEndpoints = @("Post\('extract'\)", "Get\('candidates'\)", "Patch\('candidates/:id'\)", "Post\('candidates/:id/approve'\)", "Post\('candidates/:id/reject'\)", "Get\('list'\)", "Get\(':id/versions'\)", "Post\(':id/rollback'\)")
$missingRule = $ruleEndpoints | Where-Object { $ruleController -notmatch $_ }
if ((Test-Path apps/api/src/modules/rule-curation) -and $missingRule.Count -eq 0) { Pass "rule-curation module exists with 8 endpoints" } else { Fail "rule-curation endpoints" ($missingRule -join ', ') }

$knowledgeController = Get-Content -Raw apps/api/src/modules/knowledge-curation/knowledge-curation.controller.ts
$knowledgeEndpoints = @("Post\('upload'\)", "Post\(':id/parse'\)", "Get\('list'\)", "Patch\(':id'\)", "Delete\(':id'\)", "Get\('stats'\)")
$missingKnowledge = $knowledgeEndpoints | Where-Object { $knowledgeController -notmatch $_ }
if ((Test-Path apps/api/src/modules/knowledge-curation) -and $missingKnowledge.Count -eq 0) { Pass "knowledge-curation module exists with 6 endpoints" } else { Fail "knowledge-curation endpoints" ($missingKnowledge -join ', ') }

$goldenController = Get-Content -Raw apps/api/src/modules/prompt-testing-curation/prompt-testing-curation.controller.ts
$goldenEndpoints = @("@Get\(\)", "@Post\(\)", "Patch\(':id'\)", "Post\(':id/run'\)", "Get\('coverage'\)", "Post\('run-all'\)")
$missingGolden = $goldenEndpoints | Where-Object { $goldenController -notmatch $_ }
if ((Test-Path apps/api/src/modules/prompt-testing-curation) -and $missingGolden.Count -eq 0) { Pass "prompt-testing-curation module exists with 6 endpoints" } else { Fail "prompt-testing-curation endpoints" ($missingGolden -join ', ') }

$rulePages = @('apps/admin/src/app/admin/rules/page.tsx','apps/admin/src/app/admin/rules/candidates/page.tsx','apps/admin/src/app/admin/rules/qualification/page.tsx','apps/admin/src/app/admin/rules/contract/page.tsx','apps/admin/src/app/admin/rules/tender/page.tsx','apps/admin/src/app/admin/rules/reference-price/page.tsx')
$missing = $rulePages | Where-Object { -not (Test-Path $_) }
if ($missing.Count -eq 0) { Pass "6 admin rules pages exist" } else { Fail "admin rules pages" ($missing -join ', ') }

$knowledgePages = @('apps/admin/src/app/admin/knowledge/page.tsx','apps/admin/src/app/admin/knowledge/upload/page.tsx','apps/admin/src/app/admin/knowledge/regulation/page.tsx','apps/admin/src/app/admin/knowledge/standard/page.tsx','apps/admin/src/app/admin/knowledge/case/page.tsx','apps/admin/src/app/admin/knowledge/policy/page.tsx','apps/admin/src/app/admin/knowledge/rfp/page.tsx','apps/admin/src/app/admin/knowledge/template/page.tsx')
$missing = $knowledgePages | Where-Object { -not (Test-Path $_) }
if ($missing.Count -eq 0) { Pass "8 admin knowledge pages exist" } else { Fail "admin knowledge pages" ($missing -join ', ') }

$goldenPages = @('apps/admin/src/app/admin/golden-tests/page.tsx','apps/admin/src/app/admin/golden-tests/run/page.tsx','apps/admin/src/app/admin/golden-tests/[taskType]/new/page.tsx')
$missing = $goldenPages | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing.Count -eq 0) { Pass "golden-tests routes exist" } else { Fail "golden-tests pages" ($missing -join ', ') }

$risk = Get-Content -Raw apps/api/src/modules/risk-review/risk-review.service.ts
$qual = Get-Content -Raw apps/api/src/modules/qualification/qualification.service.ts
$tender = Get-Content -Raw apps/api/src/modules/tender/tender.service.ts
if ($risk -match 'RulesService' -and $risk -match '\.matchContract\(' -and $qual -match 'RulesService' -and $qual -match '\.matchQualification\(' -and $tender -match 'RulesService' -and $tender -match '\.matchTender\(') {
  Pass "risk, qualification, tender services call RulesService.match*"
} else {
  Fail "RulesService business chain" "missing match call"
}

$builder = Get-Content -Raw apps/api/src/ai-gateway/prompt-builder.service.ts
if ($builder -match 'matchedRules' -and $builder -match 'knowledgeRefs' -and $builder -match '<matched_rules>' -and $builder -match '<knowledge_refs>') {
  Pass "PromptBuilder accepts matchedRules and knowledgeRefs context"
} else {
  Fail "PromptBuilder context" "missing matchedRules/knowledgeRefs"
}

$schema = Get-Content -Raw prisma/schema.prisma
if ($schema -match 'grayPercent\s+Int\s+@default\(0\)\s+@map\("gray_percent"\)' -and $schema -match 'model PromptQualityReport' -and $schema -match '@@map\("prompt_quality_reports"\)') {
  Pass "Prisma has RuleVersion.gray_percent and prompt_quality_reports"
} else {
  Fail "Prisma M8 schema" "missing gray_percent or prompt_quality_reports"
}

$candidateHits = (rg -n 'rule-curation.*createCandidate' apps/worker/src/jobs/data-collection 2>$null | Measure-Object).Count
if ($candidateHits -ge 7) { Pass "data collection 7 sources connect to rule candidate pool" } else { Fail "collector candidate pool" "hits=$candidateHits" }

$stubHits = rg -n 'Coming Soon|TODO: implement' apps/api/src/modules/rule-curation apps/api/src/modules/knowledge-curation apps/api/src/modules/prompt-testing-curation apps/admin/src/app/admin/rules apps/admin/src/app/admin/knowledge apps/admin/src/app/admin/golden-tests apps/admin/src/components/business-fuel-page.tsx 2>$null
if (-not $stubHits) { Pass "no Coming Soon or TODO implement in M8 modules" } else { Fail "stub text grep" ($stubHits -join "`n") }

try {
  node .kiro/state/m8-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
} catch {
  Fail "M8 screenshot capture" $_
}

$expected = @(
  'm8-rules-overview-zh.png',
  'm8-rules-candidates-review-zh.png',
  'm8-knowledge-overview-zh.png',
  'm8-knowledge-upload-zh.png',
  'm8-golden-tests-coverage-zh.png',
  'm8-rules-version-rollback-zh.png'
)
$badShots = @()
foreach ($name in $expected) {
  $path = Join-Path 'tests/e2e/screenshots/m8' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
if ($badShots.Count -eq 0) { Pass "6 M8 screenshots each >= 200KB and IDAT >= 5" } else { Fail "M8 screenshots" ($badShots -join '; ') }

$m5 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m5.ps1
if ($LASTEXITCODE -eq 0 -and (($m5 -join "`n") -match 'PASS 12/12' -or ($m5 -join "`n") -match 'PASS=12 FAIL=0')) {
  $m6 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m6.ps1
  if ($LASTEXITCODE -eq 0 -and (($m6 -join "`n") -match 'PASS 18/18' -or ($m6 -join "`n") -match 'PASS=18 FAIL=0')) {
    $m7 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m7.ps1
    if ($LASTEXITCODE -eq 0 -and (($m7 -join "`n") -match 'PASS 14/14' -or ($m7 -join "`n") -match 'PASS=14 FAIL=0')) {
      Pass "verify-m5, verify-m6, verify-m7 still all PASS"
    } else { Fail "verify-m7 regression" ($m7 -join "`n") }
  } else { Fail "verify-m6 regression" ($m6 -join "`n") }
} else { Fail "verify-m5 regression" ($m5 -join "`n") }

Write-Output "PASS $pass/14"
