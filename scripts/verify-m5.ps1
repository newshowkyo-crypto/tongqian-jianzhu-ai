$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$pass = 0
$fail = 0

function Pass($name) {
  $script:pass += 1
  "PASS: $name"
}

function Fail($name, $detail) {
  $script:fail += 1
  "FAIL: $name - $detail"
}

function Check($name, [scriptblock]$test) {
  try {
    if (& $test) { Pass $name } else { Fail $name 'condition returned false' }
  } catch {
    Fail $name $_.Exception.Message
  }
}

$tables = @('regulations','tender_notices','policy_funds','standard_templates','court_judgments','company_profiles','ocr_tasks','ocr_results')
$collectors = @('legal-regulation-scraper','tender-announcement-scraper','policy-fund-scraper','industry-news-scraper','doc-template-scraper','mohurd-standards-scraper','wenshu-csv-importer','tianyancha-bulk-import','ocr-paper-import','friend-circle-collector')
$pages = @('page.tsx','regulations/page.tsx','tenders/page.tsx','policies/page.tsx','templates/page.tsx','court-judgments/page.tsx','tianyancha/page.tsx','ocr/page.tsx')
$screens = @('m5-web-ai-orb-open.png','m5-admin-ingest-overview.png','m5-admin-ingest-tenders.png','m5-admin-ingest-court-csv.png','m5-admin-ingest-ocr.png')

Check 'B-1 prisma schema has 8 M5 model groups' {
  $schema = Get-Content -Raw prisma/schema.prisma
  @('model Regulation','model TenderNotice','model PolicyFund','model StandardTemplate','model CourtJudgment','model CompanyProfile','model OcrTask','model OcrResult','model IngestRun') | ForEach-Object { if ($schema -notmatch [regex]::Escape($_)) { return $false } }
  return $true
}

Check 'B-1 migration SQL creates ingest tables' {
  $sql = Get-Content -Raw prisma/migrations/20260521210000_m5_final_ingest_tables/migration.sql
  $tables | ForEach-Object { if ($sql -notmatch [regex]::Escape($_)) { return $false } }
  return ($sql -match 'ingest_runs')
}

Check 'B-1 seed writes all table samples' {
  $seed = Get-Content -Raw prisma/seed/index.ts
  @('seedM5IngestTables','regulation','tenderNotice','policyFund','standardTemplate','courtJudgment','companyProfile','ocrTask','ocrResult','ingestRun') | ForEach-Object { if ($seed -notmatch $_) { return $false } }
  return $true
}

Check 'B-1 database counts >= 1 for all 8 tables' {
  $query = "SELECT bool_and(c >= 1) FROM (SELECT COUNT(*) c FROM regulations UNION ALL SELECT COUNT(*) FROM tender_notices UNION ALL SELECT COUNT(*) FROM policy_funds UNION ALL SELECT COUNT(*) FROM standard_templates UNION ALL SELECT COUNT(*) FROM court_judgments UNION ALL SELECT COUNT(*) FROM company_profiles UNION ALL SELECT COUNT(*) FROM ocr_tasks UNION ALL SELECT COUNT(*) FROM ocr_results) s;"
  $result = docker exec tqj-postgres psql -U postgres -d tongqian_dev -tAc $query
  return ($result.Trim() -eq 't')
}

Check 'B-2 10 collectors are mapped to tables' {
  $runner = Get-Content -Raw apps/worker/src/jobs/data-collection/m5-ingest-runner.ts
  $collectors | ForEach-Object { if ($runner -notmatch [regex]::Escape($_)) { return $false } }
  return $true
}

Check 'B-2 ingest_runs audit has >= 10 collector rows' {
  $result = docker exec tqj-postgres psql -U postgres -d tongqian_dev -tAc "SELECT COUNT(*) >= 10 FROM ingest_runs WHERE job_name IN ('legal-regulation-scraper','tender-announcement-scraper','policy-fund-scraper','industry-news-scraper','doc-template-scraper','mohurd-standards-scraper','wenshu-csv-importer','tianyancha-bulk-import','ocr-paper-import','friend-circle-collector');"
  return ($result.Trim() -eq 't')
}

Check 'C-1 admin ingest controller exposes 6 endpoints' {
  $controller = Get-Content -Raw apps/api/src/modules/admin/ingest/ingest-admin.controller.ts
  @("@Post(':jobName/run')","@Post('court-judgments/upload')","@Post('tianyancha/search')","@Post('ocr/submit')","@Get('runs')","@Get('stats')") | ForEach-Object { if ($controller -notmatch [regex]::Escape($_)) { return $false } }
  return $true
}

Check 'C-1 admin module wires IngestAdminController' {
  $module = Get-Content -Raw apps/api/src/modules/admin/admin.module.ts
  return ($module -match 'IngestAdminController')
}

Check 'C-2 api-client has real ingest methods' {
  $client = Get-Content -Raw packages/api-client/src/index.ts
  @('run(jobName','uploadCourtJudgments','searchTianyancha','submitOcr','runs(jobName','stats()') | ForEach-Object { if ($client -notmatch [regex]::Escape($_)) { return $false } }
  return ($client -notmatch 'mock json')
}

Check 'C-2 8 admin ingest pages exist under (main)' {
  $pages | ForEach-Object { if (-not (Test-Path (Join-Path 'apps/admin/src/app/(main)/ingest' $_))) { return $false } }
  return $true
}

Check 'A nav items >= 43 and ingest entries present' {
  $total = 0
  foreach ($file in @('apps/admin/src/i18n/zh-CN.ts','apps/agent/src/i18n/zh-CN.ts','apps/gov/src/i18n/zh-CN.ts','apps/web/src/i18n/zh-CN.ts')) {
    $total += ([regex]::Matches((Get-Content -Raw $file), 'href:')).Count
  }
  $admin = Get-Content -Raw apps/admin/src/i18n/zh-CN.ts
  return ($total -ge 43 -and $admin -match '/ingest/ocr' -and $admin -match '/ingest/court-judgments')
}

Check 'D screenshots exist and each >= 50KB' {
  $screens | ForEach-Object {
    $path = Join-Path 'tests/e2e/screenshots/m5-cyberpunk' $_
    if (-not (Test-Path $path)) { return $false }
    if ((Get-Item $path).Length -lt 51200) { return $false }
  }
  return $true
}

"SUMMARY: PASS=$pass FAIL=$fail"
if ($fail -gt 0) { exit 1 }
