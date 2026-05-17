# Codex Autopilot V4 IMPROVEMENTS 终版启动指令

> 复制下面 ⬇️ 区块完整内容（含三个反引号围栏的指令文本），粘贴到 Codex / Claude Code 的会话框，按 Enter。
>
> Codex 会自动检查 .env、自动起 Docker、按 build-order 推进 ~370 个 task，跑完 28 + 1 spec 自动通知验收。
>
> 预计开发时长：6-10 周（取决于 Codex 单次推进能力 + 上下文管理）。

---

## 🚀 V4 IMPROVEMENTS 终版启动提示词

⬇️ 从下面这行开始复制 ⬇️

```
开始 autopilot 自治循环开发模式（V4 IMPROVEMENTS 终版 · 2026-05-16）。

【最高约束 · 必读】
1. AGENTS.md §3.7 双轨命名（agent 代码层 / 智能管家 用户可见层）
2. AGENTS.md §3.8 商业宪法 V4（红线 3 + 价值密度自检表 + 4 强制要素 + 5 引导按钮按角色裁剪）
3. .kiro/steering/business-theory.md（AARRR / Cialdini 6 原则 / 12-Factor / 事件驱动 / CQRS / Feature Flag）
4. .kiro/steering/autopilot-rules.md / decision-defaults.md / token-budget.md / self-verification.md / error-recovery.md

【V4 IMPROVEMENTS 增量约束】
5. docs/decisions/2026-05-16-adr-auto-business-model-v4.md（V4 主 ADR）
6. docs/decisions/2026-05-16-adr-auto-improvements-package.md（V4 IMPROVEMENTS 含 PARTNER + 黄金测试集 + 8 漏洞补丁）
7. docs/decisions/2026-05-16-adr-auto-rename-agent-to-steward.md
8. docs/decisions/2026-05-16-adr-auto-remove-agent-deposit.md

【启动步骤 · 不询问任何确认问题】
1. 读 .kiro/state/progress.json 把 mode 从 standby 改为 autopilot，记录 started_at
2. 跑 00-PRE-1 启动检查：
   - 读 .env，对照 P0 凭证（精简 6 项）
     • DASHSCOPE_API_KEY / OPENROUTER_API_KEY / DEEPSEEK_API_KEY ← 已就绪
     • JWT_SECRET / ENCRYPTION_KEY / CSRF_SECRET ← 已就绪
   - 检测 PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL 占位（微信支付 / 公众号 / 阿里云 / 支付宝 / 短信）
     SHALL：把这些条目标记为"placeholder"状态而非"missing"
     SHALL：实施时启用 mock provider，对应 e2e 测试自动跳过
     SHALL：写进 admin-console（24-spec）后台可视化替换页面（让用户后续一键替换）
     SHALL NOT：因占位 BLOCKED 暂停整体开发
3. 跑 00-PRE-2（检查 Docker / pnpm / Node 22 已安装）+ 00-PRE-3（git remote 已配置）
   - 缺 Docker → 提示用户安装 Docker Desktop（这是唯一 BLOCKED）
4. 全部就绪 → 按 build-order.md 找 01-A1 开始

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
- 所有占位凭证后台可视化替换（admin-console R13 Feature Flag + R14 公告 + R20 政策资金 + 系统配置编辑器）

【主循环 · 每个 task】
LOAD（≤ 8 工具调用）→ PLAN（不调工具，≤ 5 步）→ CODE（≤ 12 工具调用，≤ 5 文件，≤ 500 行）→ VERIFY（DoD ≤ 6 工具调用）→ COMMIT（conventional commits + V4 标识 + task id + DoD 结果 + next）→ UPDATE progress.json → COMPACT（≥ 60% 主动结束会话）

【DoD V4 强制额外项】
- AI 输出生成必含 4 要素 + 5 引导（PBT 测试，缺则 throw REPORT.REQUIRED_ELEMENT_MISSING）
- prompt 模板必过价值密度自检（自动校验）
- UI 文案禁硬编码"中介"（grep 检查 0 个）
- 政企版禁海外模型（强制路由检查）
- 黄金测试集 ≥ 0.7 通过率（每个 prompt PR 必跑）

【完成后】
跑完 28 + 1 spec → 99-FINAL → 生成 docs/changelog/{date}-final-build-report.md → 推 GitHub → 等用户验收。

【红线 · 必停】
- 触发 security-rules.md 红线（资金 / 数据泄漏 / 越权）
- 触发 safety_guardrails 高风险动作（生产删除 / 强 push main）
- 缺 P0 真凭证（≥ 2 项 missing 而非 placeholder）
- 同一 task 失败 ≥ 3 次

跑起来。
```

