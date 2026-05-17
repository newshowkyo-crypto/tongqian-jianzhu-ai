# Codex 启动指令（V4 IMPROVEMENTS 终版 · 2026-05-17）

> 每次粘贴一段到 Codex CLI 即可。3 段独立可单独使用。

---

## ⚡ 段 1 · 首次启动（**今天用这段**）

> 用法：在 `D:\tongqian` 打开 Codex CLI，把下面三反引号内全部内容**整段复制**，粘贴到 Codex，按 Enter。

```
开始 autopilot 自治循环开发模式（V4 IMPROVEMENTS 终版）。

【环境信息】
- 项目根：D:\tongqian
- Git 仓库：https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai
- 默认分支：main
- 平台：Windows 11，PowerShell，Node 22 / pnpm 9 / Docker Desktop
- VPS：deploy@101.132.191.128:/opt/tongqian（Alibaba Cloud Linux 3，已就绪）
- VPS SSH 链路已通（appleboy/ssh-action 验证 ✅）
- 主域名：tongqian.xin（注册局审核中，开发期用 IP）
- 品牌域：tongqian.io（不备案，仅营销物料）

【最高约束 · 必读】
1. AGENTS.md §3.7 双轨命名（agent 代码层 / 智能管家 用户可见层）
2. AGENTS.md §3.8 商业宪法 V4（红线 3 + 价值密度自检表 + 4 强制要素 + 5 引导按钮按角色裁剪）
3. .kiro/steering/business-theory.md（AARRR / Cialdini 6 原则 / 12-Factor / 事件驱动 / CQRS / Feature Flag）
4. .kiro/steering/autopilot-rules.md / decision-defaults.md / token-budget.md / self-verification.md / error-recovery.md / git-workflow.md
5. docs/decisions/2026-05-16-adr-auto-business-model-v4.md
6. docs/decisions/2026-05-16-adr-auto-improvements-package.md（含 PARTNER + 黄金测试集 + 8 漏洞补丁）
7. docs/decisions/2026-05-16-adr-auto-rename-agent-to-steward.md
8. docs/decisions/2026-05-16-adr-auto-remove-agent-deposit.md

【凭证策略 · 占位 + 后台可视化替换】
SHALL：启动前只验 P0_real 3 项 AI Key 是否真实有效（DASHSCOPE / OPENROUTER / DEEPSEEK）
SHALL：P1_placeholder 全部用 PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL 占位（微信支付 / 公众号 / 支付宝 / 阿里云 OSS/OCR/SLS/SMS / 企微 / DashVector）
SHALL：检测到 PLACEHOLDER 时启用对应 mock provider，对应 e2e 自动 skip 并在测试报告标注"mock"
SHALL：admin-console（24-spec）必含『系统配置 → 凭证管理』可视化页面：
  - 列表展示所有凭证类型 + 当前状态（占位 / 真实 / 失效）
  - 表单填真凭证 → 加密入库 → 热更新到 system_configs 表
  - 切换 mock ↔ real provider 一键 toggle
  - 配置变更走审批流（platform-owner）
  - 所有操作写审计日志
SHALL：P2_auto 6 项凭证（DATABASE_URL / REDIS_URL / JWT_SECRET / ENCRYPTION_KEY / CSRF_SECRET / POSTGRES_PASSWORD）你自动生成或 docker-compose 自带，不让我配
SHALL NOT：因 P1_placeholder 缺失而 BLOCKED 整体开发
SHALL NOT：把真凭证写进 .env 然后 commit（用 .env.example 占位）

【启动步骤 · 不询问任何确认问题】
1. 读 .kiro/state/progress.json 把 mode 从 standby 改为 autopilot，记录 started_at
2. 跑 00-PRE-1 启动检查：
   - 读 .env，确认 P0_real 3 项 AI Key 已填真值（不是 sk-xxx 占位）
   - 缺任一 → 写 BLOCKED.md 列出 → 暂停，等用户填好
3. 跑 00-PRE-2（检查 Docker / pnpm / Node 22 / Git 已安装）
4. 跑 00-PRE-3（git remote 已配置 + push 凭证有效）
5. 全部就绪 → 按 .kiro/state/build-order.md 找 01-A1 开始

【V4 强制约束 · 每个 task 必查】
- 写 prompt 必过价值密度自检表 6 题（AGENTS.md §3.8）
- UI 文案"智能管家"走 i18n（不硬编码，packages/types/src/i18n/）
- AI 输出含 4 强制要素（免责声明 / Tier 徽章 / 信心度 / 下一步引导）
- AI 输出 5 引导按钮按角色裁剪（老板 5 / 智能管家 3 / 政企 3 / 员工 2）
- 营销 / 钩子 / 推送套用 Cialdini 6 原则 + 防黑暗模式 10 条 SHALL NOT
- 所有 prompt 必过 29-prompt-testing 黄金测试集（≥ 0.7 语义相似度）
- 所有 AI 调用前必查 BR-904 单客户成本上限（自动降级到备用模型）
- 所有报告 PDF 含客户姓名水印（嵌入式 PDF 内层 + 防 OCR）
- 所有 controller 写操作必有 4 层 WHERE（tenant + scope + project + owner）
- 所有错误抛 BusinessError + 错误码（packages/errors）

【V4 IMPROVEMENTS 强制约束】
- 一期 M1-M3 关闭 PARTNER（FEATURE_FLAG_PARTNER_ENABLED=false）
- 火山方舟已移除（用 阿里百炼 + OpenRouter + DeepSeek 直连 3 渠道）
- 测试 fixtures 体系优先（02-spec R5 在 01-infra 后第 2 个落地）
- 跑到 M5 prompt 任务时停下，写 BLOCKED.md 等专家提供核心 Prompt 内容
- 所有占位凭证后台可视化替换（24-admin-console R7）

【里程碑主动提醒】
SHALL 在 progress.json.milestones 任一 trigger task 完成时，立即写 .kiro/state/MILESTONE-{name}.md：

- M-W1（trigger=01-I2）：监督 ICP 备案 / 律师协议 / 微信凭证整理
- M-W2（trigger=06-H1）：阿里云 OSS/OCR/SLS / 短信签名 / 内测客户名单
- M-W3（trigger=09-A11）：微信支付证书 / 支付宝密钥 / admin 后台访问
- M-W4（trigger=10-A9）：VPS 信息已就绪、ACR 开通、测试客户案例
- M-W5（trigger=11-A1）：等专家提供 30+ Prompt 内容，BLOCK prompt-only 任务
- M-W6（trigger=24-ALL）：团队培训 / 凭证替换 / 智能管家招募
- M-W7（trigger=28-ALL）：ICP 催办 / DNS 解析 / 协议定稿
- M-W8（trigger=99-FINAL-3）：e2e / 晚宴 / 内容 / 奖励物流
- M-MONTHLY：每月 1 号写 MILESTONE-MONTHLY-{YYYY-MM}.md（BR-901/903 红线 + 信誉异常 + 关键指标）

【主循环 · 每个 atomic task】
LOAD（≤ 8 工具调用）
  → PLAN（不调工具，≤ 5 步）
  → CODE（≤ 12 工具调用，≤ 5 文件，≤ 500 行）
  → VERIFY（DoD ≤ 6 工具调用：lint + typecheck + test + build）
  → COMMIT 单 task 单 commit
  → PUSH 到 origin/main（强制每 task 单独 push）
  → UPDATE progress.json
  → COMPACT（≥ 60% 上下文主动结束会话 + 写 next_action）

【Git 工作流（每 task 必走）】
1. git add -A
2. git commit -m "feat(scope): <task-id> <一句话描述>"
   例：feat(types): 02-A1a 实现 packages/types/src/auth/role.ts
3. git push origin main
4. push 失败 → 重试 3 次 → 仍失败标记 task partial + BLOCKED.md
5. SHALL NOT 多 task 攒一起 commit
6. SHALL NOT 强制 push 已 push 的提交
7. SHALL NOT 在 commit 中包含 .env 或任何含真凭证的文件

【DoD V4 强制额外项】
- AI 输出生成必含 4 要素 + 5 引导（PBT 测试，缺则 throw REPORT.REQUIRED_ELEMENT_MISSING）
- prompt 模板必过价值密度自检（自动校验 6 题答 yes）
- UI 文案禁硬编码"中介"二字（grep 检查 0 个）
- 政企版禁海外模型（强制路由检查，apps/gov 只能走阿里百炼）
- 黄金测试集 ≥ 0.7 通过率（每个 prompt PR 必跑）
- 占位凭证不阻塞 e2e（mock provider 必返合理假数据）

【完成标志】
跑完 28 + 1 spec → 99-FINAL → 生成 docs/changelog/{date}-final-build-report.md → push → 等用户验收。

【红线 · 必停】
- 触发 security-rules.md 红线（资金 / 数据泄漏 / 越权）
- 触发 safety_guardrails 高风险动作（生产删除 / 强 push main）
- 缺 P0_real（≥ 1 项 AI Key missing 而非 placeholder）
- 同一 task 失败 ≥ 3 次

跑起来。
```

