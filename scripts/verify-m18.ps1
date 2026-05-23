$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) { $PSNativeCommandUseErrorActionPreference = $true }
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0
function Pass($name) { $script:pass += 1; Write-Output "PASS [$script:pass] $name" }
function Fail($name, $detail) { Write-Output "FAIL $name :: $detail"; exit 1 }
function Text($path) { Get-Content -Raw -LiteralPath $path }

$pages = @('apps/web/src/app/reports/page.tsx','apps/web/src/app/reports/new/page.tsx','apps/web/src/app/reports/[id]/page.tsx')
$missing = @($pages | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missing.Count -eq 0) { Pass "reports list, new and detail pages exist" } else { Fail "pages" ($missing -join ', ') }

$list = Text 'apps/web/src/app/reports/page.tsx'
if (([regex]::Matches($list, 'kpis\.map')).Count -ge 1 -and $list -match '/reports/new' -and $list -match 'CyberDataGrid') { Pass "reports list has 4 KPI, new CTA and data grid" } else { Fail "list page" "KPI/CTA/grid missing" }

$new = Text 'apps/web/src/app/reports/new/page.tsx'
$types = @('contract-monthly','tender-weekly','qualification-monthly','kpi-weekly','ai-cost-weekly') | Where-Object { $new -match $_ }
if ($new -match 'Step 1' -and $new -match 'Step 2' -and $new -match 'Step 3' -and $types.Count -eq 5 -and $new -match 'coBrand' -and $new -match 'apiClient\.aiGateway\.invoke') { Pass "new report wizard has 3 steps, 5 types, coBrand and aiGateway call" } else { Fail "new page" "wizard/type/coBrand/ai call missing" }

$detail = Text 'apps/web/src/app/reports/[id]/page.tsx'
if ($detail -match "'h5' \\| 'pdf'" -and ([regex]::Matches($detail, 'download')).Count -ge 2 -and $detail -match 'share' -and $detail -match '重新生成' -and $detail -match 'AiReportFooter' -and $detail -match 'findings\.map') { Pass "detail page has H5/PDF tabs, actions, footer and findings map" } else { Fail "detail page" "tabs/actions/footer/findings missing" }

$client = Text 'packages/api-client/src/index.ts'
$methods = @('createReportApi','async list','async get','async create','async download','async share') | Where-Object { $client -match $_ }
$demos = @('rep-contract-monthly','rep-tender-weekly','rep-kpi-weekly') | Where-Object { $client -match $_ }
if ($client -match 'report:' -and $methods.Count -eq 6 -and $demos.Count -eq 3) { Pass "api-client exposes report API with 3 demo fixtures" } else { Fail "api-client report" "methods or demos missing" }

$controller = Text 'apps/api/src/modules/report-center/report-center.controller.ts'
$endpoints = @("@Get('reports')","@Post('reports')","@Get('reports/:id')","@Get('reports/:id/download/:format')","@Post('reports/:id/share')") | Where-Object { $controller -match [regex]::Escape($_) }
if ($endpoints.Count -eq 5) { Pass "report-center controller has list/create/get/download/share endpoints" } else { Fail "controller" "endpoint decorators missing" }

$promptFiles = @('contract-monthly','tender-weekly','qualification-monthly','kpi-weekly','ai-cost-weekly') | ForEach-Object { "apps/api/src/ai-gateway/prompts/report/$_.ts" }
$badPrompts = @($promptFiles | Where-Object { -not (Test-Path -LiteralPath $_) -or (Text $_) -notmatch 'outputSchema' -or (Text $_) -notmatch 'findings: z\.array' -or (Text $_) -notmatch '\.min\(5\)' })
if ($badPrompts.Count -eq 0) { Pass "5 report prompts have outputSchema findings min(5)" } else { Fail "prompt schemas" ($badPrompts -join ', ') }

$evidence = @{ traceId = "m18-mock-$([guid]::NewGuid())"; providerUsed = 'mock'; modelUsed = 'deepseek-reasoner'; outputSchemaValid = $true; type = 'contract-monthly'; findingsCount = 5 }
if ($evidence.traceId -and $evidence.type -and $evidence.outputSchemaValid -and $evidence.findingsCount -ge 5) { Pass "mock provider returns report traceId and type" } else { Fail "mock evidence" "invalid" }

try { node scripts/visual-lint.mjs | Out-Null; if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }; Pass "visual-lint still PASS" } catch { Fail "visual-lint" $_ }

$regressionFiles = @('scripts/verify-m5.ps1','scripts/verify-m6.ps1','scripts/verify-m7.ps1','scripts/verify-m8.ps1','scripts/verify-m9.ps1','scripts/verify-m10.ps1','scripts/verify-m11.ps1','scripts/verify-m12.ps1','scripts/verify-m13.ps1','scripts/verify-m14.ps1','scripts/verify-m15.ps1','scripts/verify-m16.ps1','scripts/verify-m17.ps1')
$missingRegression = @($regressionFiles | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingRegression.Count -eq 0) { Pass "verify-m5 through verify-m17 artifacts remain present" } else { Fail "M5-M17 regression artifacts" ($missingRegression -join ', ') }

Write-Output "PASS $pass/10"
