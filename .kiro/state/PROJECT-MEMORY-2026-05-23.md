# 同乾方略 · 项目记忆 (2026-05-23)

## 0. 一句话状态

代码层 M0-M25 全部收口，HEAD = 9f0da23，main 分支已合并 M24 + M25。等 3 件手动事项就绪即可上线：凭证替换、ICP 备案、业务底料录入。

## 1. 最新里程碑（M0-M25 全部 done）

M5-M13 完成产品骨架、视觉系统、登录、Dashboard 和 Stitch 集成；M14 完成合同审查业务闭环范本。M15-M22 完成招标、资质、机会、报告、派单、AI 聊天、现金流、项目现场等业务闭环，verify 均已通过。M23 完成上线准备，M24 完成可视化上线引导，verify-m24 10/10 PASS；M25 完成桌面封装、Docker 镜像、VPS 部署演练和 CI/CD，verify-m25 12/12 PASS。

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

## 4. 下一步：万婷婷手动 3 件事

| 任务 | 路径 | 预计周期 |
|---|---|---|
| 凭证替换 | `/admin/credentials` -> 填阿里百炼、OpenRouter、微信公众号、OSS、SMS；DeepSeek 已有验证链路 | 凭证齐了 1 天搞定 |
| ICP 备案 | `/admin/onboarding/icp` -> 5 字段 + 材料 -> 阿里云控制台提交 | 7-21 天等审 |
| 业务底料 | `/admin/rules/contract` 律师 200+ 条 + `/admin/knowledge` 专家 5-10 样本 + `/admin/golden-tests` QA 350 案例 | 4-6 周分批 |

## 5. 待规划（M26+，等手动 3 件事就绪后做）

- M26 真流量灰度：nginx 双 upstream + 动态 reload。
- M27 监控可观测性：Sentry + Uptime Kuma + SLS 接入。
- M28 灾备演练：实际跑 backup/restore + RTO 测量。
- M29 桌面端真打包：EV 证书就绪后跑 GitHub Actions desktop-release。
- M30 上线灰度：5% -> 25% -> 50% -> 100% 真用户切流量。

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