---

## 🔁 段 2 · 日常续作（**第 2 次起每次都用这段**）

> Codex 上下文塞满会主动结束会话。下次打开 Codex CLI 粘贴下面这段即可续作。

```
继续 autopilot 自治循环开发（V4 IMPROVEMENTS）。

工作目录：D:\tongqian
读 .kiro/state/progress.json 找 mode == autopilot 且 status 为 partial 或 pending 的下一个 task。

按段 1 同样的约束执行：
- 读必读文件（AGENTS.md / 5 个 steering / 4 个 ADR）
- 主循环 LOAD → PLAN → CODE → VERIFY → COMMIT + push → UPDATE → COMPACT
- 每 task 单独 git commit + push
- ≥ 60% 上下文主动结束
- 触发 milestones.{name}.trigger task 时写 MILESTONE-{name}.md

跑起来。
```

---

## 🚀 段 3 · 触发 VPS 自动部署链路（**W4 基础设施做完才用**）

> 用法：当 Codex 完成 01-infra-monorepo + 06-auth-rbac + 07/08/09 商业核心后，粘贴这段。

```
配置 VPS 自动部署链路（V4 IMPROVEMENTS · GitHub Actions → 阿里云 ACR → 阿里云 VPS）。

【环境信息（已就绪）】
- VPS IP：101.132.191.128
- VPS OS：Alibaba Cloud Linux 3（dnf）
- VPS 用户：deploy（sudo 免密 + docker 组）
- VPS SSH 密钥：/home/deploy/.ssh/github_deploy（已加 GitHub Secrets）
- 项目目录：/opt/tongqian/{app,data,logs,backups,certs,scripts}
- VPS 已装：Docker 26.1.3 / Compose v2.27.0 / Node 22 / pnpm 9 / Nginx 1.20.1
- Swap：4GB
- GitHub Secrets 已配（4 个）：VPS_HOST / VPS_USER / VPS_SSH_KEY / DEPLOY_PATH
- verify-vps.yml 已通（appleboy/ssh-action ✅）
- 阿里云 ACR：等用户开通后给 registry URL

【任务】
按 .kiro/specs/01-infra-monorepo/tasks.md 的 C1-E4 段执行：
1. 写 Dockerfile.api / Dockerfile.worker / Dockerfile.next / Dockerfile.nginx
2. 写 docker-compose.prod.yml（含 postgres/redis/api/worker/web/admin/agent/gov/nginx）
3. 写 .github/workflows/ci.yml + build-images.yml + deploy-staging.yml + deploy-prod.yml
4. 写 scripts/deploy.sh / canary.sh / rollback.sh / health-check.sh
5. 输出 GitHub Repository Secrets 增量配置清单（用户手动配）：
   - ALIYUN_ACR_USERNAME / ALIYUN_ACR_PASSWORD / ALIYUN_ACR_REGISTRY
   - DATABASE_URL（生产）/ REDIS_URL（生产）/ JWT_SECRET（生产）
   - 微信支付 / 公众号 / 阿里云生产凭证（占位即可，admin 后台替换）
6. 输出 VPS 首次手动部署 SOP（用户照抄即可）

【约束】
- 灰度 5% / 25% / 50% / 100%（每档 10/30/60 分钟观察）
- 健康检查不通过 30s → 自动回滚
- DB migration 在部署前先跑（独立 step）
- 备份脚本（每日 03:00 / 每小时增量 / OSS 跨区域）
- 镜像保留：prod-latest + prod-previous + 最近 10 个 sha tag

【输出】
- 所有部署文件 commit + push
- 写 docs/changelog/{date}-vps-deploy-setup.md 总结
- 更新 .kiro/state/MILESTONE-W4-AI-DONE.md 标记部署链路就绪

跑起来。
```

