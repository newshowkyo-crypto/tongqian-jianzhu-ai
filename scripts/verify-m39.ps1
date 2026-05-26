$ErrorActionPreference = 'Continue'
$pass = 0; $fail = 0
function Check($n, $c) { if ($c) { Write-Host "PASS $n"; $script:pass++ } else { Write-Host "FAIL $n"; $script:fail++ } }

$schema = Get-Content 'prisma/schema.prisma' -Raw
Check 'M39.1 carbon removed' (-not ($schema -match 'model CarbonFactor' -or $schema -match 'model CarbonEstimate'))
Check 'M39.2 carbon page removed' (-not (Test-Path -LiteralPath 'apps/web/src/app/projects/[id]/carbon/page.tsx'))
$govText = (Get-Content 'apps/gov/src/app-shell.tsx' -Raw -ErrorAction SilentlyContinue) + (Get-Content 'apps/gov/src/i18n/zh-CN.ts' -Raw -ErrorAction SilentlyContinue)
Check 'M39.3 gov simplified' (($govText -match '个人办公|个人用户|personal') -and -not (Test-Path -LiteralPath 'apps/gov/src/app/declarations/new/page.tsx'))

Check 'M39.4 PredictiveAlert schema' ($schema -match 'model PredictiveAlert' -and $schema -match 'cashflow_gap|qualification_expire')
$predictSvc = Get-Content 'apps/api/src/modules/predictive/predictive-engine.service.ts' -Raw -ErrorAction SilentlyContinue
$predictCount = if ($predictSvc) { ([regex]::Matches($predictSvc, 'cashflow|qualification|project|agent|customer')).Count } else { 0 }
Check 'M39.5 predictive 5 categories' ($predictCount -ge 5)

Check 'M39.6 Workflow schema' ($schema -match 'model Workflow' -and $schema -match 'model WorkflowStep')
$tplCount = (Get-ChildItem 'apps/api/src/modules/workflow/templates' -Filter '*.ts' -ErrorAction SilentlyContinue).Count
Check 'M39.7 5 workflow templates' ($tplCount -ge 5)

Check 'M39.8 voice input button' (Test-Path 'packages/ui/src/primitives/voice-input-button.tsx')
$speech = Get-Content 'apps/web/src/lib/speech-recognition.ts' -Raw -ErrorAction SilentlyContinue
Check 'M39.9 web speech api' ($speech -match 'SpeechRecognition|webkitSpeechRecognition')

Check 'M39.10 super input' (Test-Path 'packages/ui/src/feedback/super-input.tsx')

Check 'M39.11 share link' ((Test-Path 'apps/api/src/modules/sharing/share-link.service.ts') -and ($schema -match 'model ShareLink'))
Check 'M39.12 project space' (Test-Path -LiteralPath 'apps/web/src/app/projects/[id]/space/page.tsx')

Check 'M39.13 gov personal pages' (
  (Test-Path 'apps/gov/src/app/personal/cert-monitor/page.tsx') -and
  (Test-Path 'apps/gov/src/app/personal/exam-radar/page.tsx') -and
  (Test-Path 'apps/gov/src/app/personal/personal-doc/page.tsx')
)

$disHits = (Get-ChildItem apps/*/src -Recurse -Include *.tsx | Select-String 'AiDisclaimer' -List).Count
Check 'M39.14 AiDisclaimer 15+ usage' ($disHits -ge 15)

$pkgs = Get-Content apps/*/package.json,packages/*/package.json -Raw -ErrorAction SilentlyContinue
$heavy = $pkgs -match 'puppeteer|playwright|tensorflow|cesium|forge-viewer|n8n|revit|autocad|comfyui|yolo|langchain|llamaindex|whisper'
Check 'M39.15 no heavy deps' (-not $heavy)

pnpm --config.engine-strict=false typecheck 2>&1 | Out-Null; $tc = $LASTEXITCODE
pnpm --config.engine-strict=false lint 2>&1 | Out-Null; $lt = $LASTEXITCODE
$vl = node scripts/visual-lint.mjs 2>&1 | Out-String
$vlHits = ($vl -split "`n" | Where-Object { $_ -match '^R\d' } | Measure-Object).Count
Check 'M39.16 quality gates' ($tc -eq 0 -and $lt -eq 0 -and $vlHits -eq 0)

Write-Host ""
Write-Host "M39 verify: $pass PASS / $fail FAIL"
exit $fail