⬆️ 复制到这里为止 ⬆️

---

## 📋 你要做的 3 件事

### 1. 把上面三个反引号围栏内的指令复制粘贴到 Codex / Claude Code 会话框

### 2. 等 Codex 启动 → 它会做：
- ✅ 读 .env（已自动生成）
- ✅ 起 Docker Compose（postgres + redis）
- ✅ 跑 01-A1 初始化 monorepo
- ✅ 按 build-order 推进 ~370 个 task

### 3. 每天 5 分钟看进度

```bash
# 看进度
cat .kiro/state/progress.json | grep -E "mode|done_count|current_task"

# 看 BLOCKED
ls BLOCKED.md  # 有则需要你介入

# 看 commit
git log --oneline -20
```

---

## 🔑 .env 已自动生成（无需你手动填）

| 项 | 状态 |
|---|---|
| AI 模型 3 个 key | ✅ 已填（开发期临时，上线后通过 admin 后台一键替换）|
| JWT / Encryption / CSRF 密钥 | ✅ 自动生成 |
| Postgres 密码 | ✅ 自动生成 |
| 微信 token / aeskey | ✅ 自动生成 |
| 微信 / 支付宝 / 阿里云 业务凭证 | 🟡 占位（admin 后台可视化一键替换）|

---

## 🛡 安全提醒（再次强调）

- `.env` 已在 `.gitignore`，不会进 git
- 上传到 GitHub 时，secrets 单独管理（GitHub Repository Secrets）
- 部署到 VPS 时，生产 .env 单独管理（不与 dev 共用）
- 你之前发到聊天的 3 个真实 key 仍存在风险，**强烈建议** 现在去对应控制台 revoke 重生（开发期不影响，上线前必做）

---

## 📅 后续重要里程碑

| 周次 | 里程碑 | 你的行动 |
|---|---|---|
| W1 | Codex 跑完 01-05 基础设施 | 看进度 |
| W2 | Codex 跑完 06 鉴权 + 07 订阅 + 08 点数 | 看进度 |
| W3-W4 | Codex 跑完 09 支付 + 10 报告 + 04 AI Gateway | 看进度 |
| W5 | Codex 卡在 prompt 任务 | **你团队咨询专家配合写 5-10 核心 prompt 内容** |
| W6-W8 | 5 大杀手锏开发 | 看进度 |
| W9-W12 | 智能管家 + 政企 + 后台 + 上瘾 + 合规 | 看进度 |
| M3 上线前 | 内测晚宴 | 你团队执行（已有计划）|
| M4 起 | 上线 + PARTNER 通道开放 + 持续迭代 | 同乾方略团队全员 |

---

## 🆘 万一卡住

如果 Codex 跑出问题：

1. **看 BLOCKED.md**：Codex 会写明哪个 task 卡了 + 原因
2. **看 progress.json**：mode 字段告诉你当前状态（autopilot / paused / done）
3. **看 git log**：最近 10 次 commit 看 Codex 做了什么
4. **重启 Codex 会话**：粘贴本启动指令即可恢复（Codex 会从 progress.json 接续）

---

**spec 仓终版完成。.env 终版完成。启动指令终版完成。**

**接下来是你的 1 步操作：把上面框内的指令复制到 Codex 会话，按 Enter。**
