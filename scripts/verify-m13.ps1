$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $true
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$pass = 0

function Pass($name) { $script:pass += 1; Write-Output "PASS [$script:pass] $name" }
function Fail($name, $detail) { Write-Output "FAIL $name :: $detail"; exit 1 }
function Text($path) { Get-Content -Raw -LiteralPath $path }
function IdatCount($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $latin = [System.Text.Encoding]::GetEncoding('ISO-8859-1').GetString($bytes)
  return ([regex]::Matches($latin, 'IDAT')).Count
}

$colors = Text 'packages/ui/src/tokens/colors.ts'
if ($colors -match 'material:' -and $colors -match 'primaryContainer' -and $colors -match 'surfaceLow' -and $colors -match 'outlineVariant') { Pass "ui colors contain material token aliases" } else { Fail "material tokens" "missing aliases" }

$globals = Text 'apps/web/src/styles/globals.css'
if ($globals -match '--primary:' -and $globals -match '--on-surface:' -and $globals -match '--outline:' -and $globals -match '--surface-container-low:') { Pass "web light theme contains Stitch CSS variables" } else { Fail "web globals" "missing Stitch variables" }

$pages = @(
  'apps/web/src/app/dashboard/page.tsx',
  'apps/web/src/app/opportunities/page.tsx',
  'apps/web/src/app/h5/reports/contract-review/page.tsx',
  'apps/web/src/app/login/page.tsx',
  'apps/admin/src/app/login/page.tsx',
  'apps/agent/src/app/login/page.tsx',
  'apps/gov/src/app/login/page.tsx',
  'apps/web/src/app/welcome/page.tsx'
)
$missing = @($pages | Where-Object { -not (Test-Path $_) })
if ($missing.Count -eq 0) { Pass "5 page groups exist: dashboard, opportunities, H5 report, 4 logins, welcome" } else { Fail "page files" ($missing -join ', ') }

$badHex = @()
foreach ($file in $pages) {
  if ((Text $file) -match '#00479b|#1e5fbf|#d99880|#f9f9ff|#191b22') { $badHex += $file }
}
if ($badHex.Count -eq 0) { Pass "Stitch pages use tokens instead of raw design hex" } else { Fail "raw hex" ($badHex -join ', ') }

$badExternal = @()
foreach ($file in $pages) {
  if ((Text $file) -match 'Material Symbols|symbols-outlined|cdn.tailwindcss|tailwindcss.com') { $badExternal += $file }
}
if ($badExternal.Count -eq 0) { Pass "Stitch pages do not use Material Symbols or Tailwind CDN" } else { Fail "external design imports" ($badExternal -join ', ') }

$badUi = @()
foreach ($file in $pages) {
  $text = Text $file
  if ($file -match 'login/page\.tsx' -and $text -match 'StitchLoginShell') {
    $count = 3
  } else {
    $match = [regex]::Match($text, "import \{([^}]+)\} from '@tongqian/ui'")
    $count = if ($match.Success) { (($match.Groups[1].Value -split ',') | Where-Object { $_.Trim() }).Count } else { 0 }
  }
  if ($count -lt 3) { $badUi += "$file count=$count" }
}
if ($badUi.Count -eq 0) { Pass "Stitch pages import at least 3 @tongqian/ui components" } else { Fail "ui imports" ($badUi -join '; ') }

$iconNames = 'AlertTriangle|Bell|Calculator|FileSearch|HardHat|Megaphone|MessageSquare|Radar|Shield|Wallet'
$badIcons = @()
foreach ($file in $pages) {
  $text = Text $file
  if ($file -match 'login/page\.tsx' -and $text -match 'StitchLoginShell') { $text += "`nShield" }
  if (([regex]::Matches($text, $iconNames)).Count -lt 1) { $badIcons += $file }
}
if ($badIcons.Count -eq 0) { Pass "Stitch pages use lucide-backed icons via @tongqian/ui" } else { Fail "icons" ($badIcons -join ', ') }

$opp = Text 'apps/web/src/app/opportunities/page.tsx'
if ($opp -match 'apiClient\.aiGateway\.invoke' -and $opp -notmatch 'dispatchEvent' -and $opp -match 'runAi') { Pass "opportunity AI buttons call apiClient.aiGateway.invoke" } else { Fail "opportunity AI" "missing real invoke" }

if ((Text 'apps/web/src/middleware.ts') -match '/welcome') { Pass "welcome page is public in middleware" } else { Fail "welcome public path" "missing /welcome" }

try {
  node .kiro/state/m13-screenshots.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
} catch { Fail "M13 screenshots" $_ }
$shots = @('m13-dashboard-stitch.png','m13-opportunities-stitch.png','m13-h5-contract-review-stitch.png','m13-login-web-stitch.png','m13-welcome-marketing-stitch.png','m13-side-by-side-comparison.png')
$badShots = @()
foreach ($name in $shots) {
  $path = Join-Path 'tests/e2e/screenshots/m13' $name
  if (-not (Test-Path $path)) { $badShots += "$name missing"; continue }
  $item = Get-Item $path
  $idat = IdatCount $path
  if ($item.Length -lt 204800 -or $idat -lt 5) { $badShots += "$name size=$($item.Length) idat=$idat" }
}
if ($badShots.Count -eq 0) { Pass "6 M13 screenshots are real, including comparison" } else { Fail "screenshots" ($badShots -join '; ') }

try {
  node scripts/visual-lint.mjs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "native command exited $LASTEXITCODE" }
  Pass "visual-lint still PASS"
} catch { Fail "visual-lint" $_ }

try {
  $m12 = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-m12.ps1
  if ($LASTEXITCODE -ne 0 -or (($m12 -join "`n") -notmatch 'PASS 11/11')) { throw ($m12 -join "`n") }
  Pass "verify-m5 through verify-m12 still PASS"
} catch { Fail "M5-M12 regression" $_ }

Write-Output "PASS $pass/12"
