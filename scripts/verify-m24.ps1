$ErrorActionPreference = 'Stop'
$pass = 0
$fail = 0

function Check($name, $cond) {
  if ($cond) {
    Write-Host "PASS $name" -ForegroundColor Green
    $script:pass++
  } else {
    Write-Host "FAIL $name" -ForegroundColor Red
    $script:fail++
  }
}

Check 'M24.1 credentials.controller.ts' (Test-Path 'apps/api/src/modules/admin/credentials/credentials.controller.ts')

$credentialService = Get-Content 'apps/api/src/modules/admin/credentials/credentials.service.ts' -Raw
Check 'M24.2 service has real http test' ($credentialService -match 'fetch\(' -and $credentialService -match 'DEEPSEEK_API_KEY|OPENROUTER_API_KEY|ALIYUN_DASHSCOPE_API_KEY')

$credentialPage = Get-Content 'apps/admin/src/app/(main)/admin/credentials/page.tsx' -Raw
Check 'M24.3 credentials page uses query' ($credentialPage -match 'useQuery' -and $credentialPage -notmatch 'const credentials = \[')

Check 'M24.4 icp/page.tsx' (Test-Path 'apps/admin/src/app/(main)/admin/onboarding/icp/page.tsx')
Check 'M24.5 icp.controller.ts' (Test-Path 'apps/api/src/modules/admin/icp/icp.controller.ts')

$fuelService = Get-Content 'apps/api/src/modules/admin/fuel-progress/fuel-progress.service.ts' -Raw
Check 'M24.6 fuel real inject' ($fuelService -match 'RulesService' -and $fuelService -match 'constructor' -and $fuelService -notmatch 'const rulesStore')

Check 'M24.7 fuel/page.tsx' (Test-Path 'apps/admin/src/app/(main)/admin/onboarding/fuel/page.tsx')

$appShell = Get-Content 'apps/admin/src/app-shell.tsx' -Raw
Check 'M24.8 launch onboarding button' ($appShell -match 'LaunchOnboardingButton' -and $appShell -match 'zhCN\.launchOnboarding')

$onboardingPages = @(
  'apps/admin/src/app/(main)/admin/onboarding/page.tsx',
  'apps/admin/src/app/(main)/admin/onboarding/icp/page.tsx',
  'apps/admin/src/app/(main)/admin/onboarding/fuel/page.tsx',
  'apps/admin/src/app/(main)/admin/onboarding/sop/[id]/page.tsx'
)
$clientPages = $true
foreach ($page in $onboardingPages) {
  $clientPages = $clientPages -and (Test-Path -LiteralPath $page) -and ((Get-Content -LiteralPath $page -Raw) -match "'use client'")
}
Check 'M24.9 onboarding client pages' $clientPages

pnpm --config.engine-strict=false --filter @tongqian/admin --filter @tongqian/api typecheck | Out-Host
Check 'M24.10 typecheck admin api' ($LASTEXITCODE -eq 0)

Write-Host "M24 VERIFY RESULT: PASS $pass/10 FAIL $fail/10"
if ($fail -gt 0 -or $pass -ne 10) {
  exit 1
}
