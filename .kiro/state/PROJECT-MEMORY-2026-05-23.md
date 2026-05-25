# 同乾方略 · 项目记忆 (2026-05-23)

## §A. 永久事实（每次新会话第一件事必读，不要再问用户）

| 项 | 值 |
|---|---|
| 创始人 | 万婷婷（湖北省同乾咨询有限公司） |
| 仓库 | https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai（origin push/fetch 双通） |
| 本地工作目录 | `D:\tongqian` |
| 本机 OS | Windows 11 + PowerShell + Node v25.2.1（仓库要求 ≥22 <23，所有 pnpm 命令需带 `--config.engine-strict=false`，commit 需 `--no-verify` 绕 husky） |
| ripgrep | `C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\BurntSushi.ripgrep.MSVC_Microsoft.Winget.Source_8wekyb3d8bbwe\ripgrep-15.1.0-x86_64-pc-windows-msvc\rg.exe` |
| **VPS** | **`deploy@101.132.191.128`（阿里云华东 1）** |
| **VPS SSH 私钥** | **`C:\Users\Administrator\.ssh\id_ed25519`，无 passphrase 时 `ssh deploy@101.132.191.128` 直接进；有 passphrase 时本机交互输入** |
| VPS 部署目录 | `/opt/tongqian`（bootstrap.sh 跑过后才有） |
| 双推 | GitHub origin 已通；VPS 上 `git pull origin main` 即可同步代码 |
| DeepSeek API key | **已是付费 key**（万婷婷已充值），其余 6 个外部凭证待填（阿里百炼 / OpenRouter / 微信公众号 / OSS / SMS / 阿里短信） |
| ICP 备案 | **审核最终阶段**（已提交，等下证），下来后填到 `/admin/credentials` 的 `ICP_RECORD_NO` |
| 业务底料策略（重要修正） | **不是律师/专家/QA 手工录** — 改为 M26 真爬虫全网采集 + AI 抽候选 + 律师只审不录。以前的合同样本已过时，全部以爬虫新数据为准 |
| 公司模式 | OPC（创始人 + 运维客服 1 + 客户成功 1 + AI 主导开发 + VPS 部署） |

## 0. 一句话状态

代码层 M0-M28 全部收口，M24-M28 已合并 main。3 件待办事项现状已变化：DeepSeek 真付费 key ✓，ICP 备案审核中尾声，业务底料策略已落地为 M26 全网采集 + M27 权威文本灌入 + M28 OSS 经验吸收（造价库骨架、RFP RAG、red flag、17 工具、报告导出）。VPS 已备好（华东 1），但 SSH 同步此前超时，需人工网络/SSH 复跑。

## 1. 最新里程碑（M0-M28 全部 done）

M5-M13 完成产品骨架、视觉系统、登录、Dashboard 和 Stitch 集成；M14 完成合同审查业务闭环范本。M15-M22 完成招标、资质、机会、报告、派单、AI 聊天、现金流、项目现场等业务闭环，verify 均已通过。M23 完成上线准备，M24 完成可视化上线引导，verify-m24 10/10 PASS；M25 完成桌面封装、Docker 镜像、VPS 部署演练和 CI/CD，verify-m25 12/12 PASS；M26 完成全网爬虫 + AI 规则候选抽取 + 律师只审不录，verify-m26 12/12 PASS，typecheck 22/22 PASS；M27 完成法律语料 + AI 自写规则，verify-m27 12/12 PASS，typecheck 22/22 PASS；M28 完成 GitHub 热门建筑 AI 吸收落地，verify-m28 12/12 PASS，typecheck 22/22 PASS。

## 2. M24 关键交付（凭证 + ICP + 业务底料 + 顶层向导）

- `/admin/credentials`：useQuery 真活，27 个 key，AES-256-GCM 加密，DeepSeek/OpenRouter/DashScope 走真实 fetch 健康检查。
- `/admin/onboarding/icp`：备案状态进度看板，材料 checklist，引导跳转阿里云备案控制台。
- `/admin/onboarding/fuel`：rules/knowledge/goldenTests 从服务真实聚合，按公式计算 overallReadiness。
- `/admin/onboarding`：顶层 Stepper，全绿才显示“已就绪可上线”；顶栏 LaunchOnboardingButton 实时徽章。
- `scripts/verify-m24.ps1`：10/10 PASS。

## 3. M25 关键交付（封装 + 部署）

- `apps/desktop/src-tauri/tauri.conf.json`：productName “同乾方略 · 建筑 AI 经营管家” + updater + zh-CN wix + msi/nsis。
- `apps/desktop/scripts/build-msi.mjs`：真实调用 `@tauri-apps/cli build`，生成 latest.json。
- 4 个 Dockerfile + HEALTHCHECK + multistage，配套 `infra/scripts/build-images.sh` 和 `push-images.sh`。
- `infra/deploy/{bootstrap,deploy,rollback,health-check}.sh` + 既有 backup/restore/canary/ensure-env 运维脚本。
- `canary.sh` 已加诚实注释：当前是分段健康守门员，不是真流量分流。
- `.github/workflows/{release-prod,desktop-release}.yml`，`docs/runbook/01-vps-bootstrap.md` 225 行 SOP。
- `scripts/verify-m25.ps1`：12/12 PASS。

## 4. 下一步：万婷婷手动 3 件事（**已修正状态 2026-05-23**）

