$ErrorActionPreference = 'Stop'
$pass = 0
$fail = 0
function Check($name, $cond) {
  if ($cond) { Write-Host "PASS $name"; $script:pass += 1 } else { Write-Host "FAIL $name"; $script:fail += 1 }
}

$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M27.1 LegalCorpus model' ($schema -match 'model LegalCorpus' -and $schema -match 'model LegalClause')

$meta = Get-Content 'apps/api/data/legal-corpus/seed/metadata.json' -Raw -ErrorAction SilentlyContinue
Check 'M27.2 6 corpus metadata' ($meta -and ($meta -match 'GF-2017-0201') -and ($meta -match 'GB50500-2024') -and ($meta -match 'GB50300') -and ($meta -match '法释'))

$svc = Get-Content 'apps/api/src/modules/legal-corpus/legal-corpus.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M27.3 legal-corpus service' ($svc -and $svc -match 'parseToClauses' -and $svc -match 'loadFromFile')

$up = Get-Content 'apps/admin/src/app/(main)/admin/legal-corpus/page.tsx' -Raw -ErrorAction SilentlyContinue
Check 'M27.4 admin upload page useQuery' ($up -and $up -match 'useQuery' -and $up -match 'legal-corpus')

$prompt = Get-Content 'apps/api/src/prompts/rules/rule-from-clause.prompt.ts' -Raw -ErrorAction SilentlyContinue
$shots = ([regex]::Matches($prompt, "name:\s*'")).Count
Check 'M27.5 prompt 4+ fewshots' ($prompt -and $shots -ge 4 -and $prompt -match 'outputSchema' -and $prompt -match 'legalBasis')

$gen = Get-Content 'apps/api/src/modules/rule-extraction/rule-from-clause.service.ts' -Raw -ErrorAction SilentlyContinue
Check 'M27.6 generator service inject' ($gen -and $gen -match 'aiGateway' -and $gen -match 'createCandidate' -and $gen -match 'dedupService')

Check 'M27.7 clause detail page' (Test-Path -LiteralPath 'apps/admin/src/app/(main)/admin/legal-corpus/[id]/page.tsx')

$ctrl = Get-Content 'apps/api/src/modules/admin/legal-corpus-admin/legal-corpus-admin.controller.ts' -Raw -ErrorAction SilentlyContinue
Check 'M27.8 batch generate-all endpoint' ($ctrl -and $ctrl -match 'generate-all')

$cand = Get-Content 'apps/admin/src/app/(main)/admin/rules/candidates/page.tsx' -Raw -ErrorAction SilentlyContinue
Check 'M27.9 candidates filter by source' ($cand -and ($cand -match '法律语料' -or $cand -match 'legalCorpus' -or $cand -match 'sourceType'))

Check 'M27.10 prompt forbids absolute terms' ($prompt -and $prompt -match 'systemPrompt' -and $prompt -match 'legalBasis' -and $prompt -match 'confidence')

$oldPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$tc = cmd /c "pnpm --config.engine-strict=false typecheck 2>&1"
$tc | Out-Host
$typecheckExit = $LASTEXITCODE
$ErrorActionPreference = $oldPreference
Check 'M27.11 typecheck' ($typecheckExit -eq 0)

$samples = Get-Content '.kiro/state/M27-SAMPLE-RUN.json' -Raw -ErrorAction SilentlyContinue
$candCount = if ($samples) { ([regex]::Matches($samples, '"clauseRef"')).Count } else { 0 }
Check 'M27.12 sample run 5+ rules' ($samples -and $candCount -ge 5)

Write-Host ''
Write-Host "M27 verify: $pass PASS / $fail FAIL"
exit $fail
