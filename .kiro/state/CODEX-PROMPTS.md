# Codex 启动指令（V4 IMPROVEMENTS 终版）

> 每次粘贴一段到 Codex CLI 即可。3 段独立可单独使用。

---

## 段 1 · 首次启动（**今天用这段**）

> 用法：在 `D:\tongqian` 打开 Codex CLI，粘贴下面三反引号内全部内容，按 Enter。

```
开始 autopilot 自治循环开发模式（V4 IMPROVEMENTS 终版 · 2026-05-16）。

【环境信息】
- 项目根：D:\tongqian
- Git 仓库：https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai
- 默认分支：main
- Git 用户：Tongqian Founder <biz@tongqian.xin>
- 包管理：pnpm 9 / Node 22 / Docker Desktop
- 平台：Windows 11，PowerShell

【最高约束 · 必读】
1. AGENTS.md §3.7 双轨命名（agent 代码层 / 智能管家 用户可见层）
2. AGENTS.md §3.8 商业宪法 V4（红线 3 + 价值密度自检表 + 4 强制要素 + 5 引导按钮按角色裁剪）
3. .kiro/steering/business-theory.md（AARRR / Cialdini 6 原则 / 12-Factor / 事件驱动 / CQRS / Feature Flag）
4. .kiro/steering/autopilot-rules.md / decision-defaults.md / token-budget.md / self-verification.md / error-recovery.md / git-workflow.md
5. docs/decisions/2026-05-16-adr-auto-business-model-v4.md
6. docs/decisions/2026-05-16-adr-auto-improvements-package.md（含 PARTNER + 黄金测试集 + 8 漏洞补丁）
7. docs/decisions/2026-05-16-adr-auto-rename-agent-to-steward.md
8. docs/decisions/2026-05-16-adr-auto-remove-agent-deposit.md

【启动步骤 · 不询问任何确认问题】
1. 读 .kiro/state/progress.json 把 mode 从 standby 改为 autopilot，记录 started_at
2. 跑 00-PRE-1 启动检查：
   - 读 .env，对照 P0 凭证（已就绪 6 项：DASHSCOPE / OPENROUTER / DEEPSEEK / JWT_SECRET / ENCRYPTION_KEY / CSRF_SECRET / POSTGRES_PASSWORD）
   - 检测 PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL 占位（微信支付 / 公众号 / 阿里云 / 支付宝 / 短信 / 企微）
     SHALL：标记为"placeholder"状态而非"missing"
     SHALL：实施时启用 mock provider，对应 e2e 测试自动跳过
     SHALL：写进 admin-console（24-spec）后台可视化替换页面
     SHALL NOT：因占位 BLOCKED 暂停整体开发
3. 跑 00-PRE-2（检查 Docker / pnpm / Node 22 / Git 已安装）+ 00-PRE-3（git remote 已配置）
4. 全部就绪 → 按 .kiro/state/build-order.md 找 01-A1 开始

【V4 强制约束 · 每个 task 必查】
- 写 prompt 必过价值密度自检表 6 题（AGENTS.md §3.8）
- UI 文案"智能管家"走 i18n（不硬编码，packages/types/src/i18n/）
- AI 输出含 4 强制要素 + 5 引导按钮按角色裁剪（老板 5 / 智能管家 3 / 政企 3 / 员工 2）
- 营销 / 钩子 / 推送套用 Cialdini 6 原则 + 防黑暗模式 10 条 SHALL NOT
- 所有 prompt 必过 29-prompt-testing 黄金测试集（≥ 0.7 语义相似度）
- 所有 AI 调用前必查 BR-904 单客户成本上限（自动降级到备用模型）
- 所有报告 PDF 含客户姓名水印（嵌入式 PDF 内层 + 防 OCR）

【V4 IMPROVEMENTS 强制约束】
- 一期 M1-M3 关闭 PARTNER（FEATURE_FLAG_PARTNER_ENABLED=false）
- 火山方舟已移除（用 阿里百炼 + OpenRouter + DeepSeek 直连 3 渠道）
- 测试 fixtures 体系优先（02-spec R5 在 01-infra 后第 2 个落地）
- 跑到 M5 prompt 任务时停下，写 BLOCKED.md 等专家提供核心 Prompt 内容
- 所有占位凭证后台可视化替换（24-admin-console）

【主循环 · 每个 task】
LOAD（≤ 8 工具调用）
  → PLAN（不调工具，≤ 5 步）
  → CODE（≤ 12 工具调用，≤ 5 文件，≤ 500 行）
  → VERIFY（DoD ≤ 6 工具调用）
  → COMMIT 并 push 到 origin/main（强制每 task 单独 commit + push）
  → UPDATE progress.json
  → COMPACT（≥ 60% 主动结束会话）

【Git 工作流（每 task 必走）】
1. git add -A
2. git commit -m "feat(scope): <task-id> <一句话描述>"
   例：feat(types): 02-A1a 实现 packages/types/src/auth/role.ts
3. git push origin main
4. push 失败 → 重试 3 次 → 仍失败标记 task partial + BLOCKED.md
5. SHALL NOT 多 task 攒一起 commit
6. SHALL NOT 强制 push 已 push 的提交

【DoD V4 强制额外项】
- AI 输出生成必含 4 要素 + 5 引导（PBT 测试，缺则 throw REPORT.REQUIRED_ELEMENT_MISSING）
- prompt 模板必过价值密度自检（自动校验）
- UI 文案禁硬编码"中介"（grep 检查 0 个）
- 政企版禁海外模型（强制路由检查）
- 黄金测试集 ≥ 0.7 通过率（每个 prompt PR 必跑）

【完成后】
跑完 28 + 1 spec → 99-FINAL → 生成 docs/changelog/{date}-final-build-report.md → push → 等用户验收。

【红线 · 必停】
- 触发 security-rules.md 红线（资金 / 数据泄漏 / 越权）
- 触发 safety_guardrails 高风险动作（生产删除 / 强 push main）
- 缺 P0 真凭证（≥ 2 项 missing 而非 placeholder）
- 同一 task 失败 ≥ 3 次

跑起来。
```