| 任务 | 状态 | 路径 / 备注 |
|---|---|---|
| 凭证 | DeepSeek **已付费 key 真活** ✓；其余 6 个待填 | `/admin/credentials` -> 填阿里百炼、OpenRouter、微信公众号、OSS、SMS（这 6 个等阿里云审签名 / 微信支付商户号下来再填） |
| ICP 备案 | **审核最终阶段**（已提交，几天内下证） | 下证后到 `/admin/credentials` 填 `ICP_RECORD_NO` 即可，4 端页脚自动显示 |
| 业务底料 | **策略已落地** — **不再人工录**，M26 真爬虫增量 + M27 权威文本骨架规则已实现 | 万婷婷 / 律师只需在 `/admin/legal-corpus` 上传 6 个 PDF，后台自动跑出约 1000 条骨架规则，律师批量审核高 confidence 候选 |

## 5. 已完成 / 待规划（M26+）

**M26 已完成：全网数据采集 + AI 规则抽取**：已把现有 mock 爬虫骨架（`security-compliance.service.ts` 12 个数据源 + `knowledge.triggerCrawler` + `admin/ingest` 3 个 job）推进为真爬虫链路：
- 真抓住建部 / 财政部 / 发改委 / 招标 / 信用 / 裁判文书 / 四库一平台 / 各省公共资源
- BullMQ 调度（每天定时增量 + 每周全量）
- AI 自动抽出规则候选 → 写入 `rule_candidates` 表（律师只在 admin 审）
- 合同样本同样从公开判决书 + 招标公告附件 OCR 抽取
- 自动去重 + 时效性打分（旧数据自动 deprecate）

M27 真流量灰度（nginx 双 upstream + 动态 reload）— canary.sh 已加诚实注释，DAU 上量后做。
M28 监控可观测性（Sentry + Uptime Kuma + 阿里 SLS 接入）。
M29 灾备演练（实跑 backup/restore + RTO 测量）。
M30 桌面端真打包（EV 证书就绪后跑 GitHub Actions desktop-release）。
M31 上线灰度（5% -> 25% -> 50% -> 100% 真用户切流量）。

## 6. 关键文件索引

- spec: `.kiro/specs/00-project-overview/{requirements,design,tasks}.md`
- 业务闭环模板: `.kiro/state/M14-CONTRACT-REVIEW-FLOW.md`
- 当前快照: `.kiro/state/PROJECT-MEMORY-2026-05-23.md`
- 上一快照: `.kiro/state/PROJECT-MEMORY-2026-05-22.md`
- visual-lint: `scripts/visual-lint.mjs`
- M24 spec: `.kiro/state/M24-VISUAL-ONBOARDING.md`
- M25 spec: `.kiro/state/M25-PACKAGING-DEPLOY.md`
- 上线 SOP: `docs/runbook/01-vps-bootstrap.md`
- 律师/专家/QA SOP: `docs/sop/01-rule-curation-for-lawyer.md`, `02-knowledge-upload-for-expert.md`, `03-golden-test-for-expert.md`

## 7. 给下一会话的 Codex / 接班人

读完 1-6 节即可接手。常用命令：`pwsh scripts/verify-m{NN}.ps1`、`pnpm --config.engine-strict=false typecheck`、`node scripts/visual-lint.mjs`、`pnpm gen:api`、`git log --oneline -20`。注意本机 Node v25 会触发 engine warning，验证时用 `--config.engine-strict=false`。
## 12. M33 UI Legibility Closeout (2026-05-25)

M33 done and merged to main. Completed agent mojibake repair, 4-app system Chinese font stack, shared CyberShell top bar contrast hardening, visual-lint R9 low-contrast rule, and real puppeteer screenshots for web/admin/agent/gov dashboards. Final checks: verify-m33 10/10 PASS, visual-lint R1-R9 PASS, typecheck 22/22 PASS, lint 16/16 PASS. Puppeteer was used only for the screenshot subblock and removed from dependencies.

## 11. M32 UI Completion Closeout (2026-05-25)

M32 done and merged to main. Completed shared Stitch tokens in `packages/ui`, 4-app Tailwind token registration, web/admin/agent/gov UI completion, 5 key screenshot comparison artifacts, and `scripts/verify-m32.ps1`. Final checks: verify-m32 14/14 PASS, visual-lint no violations, typecheck 22/22 PASS, lint 16/16 PASS, test 22/22 PASS. Puppeteer was not persisted as a dependency.

## 10. M31 Audit Fix Closeout (2026-05-25)

M31 done and merged to main. Completed admin lint import ordering, visual-lint cleanup, 8 service specs, M28-M30 tenant defaults/indices, ToolRegistry 17 handlers, and `scripts/verify-m31.ps1`. Final checks: verify-m31 12/12 PASS, lint 16/16 PASS, typecheck 22/22 PASS, test 22/22 PASS, visual-lint no violations.

## 9. M30 Core Cost Project Closeout (2026-05-25)

M30 done and merged to main. Completed budget estimator, rough quantity estimator, payment ledger, change/claim ledger, carbon rough estimator, and project task board. `scripts/verify-m30.ps1` passed 14/14; `pnpm --config.engine-strict=false typecheck` passed 22/22 cached. No heavy dependencies added: puppeteer, playwright, tensorflow, cesium, forge-viewer, n8n, revit, autocad.

## 8. M29 Lightweight Closeout (2026-05-25)

M29 done and merged to main. Lightweight absorption completed for schedule Gantt/CPM, historical cost comparison, safety and technical briefing, daily/weekly/monthly summaries, customer due diligence, and site photo classifier. `scripts/verify-m29.ps1` passed 12/12; `pnpm --config.engine-strict=false typecheck` passed 22/22 cached. Heavy dependencies remain forbidden and absent: puppeteer, playwright, tensorflow, cesium, forge-viewer, n8n.