---

## ❓ 4 个常见问题处理

### Q1：Codex 跑到一半我能停吗？

可以。Codex 主动 60% 结束会话时会自动 commit + push 当前进度。强行 Ctrl+C 中断也没事，progress.json 会标 `partial`，下次粘贴段 2 续作即可。

### Q2：Codex 卡住了怎么办？

```powershell
Set-Location D:\tongqian

# 1. 看 BLOCKED.md
if (Test-Path BLOCKED.md) { Get-Content BLOCKED.md }

# 2. 看 progress.json 状态
Get-Content .kiro/state/progress.json | Select-String "mode|current_task|done_count|blocked_count"

# 3. 看最后几次 commit
git log --oneline -10
```

如果是真卡（不是 BLOCKED）：粘贴段 2 让 Codex 重新接续。

### Q3：Codex 写错了怎么办？

```powershell
Set-Location D:\tongqian
git log --oneline -5

# 反向 commit（不破坏历史，已 push 用这个）
git revert HEAD

# 或者本地直接撤回（只对最后 1 commit 有效，且没 push 才能用）
git reset --soft HEAD~1
```

### Q4：万一 push 失败？

GitHub 凭证过期或网络问题：
```powershell
Set-Location D:\tongqian
git config --global credential.helper manager-core
git pull --rebase origin main
git push
```

