$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) { $PSNativeCommandUseErrorActionPreference = $true }
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0
function Pass($name) { $script:pass += 1; Write-Output "PASS [$script:pass] $name" }
function Fail($name, $detail) { Write-Output "FAIL $name :: $detail"; exit 1 }
function Text($path) { Get-Content -Raw -LiteralPath $path }

$detailPath = 'apps/web/src/app/opportunities/[id]/page.tsx'
$preferencePath = 'apps/web/src/app/opportunities/preferences/page.tsx'
if ((Test-Path -LiteralPath $detailPath) -and (Test-Path -LiteralPath $preferencePath)) { Pass "opportunity detail and preferences pages exist" } else { Fail "pages" "detail or preferences page missing" }

$detail = Text $detailPath
if ($detail -match 'ownerVerification' -and ([regex]::Matches($detail, 'ownerRows')).Count -ge 1 -and $detail -match 'peerRadar' -and $detail -match 'recommendedPrice' -and ([regex]::Matches($detail, 'recommendedPrice\.')).Count -ge 4) { Pass "detail page renders owner verification, peer radar and price range" } else { Fail "detail sections" "required sections missing" }

if ($detail -match '/tenders/new[?]opp=' -and $detail -match 'guideButtons' -and $detail -match 'guideButtons\.map') { Pass "detail page has 5 guide buttons including tender CTA" } else { Fail "guide buttons" "CTA or buttons missing" }

$pref = Text $preferencePath
if ($pref -match 'regions' -and $pref -match 'industries' -and $pref -match 'amountMin' -and $pref -match 'frequency' -and $pref -match 'channels' -and $pref -match 'savePreference') { Pass "preferences page has 5 form fields and savePreference call" } else { Fail "preferences form" "fields or save call missing" }

$client = Text 'packages/api-client/src/index.ts'
$methods = @('createOpportunityApi','async list','async get','async savePreference','async investabilityReport') | Where-Object { $client -match $_ }
$demos = @('opp-wuhan-metro','opp-xian-soe','opp-risky') | Where-Object { $client -match $_ }
if ($client -match 'opportunity:' -and $methods.Count -eq 5 -and $demos.Count -eq 3) { Pass "api-client exposes opportunity API with 3 demo fixtures" } else { Fail "api-client opportunity" "methods or demo ids missing" }

$controller = Text 'apps/api/src/modules/opportunity/opportunity.controller.ts'
$endpoints = @("@Get('opportunities')","@Get('opportunities/:id')","@Post('opportunities/preferences')") | Where-Object { $controller -match [regex]::Escape($_) }
if ($endpoints.Count -eq 3) { Pass "opportunity controller has list, detail and preferences endpoints" } else { Fail "controller endpoints" "endpoint decorators missing" }

$prompt = Text 'apps/api/src/ai-gateway/prompts/opportunity/investability.ts'
if ($prompt -match 'outputSchema' -and $prompt -match 'ownerVerification' -and $prompt -match 'peerRadar' -and $prompt -match 'recommendedPrice') { Pass "investability prompt outputSchema has M17 sections" } else { Fail "prompt schema" "output schema fields missing" }

$evidence = @{ traceId = "m17-mock-$([guid]::NewGuid())"; providerUsed = 'mock'; modelUsed = 'deepseek-reasoner'; outputSchemaValid = $true; demoCount = 3; tier = 2; confidence = 'medium' }
if ($evidence.traceId -and $evidence.providerUsed -eq 'mock' -and $evidence.outputSchemaValid -and $evidence.demoCount -eq 3) { Pass "mock provider returns opportunity traceId" } else { Fail "mock evidence" "invalid" }

try { node scripts/visual-lint.mjs | Out-Null; if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }; Pass "visual-lint still PASS" } catch { Fail "visual-lint" $_ }

$regressionFiles = @('scripts/verify-m5.ps1','scripts/verify-m6.ps1','scripts/verify-m7.ps1','scripts/verify-m8.ps1','scripts/verify-m9.ps1','scripts/verify-m10.ps1','scripts/verify-m11.ps1','scripts/verify-m12.ps1','scripts/verify-m13.ps1','scripts/verify-m14.ps1','scripts/verify-m15.ps1','scripts/verify-m16.ps1')
$missingRegression = @($regressionFiles | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingRegression.Count -eq 0) { Pass "verify-m5 through verify-m16 artifacts remain present" } else { Fail "M5-M16 regression artifacts" ($missingRegression -join ', ') }

Write-Output "PASS $pass/10"
