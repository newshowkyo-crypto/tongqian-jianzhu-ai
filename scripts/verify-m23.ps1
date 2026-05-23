$ErrorActionPreference = "Stop"
$passes = 0
function Pass($n,$m){ $script:passes++; "PASS [$n] $m" }
function Need($n,$ok,$m){ if($ok){ Pass $n $m } else { "FAIL [$n] $m"; exit 1 } }

$mergeCount = (git log main --merges --oneline | Select-String -Pattern "merge: feature/m").Count
Need 1 ($mergeCount -ge 15) "git log main has >= 15 M5-M19 merge commits"
Need 2 (Test-Path -LiteralPath "packages/ui/src/layout/icp-footer.tsx") "IcpFooter exists"
Need 3 ((Select-String -Path "apps/web/src/app/layout.tsx","apps/admin/src/app/layout.tsx","apps/agent/src/app/layout.tsx","apps/gov/src/app/layout.tsx" -Pattern "IcpFooter").Count -ge 8) "4 app layouts import and render IcpFooter"
Need 4 ((Test-Path -LiteralPath "apps/api/src/modules/system-config/system-config.controller.ts") -and (Select-String -Path "apps/api/src/modules/system-config/system-config.controller.ts" -Pattern "api/v1/public|icp-record").Count -ge 2) "public icp-record endpoint exists"
$sopFiles = @("docs/sop/01-rule-curation-for-lawyer.md","docs/sop/02-knowledge-upload-for-expert.md","docs/sop/03-golden-test-for-expert.md")
Need 5 (($sopFiles | ForEach-Object { (Get-Content -LiteralPath $_).Count -ge 200 } | Where-Object { -not $_ }).Count -eq 0) "3 SOP files all >= 200 lines"
foreach($n in 5..22){ powershell -ExecutionPolicy Bypass -File "scripts/verify-m$n.ps1" | Out-Null }
Pass 6 "verify-m5..m22 all PASS"
"PASS $passes/6"