---

## 📋 启动前最后清单

- [x] 本地装好 Node 22 / pnpm 9 / Docker Desktop / Git
- [x] 项目根目录：`D:\tongqian`
- [x] Git 远程 origin 已配（newshowkyo-crypto/tongqian-jianzhu-ai）
- [x] 第一次 commit 已 push
- [x] VPS SSH 链路已验证（verify-vps.yml ✅）
- [x] GitHub Secrets 4 项已配
- [ ] **`.env` 填好 P0_real 3 项 AI Key（其余用 PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL）**
- [ ] **粘贴段 1 启动**

---

## 📝 你只需要填 3 个真凭证（其他全占位）

打开 `D:\tongqian\.env`（如不存在让 Codex 启动时自动从 .env.example 生成），填这 3 项：

```env
# ===== P0 真凭证（3 项必填，把你已有的 sk-xxx 填进去） =====
ALIYUN_DASHSCOPE_API_KEY=sk-YOUR_DASHSCOPE_KEY_HERE
OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_KEY_HERE
DEEPSEEK_API_KEY=sk-YOUR_DEEPSEEK_KEY_HERE

# ===== P2 自动生成（Codex 启动时填，你不用管） =====
# DATABASE_URL=postgresql://postgres:auto-gen@localhost:5432/tongqian
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=auto-gen-64-byte-hex
# ENCRYPTION_KEY=auto-gen-32-byte-base64
# CSRF_SECRET=auto-gen-32-byte-hex
# POSTGRES_PASSWORD=auto-gen-24-char

# ===== P1 占位（开发期 mock，admin 后台后期一键替换） =====
WECHAT_PAY_MCH_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
WECHAT_PAY_API_KEY=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
WECHAT_PAY_CERT_PATH=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
WECHAT_MP_APP_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
WECHAT_MP_APP_SECRET=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIPAY_APP_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIPAY_PRIVATE_KEY=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_OSS_ACCESS_KEY_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_OSS_ACCESS_KEY_SECRET=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_OSS_BUCKET=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_OSS_REGION=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_SMS_ACCESS_KEY_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_SMS_ACCESS_KEY_SECRET=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_SMS_SIGN_NAME=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_SLS_PROJECT=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_SLS_LOGSTORE=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_SLS_ENDPOINT=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_OCR_ACCESS_KEY_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
ALIYUN_OCR_ACCESS_KEY_SECRET=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
WECHAT_WORK_AGENT_ID=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
WECHAT_WORK_SECRET=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL
DASHVECTOR_API_KEY=PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL

# ===== Feature Flags =====
FEATURE_FLAG_PARTNER_ENABLED=false
NODE_ENV=development
```

> 只要 3 个真 AI Key，剩下全占位 Codex 用 mock 跑。后期 admin 后台一键替换不用改代码。

---

## 🗓 接下来时间线

| 阶段 | 周次 | 你做 | Codex 做 |
|---|---|---|---|
| **现在** | Day 0 | 填 3 个 AI Key 到 `.env` + 粘贴段 1 | 跑 01-A1 ~ 03-G2 基础设施 |
| **域名** | W1 | 等 tongqian.xin 备案 | 继续推进 |
| **W2-W3** | Day 7-21 | 看进度 | 跑 06-09 商业核心 + 04 AI Gateway |
| **W4** | Day 28 | 粘贴段 3 | 配 VPS 部署链路 |
| **W5** | Day 35 | 配 ACR Secrets / VPS 首次部署 | 跑 5 大杀手锏 |
| **W6-W12** | Day 42-84 | 配合写 30+ Prompt 内容 | 跑剩余 spec |
| **M3** | 上线前 | 内测客户晚宴 | 99-FINAL 验收 |

---

## 🎯 一句话总结

**今天**：填 3 个 AI Key → 粘贴段 1 → 让 Codex 开跑。
**4 周后**：粘贴段 3 让 Codex 配 VPS 部署。
**W6+**：你团队配合写专家级 Prompt 内容。
**其他**：admin 后台等 W6 用，凭证一键替换。