---

## 段 2 · 日常续作（**第 2 次起每次都用这段**）

> Codex 上下文塞满会主动结束会话。下次打开 Codex CLI 粘贴下面这段即可续作。

```
继续 autopilot 自治循环开发（V4 IMPROVEMENTS）。

读 .kiro/state/progress.json 找 mode == autopilot 且 status 为 partial 或 pending 的下一个 task。

按 segment 1 同样的约束执行：
- 读必读文件（AGENTS.md / 5 个 steering / 4 个 ADR）
- 主循环 LOAD → PLAN → CODE → VERIFY → COMMIT + push → UPDATE → COMPACT
- 每 task 单独 git commit + push
- ≥ 60% 上下文主动结束

跑起来。
```

---

## 段 3 · 触发 VPS 部署（**W4-W5 基础设施做完才用**）

> 用法：当 Codex 完成 01-infra-monorepo + 06-auth-rbac + 07-subscription + 09-payment 等基础任务后，粘贴这段让 Codex 配 VPS 部署。

```
配置 VPS 自动部署链路（V4 IMPROVEMENTS · GitHub Actions → 阿里云 ACR → 阿里云 VPS）。

【环境信息】
- VPS IP：<待你提供>
- VPS OS：<待你提供>
- VPS 用户：<待你提供>
- VPS SSH 方式：<密码 / 密钥>
- 主域名：<待你提供，建议 tongqian.xin 或 tongqian.xin>
- 阿里云 ACR：<待开通后提供 registry URL>

【任务】
按 .kiro/specs/01-infra-monorepo/tasks.md 的 C1-E4 段执行：
1. 写 Dockerfile.api / Dockerfile.worker / Dockerfile.next / Dockerfile.nginx
2. 写 docker-compose.prod.yml
3. 写 .github/workflows/ci.yml + build-images.yml + deploy-staging.yml + deploy-prod.yml
4. 写 scripts/deploy.sh / canary.sh / rollback.sh / health-check.sh
5. GitHub Repository Secrets 配置清单（输出 markdown 给我手动配）：
   - ALIYUN_ACR_USERNAME / ALIYUN_ACR_PASSWORD / ALIYUN_ACR_REGISTRY
   - VPS_HOST / VPS_USER / VPS_SSH_KEY
   - DATABASE_URL（生产）/ REDIS_URL（生产）/ JWT_SECRET（生产，与 dev 不同）
   - 等等
6. VPS 首次手动部署 SOP（输出 markdown 给我）

【约束】
- 灰度 5% / 25% / 50% / 100%（每档 10/30/60 分钟观察）
- 健康检查不通过 30s → 自动回滚
- DB migration 在部署前先跑（独立 step）
- 备份脚本（每日 03:00 / 每小时增量 / OSS 跨区域）

【输出】
- 所有部署文件 commit + push
- 写 docs/changelog/{date}-vps-deploy-setup.md 总结
- 写 BLOCKED.md 列出"用户需手动配的 GitHub Secrets / VPS 凭证"

跑起来。
```

