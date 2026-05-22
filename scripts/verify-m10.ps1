$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $true
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0

function Pass($name) {
  $script:pass += 1
  Write-Output "PASS [$script:pass] $name"
}

function Fail($name, $detail) {
  Write-Output "FAIL $name :: $detail"
  exit 1
}

function Text($path) {
  return Get-Content -Raw -LiteralPath $path
}

function IdatCount($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $latin = [System.Text.Encoding]::GetEncoding('ISO-8859-1').GetString($bytes)
  return ([regex]::Matches($latin, 'IDAT')).Count
}

$loginPages = @(
  'apps/web/src/app/login/page.tsx',
  'apps/admin/src/app/login/page.tsx',
  'apps/agent/src/app/login/page.tsx',
  'apps/gov/src/app/login/page.tsx'
)
$middlewares = @(
  'apps/web/src/middleware.ts',
  'apps/admin/src/middleware.ts',
  'apps/agent/src/middleware.ts',
  'apps/gov/src/middleware.ts'
)

$bad = @()
foreach ($file in $loginPages) {
  $body = Text $file
  if ($body -notmatch 'window\.location\.replace') { $bad += "$file missing location.replace" }
  if ($body -match 'router\.push|useRouter') { $bad += "$file still uses router navigation" }
}
if ($bad.Count -eq 0) { Pass "4 login pages use window.location.replace and no router.push" } else { Fail "login hard navigation" ($bad -join '; ') }

$bad = @()
foreach ($file in $loginPages) {
  $body = Text $file
  foreach ($needle in @('setPending', 'document.cookie', 'max-age', 'SameSite=Lax')) {
    if ($body -notmatch [regex]::Escape($needle)) { $bad += "$file missing $needle" }
  }
}
if ($bad.Count -eq 0) { Pass "4 login pages set pending and persistent cookies" } else { Fail "login cookie guard" ($bad -join '; ') }

$bad = @()
foreach ($file in $middlewares) {
  $body = Text $file
  foreach ($needle in @('isDev', 'DEV_TOKEN', 'DEV_ROLE', 'response.cookies.set', 'NextResponse.next')) {
    if ($body -notmatch [regex]::Escape($needle)) { $bad += "$file missing $needle" }
  }
}
if ($bad.Count -eq 0) { Pass "4 middleware files include dev auto-cookie branch" } else { Fail "middleware dev auth" ($bad -join '; ') }

$bad = @()
foreach ($file in $loginPages) {
  $body = Text $file
  $hits = 0
  foreach ($needle in @('navy-deepest', 'silver-light', 'rose-main')) {
    if ($body -match $needle) { $hits += 1 }
  }
  if ($hits -lt 2) { $bad += "$file tokenHits=$hits" }
  if ($body -match 'bg-neutral-50') { $bad += "$file contains bg-neutral-50" }
}
if ($bad.Count -eq 0) { Pass "4 login pages use cyber tokens and no old neutral shell" } else { Fail "login visual tokens" ($bad -join '; ') }

try {
  node .kiro/state/m10-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
} catch {
  Fail "M10 screenshots and 4-app dev direct dashboard" $_
}
$expected = @('m10-admin-login-styled.png','m10-web-dev-direct-dashboard.png','m10-agent-login-button-clickable.png')
$badShots = @()
foreach ($name in $expected) {
  $path = Join-Path 'tests/e2e/screenshots/m10' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
if ($badShots.Count -eq 0) { Pass "3 M10 screenshots and 4 homepages pass dev direct dashboard check" } else { Fail "M10 screenshots" ($badShots -join '; ') }

try {
  node scripts/visual-lint.mjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
  Pass "visual-lint still PASS"
} catch {
  Fail "visual-lint" $_
}

$checks = @(
  @{ Name = 'm5'; Script = 'scripts/verify-m5.ps1'; Pattern = 'PASS 12/12|PASS=12 FAIL=0' },
  @{ Name = 'm6'; Script = 'scripts/verify-m6.ps1'; Pattern = 'PASS 18/18|PASS=18 FAIL=0' },
  @{ Name = 'm7'; Script = 'scripts/verify-m7.ps1'; Pattern = 'PASS 14/14|PASS=14 FAIL=0' },
  @{ Name = 'm8'; Script = 'scripts/verify-m8.ps1'; Pattern = 'PASS 14/14|PASS=14 FAIL=0' },
  @{ Name = 'm9'; Script = 'scripts/verify-m9.ps1'; Pattern = 'PASS 10/10|PASS=10 FAIL=0' }
)
$badVerify = @()
foreach ($check in $checks) {
  $output = powershell -NoProfile -ExecutionPolicy Bypass -File $check.Script
  $joined = $output -join "`n"
  if ($LASTEXITCODE -ne 0 -or $joined -notmatch $check.Pattern) {
    $badVerify += "$($check.Name): $joined"
  }
}
if ($badVerify.Count -eq 0) { Pass "verify-m5 through verify-m9 still PASS" } else { Fail "M5-M9 regression" ($badVerify -join "`n---`n") }

Write-Output "PASS $pass/7"
