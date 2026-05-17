# 同乾项目从 C 盘搬到 D 盘 自动迁移脚本
# 在 PowerShell 中执行：
#   powershell -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\同乾\.kiro\state\MIGRATE-TO-D-DRIVE.ps1"

$ErrorActionPreference = 'Stop'

$src = "C:\Users\Administrator\Desktop\同乾"
$dst = "D:\tongqian"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "同乾项目迁移：C → D 盘" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 检查目标盘
if (-not (Test-Path "D:\")) {
  Write-Host "[ERROR] D: 盘不存在！" -ForegroundColor Red
  exit 1
}

# 检查目标目录已存在
if (Test-Path $dst) {
  Write-Host "[WARN] $dst 已存在，请先删除或选其他目录" -ForegroundColor Yellow
  exit 1
}

# 1. 切换到一个无关目录（避免占用源目录）
Write-Host "`n[1/6] 切换到 C:\ 释放占用..." -ForegroundColor Cyan
Set-Location C:\

# 2. 复制（保持目录结构 + 隐藏文件）
Write-Host "`n[2/6] 复制文件到 $dst（含 .git 和 .env）..." -ForegroundColor Cyan
robocopy $src $dst /E /COPYALL /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) {
  Write-Host "[ERROR] robocopy 失败，code=$LASTEXITCODE" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] 复制完成" -ForegroundColor Green

# 3. 验证关键文件
Write-Host "`n[3/6] 验证关键文件..." -ForegroundColor Cyan
$mustHave = @(
  ".env",
  ".git",
  "AGENTS.md",
  ".kiro/specs/00-project-overview/requirements.md",
  ".kiro/state/progress.json"
)
foreach ($f in $mustHave) {
  $p = Join-Path $dst $f
  if (Test-Path $p) {
    Write-Host "  [OK] $f" -ForegroundColor Green
  } else {
    Write-Host "  [MISSING] $f" -ForegroundColor Red
    exit 1
  }
}

# 4. 验证 git 仓库可用
Write-Host "`n[4/6] 验证 D: 盘 git 仓库..." -ForegroundColor Cyan
Set-Location $dst
$branch = git branch --show-current 2>$null
if ($branch -eq "main") {
  Write-Host "  [OK] git 分支：main" -ForegroundColor Green
} else {
  Write-Host "  [WARN] git 分支：$branch（应该是 main）" -ForegroundColor Yellow
}
$remote = git config --get remote.origin.url 2>$null
if ($remote -match "tongqian-jianzhu-ai") {
  Write-Host "  [OK] git 远程：$remote" -ForegroundColor Green
} else {
  Write-Host "  [WARN] git 远程异常：$remote" -ForegroundColor Yellow
}

# 5. 提示用户删除原目录（不自动删，让用户确认）
Write-Host "`n[5/6] 原目录尚未删除（安全保留）：$src" -ForegroundColor Yellow
Write-Host "       验证 D:\tongqian 工作正常后，手动跑：" -ForegroundColor Yellow
Write-Host "         Remove-Item '$src' -Recurse -Force" -ForegroundColor Yellow

# 6. 完成提示
Write-Host "`n[6/6] 迁移完成！" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "  1. cd D:\tongqian" -ForegroundColor White
Write-Host "  2. 在 D:\tongqian 打开 Codex CLI" -ForegroundColor White
Write-Host "  3. 粘贴 .kiro/state/CODEX-PROMPTS.md 段 1 启动" -ForegroundColor White
Write-Host "  4. 验证开发正常后，删除原 C 盘目录" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
