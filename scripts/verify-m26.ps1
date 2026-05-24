$ErrorActionPreference = 'Stop'

$pass = 0
$fail = 0

function Check($name, $ok) {
  if ($ok) {
    $script:pass += 1
    Write-Host "PASS $name"
  } else {
    $script:fail += 1
    Write-Host "FAIL $name"
  }
}

$fetchers = @('cebpubservice', 'wenshu', 'creditchina', 'mohurd', 'mof', 'ndrc')
foreach ($source in $fetchers) {
  $file = "apps/worker/src/crawlers/$source.fetcher.ts"
  $raw = Get-Content $file -Raw
  Check "M26 fetcher $source real http" ($raw -match 'fetch\(' -or $raw -match 'http\.get')
}

$base = Get-Content 'apps/worker/src/crawlers/base-fetcher.ts' -Raw
Check 'M26 base fetcher framework' ($base -match 'abstract class BaseFetcher' -and $base -match 'robots' -and $base -match 'ingest_runs')

$queue = Get-Content 'apps/worker/src/queues/crawler.queue.ts' -Raw
Check 'M26 bullmq schedule' ($queue -match 'BullMQ' -and $queue -match 'cebpubservice' -and $queue -match 'ndrc')

$extract = Get-Content 'apps/api/src/modules/rule-extraction/rule-extraction.service.ts' -Raw
$prompt = Get-Content 'apps/api/src/prompts/rules/rule-extract.prompt.ts' -Raw
Check 'M26 ai extraction prompt' ($extract -match 'AiGatewayService' -and $extract -match 'createCandidate' -and $extract -match 'extract_trace_id' -and $prompt -match 'zod' -and $prompt -match 'fewShotExamples' -and $prompt -match 'fallbackText')

$timeliness = Get-Content 'apps/api/src/modules/rule-extraction/timeliness.service.ts' -Raw
$dedup = Get-Content 'apps/api/src/modules/rule-extraction/dedup.service.ts' -Raw
$deprecate = Get-Content 'apps/api/src/modules/rule-extraction/auto-deprecate.service.ts' -Raw
Check 'M26 governance scoring dedup deprecate' ($timeliness -match 'sourceAuthority' -and $dedup -match '0.85' -and $deprecate -match 'rule.deprecate.soft')

$admin = Get-Content 'apps/api/src/modules/admin/rule-candidates/rule-candidates.controller.ts' -Raw
$page = Get-Content 'apps/admin/src/app/(main)/admin/rules/candidates/page.tsx' -Raw
Check 'M26 admin candidates review' ($admin -match 'batch' -and $page -match 'useQuery' -and $page -match 'rule-candidates')

$oldPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$typecheck = cmd /c "pnpm --config.engine-strict=false typecheck 2>&1"
$typecheck | Out-Host
$typecheckExit = $LASTEXITCODE
$ErrorActionPreference = $oldPreference
Check 'M26 typecheck' ($typecheckExit -eq 0)

Write-Host "M26 verify: $pass PASS / $fail FAIL"
exit $fail
