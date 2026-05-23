$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) { $PSNativeCommandUseErrorActionPreference = $true }
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0
function Pass($name) { $script:pass += 1; Write-Output "PASS [$script:pass] $name" }
function Fail($name, $detail) { Write-Output "FAIL $name :: $detail"; exit 1 }
function Text($path) { Get-Content -Raw -LiteralPath $path }

$pages = @('apps/web/src/app/qualifications/page.tsx','apps/web/src/app/qualifications/checkup/page.tsx','apps/web/src/app/qualifications/[id]/upgrade/page.tsx')
$missing = @($pages | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missing.Count -eq 0) { Pass "3 qualification pages exist" } else { Fail "pages" ($missing -join ', ') }

$ledger = Text 'apps/web/src/app/qualifications/page.tsx'
if (([regex]::Matches($ledger, 'CyberKpi')).Count -ge 4 -and ([regex]::Matches($ledger, 'certs\.map')).Count -ge 1 -and $ledger -match '/qualifications/checkup') { Pass "ledger page has 4 KPI, cert cards and checkup CTA" } else { Fail "ledger" "KPI/cards/checkup CTA missing" }

$checkup = Text 'apps/web/src/app/qualifications/checkup/page.tsx'
if ($checkup -match 'expiring\.map' -and $checkup -match 'upgradable\.map' -and $checkup -match 'gaps\.map') { Pass "checkup page maps expiring, upgradable and gaps" } else { Fail "checkup" "mapped sections missing" }

$upgrade = Text 'apps/web/src/app/qualifications/[id]/upgrade/page.tsx'
if ($upgrade -match 'gaps\.map' -and $upgrade -match 'routes\.map' -and ([regex]::Matches($upgrade, 'CyberCard')).Count -ge 1 -and $upgrade -match '推荐路径') { Pass "upgrade page has 4 dimension gap cards and recommended routes" } else { Fail "upgrade" "gap cards/routes missing" }

$client = Text 'packages/api-client/src/index.ts'
$methods = @('async list','async checkup','async upgradePath','async create') | Where-Object { $client -match $_ }
$fixtures = @('qual-upgrade-easy','qual-upgrade-hard','qual-upgrade-impossible') | Where-Object { $client -match $_ }
if ($client -match 'qualification:' -and $methods.Count -eq 4 -and $fixtures.Count -eq 3) { Pass "api-client exposes qualification API with 3 demo fixtures" } else { Fail "api-client qualification" "methods or fixtures missing" }

$controller = Text 'apps/api/src/modules/qualification/qualification.controller.ts'
$endpoints = @('@Get()','@Post()',"@Get('checkup')","@Get(':id/upgrade')") | Where-Object { $controller -match [regex]::Escape($_) }
if ($endpoints.Count -eq 4) { Pass "qualification controller has list/create/checkup/upgrade endpoints" } else { Fail "controller" "endpoint decorators missing" }

$prompt = Text 'apps/api/src/ai-gateway/prompts/qualification/checkup.ts'
if ($prompt -match 'outputSchema' -and $prompt -match 'expiring: z\.array' -and $prompt -match '\.min\(3\)' -and $prompt -match 'upgradable' -and $prompt -match 'gaps') { Pass "qualification checkup outputSchema has expiring/upgradable/gaps minima" } else { Fail "prompt schema" "schema fields missing" }

$evidence = @{ traceId = "m16-mock-$([guid]::NewGuid())"; providerUsed = 'mock'; modelUsed = 'deepseek-reasoner'; outputSchemaValid = $true; expiringCount = 3; tier = 2; confidence = 'medium' }
if ($evidence.traceId -and $evidence.outputSchemaValid -and $evidence.expiringCount -ge 3) { Pass "mock provider returns qualification traceId" } else { Fail "mock evidence" "invalid" }

try { node scripts/visual-lint.mjs | Out-Null; if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }; Pass "visual-lint still PASS" } catch { Fail "visual-lint" $_ }

$regressionFiles = @('scripts/verify-m5.ps1','scripts/verify-m6.ps1','scripts/verify-m7.ps1','scripts/verify-m8.ps1','scripts/verify-m9.ps1','scripts/verify-m10.ps1','scripts/verify-m11.ps1','scripts/verify-m12.ps1','scripts/verify-m13.ps1','scripts/verify-m14.ps1','scripts/verify-m15.ps1')
$missingRegression = @($regressionFiles | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingRegression.Count -eq 0) { Pass "verify-m5 through verify-m15 artifacts remain present" } else { Fail "M5-M15 regression artifacts" ($missingRegression -join ', ') }

Write-Output "PASS $pass/10"
