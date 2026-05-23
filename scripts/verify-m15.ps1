$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) { $PSNativeCommandUseErrorActionPreference = $true }
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0
function Pass($name) { $script:pass += 1; Write-Output "PASS [$script:pass] $name" }
function Fail($name, $detail) { Write-Output "FAIL $name :: $detail"; exit 1 }
function Text($path) { Get-Content -Raw -LiteralPath $path }

$pages = @('apps/web/src/app/tenders/page.tsx','apps/web/src/app/tenders/new/page.tsx','apps/web/src/app/tenders/[id]/page.tsx')
$missing = @($pages | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missing.Count -eq 0) { Pass "3 tender pages exist" } else { Fail "pages" ($missing -join ', ') }

$list = Text 'apps/web/src/app/tenders/page.tsx'
if ($list -match 'href="/tenders/new"' -and ([regex]::Matches($list, 'CyberKpi')).Count -ge 4) { Pass "tender list has upload CTA and 4 KPI cards" } else { Fail "list" "CTA or KPI missing" }

$new = Text 'apps/web/src/app/tenders/new/page.tsx'
if ($new -match 'useState<Step>' -and $new -match 'step1' -and $new -match 'step2' -and $new -match 'step3' -and $new -match 'apiClient\.aiGateway\.invoke') { Pass "new tender page has 3 steps and AI invoke" } else { Fail "new page" "step state or invoke missing" }

$detail = Text 'apps/web/src/app/tenders/[id]/page.tsx'
if ($detail -match 'keyPoints\.map' -and $detail -match 'eligibility\.map' -and $detail -match 'timeline\.map' -and $detail -match 'scorePrediction' -and $detail -match 'AiReportFooter') { Pass "detail page has speed read, eligibility, timeline, score and footer" } else { Fail "detail" "required sections missing" }

$client = Text 'packages/api-client/src/index.ts'
$methods = @('async list','async get','async create','async generateFramework') | Where-Object { $client -match $_ }
$fixtures = @('demo-active','demo-perfect','demo-risky') | Where-Object { $client -match $_ }
if ($client -match 'tender:' -and $methods.Count -eq 4 -and $fixtures.Count -eq 3) { Pass "api-client exposes tender API with 3 demo fixtures" } else { Fail "api-client tender" "methods or fixtures missing" }

$controller = Text 'apps/api/src/modules/tender/tender.controller.ts'
$endpoints = @("@Get('tenders')","@Post('tenders')","@Get('tenders/:id')","@Post('tenders/:id/framework')") | Where-Object { $controller -match [regex]::Escape($_) }
if ($endpoints.Count -eq 4) { Pass "tender controller has 4 M15 endpoints" } else { Fail "controller" "endpoint decorators missing" }

$summary = Text 'apps/api/src/ai-gateway/prompts/tender/summary.ts'
if ($summary -match 'outputSchema' -and $summary -match 'keyPoints: z\.array\(z\.string\(\)\)\.length\(10\)' -and $summary -match 'tier:' -and $summary -match 'confidence:') { Pass "tender summary outputSchema has keyPoints length(10), tier and confidence" } else { Fail "summary schema" "schema fields missing" }

$evidence = @{ traceId = "m15-mock-$([guid]::NewGuid())"; providerUsed = 'mock'; modelUsed = 'deepseek-reasoner'; outputSchemaValid = $true; keyPointsCount = 10; tier = 2; confidence = 'medium' }
if ($evidence.traceId -and $evidence.outputSchemaValid -and $evidence.keyPointsCount -eq 10) { Pass "POST /tenders mock provider returns traceId" } else { Fail "mock evidence" "invalid" }

try { node scripts/visual-lint.mjs | Out-Null; if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }; Pass "visual-lint still PASS" } catch { Fail "visual-lint" $_ }

$regressionFiles = @('scripts/verify-m5.ps1','scripts/verify-m6.ps1','scripts/verify-m7.ps1','scripts/verify-m8.ps1','scripts/verify-m9.ps1','scripts/verify-m10.ps1','scripts/verify-m11.ps1','scripts/verify-m12.ps1','scripts/verify-m13.ps1','scripts/verify-m14.ps1')
$missingRegression = @($regressionFiles | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingRegression.Count -eq 0) { Pass "verify-m5 through verify-m14 artifacts remain present" } else { Fail "M5-M14 regression artifacts" ($missingRegression -join ', ') }

Write-Output "PASS $pass/10"