---

## 4 个常见问题处理

### Q1：Codex 跑到一半我能停吗？

可以。Codex 主动 60% 结束会话时会自动 commit + push 当前进度。强行 Ctrl+C 中断也没事，progress.json 会标 `partial`，下次粘贴段 2 续作即可。

### Q2：Codex 卡住了怎么办？

```powershell
# 1. 看 BLOCKED.md
Get-Content BLOCKED.md

# 2. 看 progress.json 状态
Get-Content .kiro/state/progress.json | Select-String "mode|current_task|blocked"

# 3. 看最后几次 commit
git log --oneline -10
```

如果是真卡（不是 BLOCKED）：粘贴段 2 让 Codex 重新接续。

### Q3：Codex 写错了怎么办？

```powershell
# 看最近 commit
git log --oneline -5

# 反向 commit（不破坏历史）
git revert HEAD

# 或者本地直接撤回（只对最后 1 commit 有效，且没 push 才能用）
git reset --soft HEAD~1
```

### Q4：万一 push 失败？

GitHub 凭证过期或网络问题：
```powershell
# 重新登录 git
git config --global credential.helper manager-core
git pull
git push
```

如果用 Personal Access Token：
```powershell
git remote set-url origin https://TOKEN@github.com/newshowkyo-crypto/tongqian-jianzhu-ai.git
```

---

## 启动前最后清单

- [ ] 本地装好 Node 22 / pnpm 9 / Docker Desktop / Git
- [ ] 项目根目录：`D:\tongqian`
- [ ] `.env` 已就绪（已自动生成）
- [ ] Git 远程 origin 已配（已配 newshowkyo-crypto/tongqian-jianzhu-ai）
- [ ] 第一次 commit 已 push（已完成）
- [ ] Codex CLI 已安装
- [ ] **粘贴段 1 启动**

---

## 你接下来做的事时间线

| 阶段 | 周次 | 你做 | Codex 做 |
|---|---|---|---|
| **现在** | Day 0 | 粘贴段 1 启动 | 跑 01-A1 ~ 03-G2 基础设施 |
| **域名** | W1 | 买 tongqian.xin + tongqian.xin / 提交备案 | 继续推进 |
| **W2-W3** | Day 7-21 | 看进度 | 跑 06-09 商业核心 + 04 AI Gateway |
| **W4** | Day 28 | 提供 VPS 信息 + 粘贴段 3 | 配 VPS 部署链路 |
| **W5** | Day 35 | 配 GitHub Secrets / VPS 首次部署 | 跑 5 大杀手锏 |
| **W6-W12** | Day 42-84 | 配合写 30+ Prompt 内容 | 跑剩余 spec |
| **M3** | 上线前 | 内测客户晚宴 | 99-FINAL 验收 |

---

## 一句话总结

**今天**：粘贴段 1，让 Codex 开跑。
**这周内**：买域名（tongqian.xin 优先备案 + tongqian.xin 备）。
**4 周后**：把 VPS 信息发我（IP / OS / 用户 / SSH），我帮你拼段 3 让 Codex 配部署。
