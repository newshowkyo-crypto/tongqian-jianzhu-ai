$ErrorActionPreference = 'Stop'

$pass = 0
$total = 14

function Check($name, $condition) {
  if ($condition) {
    $script:pass += 1
    Write-Output "PASS $name"
  } else {
    throw "FAIL $name"
  }
}

function Run($name, $command) {
  Write-Output "RUN $name"
  Invoke-Expression $command
  Check $name ($LASTEXITCODE -eq 0)
}

$tokens = Get-Content 'packages/ui/src/tokens/stitch-tokens.ts' -Raw
Check 'M32.1 stitch tokens registered' ($tokens -match 'surface-container' -and $tokens -match 'primary-fixed')

$tailwinds = @(
  'apps/web/tailwind.config.ts',
  'apps/admin/tailwind.config.ts',
  'apps/agent/tailwind.config.ts',
  'apps/gov/tailwind.config.ts'
)
Check 'M32.2 4 apps import stitch tokens' (($tailwinds | Where-Object { (Get-Content $_ -Raw) -match '@tongqian/ui/tokens' }).Count -eq 4)

Run 'M32.3 visual-lint 0 violations' 'node scripts/visual-lint.mjs'

$hex = Get-ChildItem apps -Recurse -Include *.tsx,*.ts |
  Where-Object { $_.FullName -match '\\src\\' -and $_.FullName -notmatch '\\node_modules\\' } |
  Select-String -Pattern 'bg-[#','text-[#','border-[#' -SimpleMatch -List
Check 'M32.4 zero arbitrary hex classes in app src' ($null -eq $hex)

$pageHeaderCount = (Get-ChildItem apps -Recurse -Include *.tsx | Select-String -Pattern 'PageHeader' -SimpleMatch).Count
Check 'M32.5 PageHeader usage >= 50' ($pageHeaderCount -ge 50)

$emptyCount = (Get-ChildItem apps -Recurse -Include *.tsx | Select-String -Pattern 'EmptyState' -SimpleMatch).Count
$loadingCount = (Get-ChildItem apps -Recurse -Include *.tsx | Select-String -Pattern 'LoadingState' -SimpleMatch).Count
$errorCount = (Get-ChildItem apps -Recurse -Include *.tsx | Select-String -Pattern 'ErrorState' -SimpleMatch).Count
Check 'M32.6 Empty/Loading/Error states covered' ($emptyCount -ge 5 -and $loadingCount -ge 5 -and $errorCount -ge 3)

$agent = Get-ChildItem apps/agent/src -Recurse -Include *.tsx,*.ts | Select-String -Pattern 'rose-gold|stitch-accent-gold|accent-gold' -List
Check 'M32.7 agent vibrant accent present' ($null -ne $agent)

$govGold = Get-ChildItem apps/gov/src -Recurse -Include *.tsx,*.ts | Select-String -Pattern 'rose-gold|stitch-accent-gold|accent-gold' -List
Check 'M32.8 gov conservative no gold accent' ($null -eq $govGold)

$shots = Get-ChildItem tests/e2e/screenshots/m32 -Filter *.png -ErrorAction SilentlyContinue
Check 'M32.9 screenshots >= 5' ($shots.Count -ge 5)

Check 'M32.10 comparison report exists' (Test-Path 'tests/e2e/screenshots/m32/comparison.html')

$pkg = Get-Content 'package.json' -Raw
Check 'M32.11 puppeteer not persisted in deps' ($pkg -notmatch 'puppeteer')

Run 'M32.12 typecheck' 'pnpm --config.engine-strict=false typecheck'
Run 'M32.13 lint' 'pnpm --config.engine-strict=false lint'
Run 'M32.14 test' 'pnpm --config.engine-strict=false test'

Write-Output "PASS $pass/$total M32 UI completion verify"
