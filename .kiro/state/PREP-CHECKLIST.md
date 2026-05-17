# 创始人准备清单（V4 IMPROVEMENTS 精简版）

> 启动 Codex Autopilot 前的最小准备清单。已就绪的可勾选。

## ✅ 已就绪（你已确认）

- [x] 阿里云 VPS 已购买
- [x] 阿里云账号
- [x] 微信支付商户号已申请
- [x] 微信支付 API_KEY 已申请
- [x] 微信公众号在更新（认证中 / 已认证）
- [x] 企业微信已有
- [x] 支付宝商户已申请
- [x] DeepSeek 直连 API Key 已有
- [x] 域名 tongqian.io 已有
- [x] GitHub 私有仓库已创建（推测，需确认）

---

## 🔥 P0 必填（开发期 Day 1 启动 Codex 必备）

填进 `.env` 文件（仓库根目录，不 commit）。

### 1. 阿里百炼（10 分钟）

```
1. 登录 bailian.console.aliyun.com
2. 同账号点击"立即开通"（免费）
3. "我的" → "API-KEY 管理" → "创建新的 API-KEY"
4. 复制 sk-xxxxx
5. 充值 ¥3,000（费用 → 充值）
```

填到 `.env`：
```
ALIYUN_DASHSCOPE_API_KEY=sk-xxxxx
```

### 2. OpenRouter（5 分钟）

```
1. openrouter.ai → Sign In（Google 或邮箱）
2. Settings → Keys → Create Key → 命名 "tongqian-dev"
3. 复制 sk-or-v1-xxxxx
4. 充值 $300（USDT TRC20 即可，无需海外信用卡）
```

填到 `.env`：
```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### 3. DeepSeek 直连（你已有，把 key 填上）

```
（你已有，从已有项目找到 key）
```

填到 `.env`：
```
DEEPSEEK_API_KEY=sk-xxxxx
```

### 4. JWT_SECRET（30 秒，本地生成）

PowerShell 运行：
```powershell
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

填到 `.env`：
```
JWT_SECRET=ABCD1234...（你生成的 64 位 hex）
```

### 5. 微信支付 / 公众号凭证（你已申请到位，整理凭证给 Codex）

填到 `.env`：
```
WECHAT_PAY_MCH_ID=你的商户号
WECHAT_PAY_API_KEY=你的支付密钥
WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem  （证书放仓库 certs/ 目录，已加 .gitignore）
WECHAT_MP_APP_ID=你的公众号 AppID
WECHAT_MP_APP_SECRET=你的公众号 AppSecret
```

### 6. 数据库 / Redis（开发期 Codex 自动用 Docker，无需你填）

Codex 会写 docker-compose.dev.yml 自动起：
```
DATABASE_URL=postgresql://postgres:tongqian@localhost:5432/tongqian
REDIS_URL=redis://localhost:6379
```

---

## 🟡 P1 开发中后期补（W4 起 Codex 跑到对应 spec 时会 BLOCKED 提醒你）

### 7. 阿里云 OSS（5 分钟，开通教程见下）

### 8. 阿里云 OCR / 文档智能（5 分钟）

### 9. 阿里云 SLS 日志（5 分钟）

### 10. 阿里云短信（10 分钟开通 + 1-3 天审签名）

### 11. 支付宝凭证（你已申请）

### 12. 企业微信凭证

### 13. DashVector 向量库（可推迟到 M2）

---

## 📚 阿里云 5 服务开通教程

> 与你买 VPS 同账号即可，无需新账号

### A. 阿里云 OSS

1. console.aliyun.com → 搜"对象存储 OSS" → 立即开通（免费）
2. "创建 Bucket"：
   - 名称 `tongqian-dev`
   - 区域：与 VPS 同区
   - 类型：标准存储
   - 权限：私有
   - 加密：OSS 完全托管
3. 再创建 `tongqian-prod`
4. 右上角头像 → AccessKey 管理 → 创建 AccessKey
5. 保存 ID + Secret

### B. 阿里云 OCR / 文档智能

1. 搜"文字识别 OCR" → 免费开通
2. 复用 OSS 的 AccessKey
3. 搜"文档智能 docmind" → 单独开通

### C. 阿里云 SLS

1. 搜"日志服务 SLS" → 免费开通
2. 创建 Project：`tongqian-logs` / 区域同 VPS
3. 创建 Logstore：`app-logs` / 保留 90 天

### D. 阿里云短信（最复杂，需审）

1. 搜"短信服务" → 免费开通
2. 国内消息 → 签名管理 → 添加签名 `同乾方略`
   - 类型：企业或网站
   - 上传：营业执照 + ICP 备案号
3. 等 1-3 天审核通过
4. 模板管理 → 添加 4 个常用模板：
   - 验证码：您的验证码是 {1}，5 分钟内有效。
   - 续费成功：您的同乾方略订阅已续费成功，到账 {1} 点。
   - 大奖通知：恭喜您获得 {1}，请登录后台查看。
   - 收益日历（智能管家专用）：昨日入账 ¥{1}，累计 ¥{2}。
5. 等模板审核 1-3 天

### E. DashVector 向量库

1. 搜"DashVector" → 立即开通
2. 创建实例（最小规格 ¥500/月）
3. 创建 Cluster + AccessKey

---

## 🛠 启动 Codex 步骤（精简）

### Step 1：本地开发环境（5 分钟）

```powershell
# 安装 Node 22 + pnpm 9 + Docker Desktop
# (你应该已有 Codex / Claude Code 环境)

# 拷贝 .env
cp .env.example .env
# 编辑 .env 填上面 P0 5 项
notepad .env
```

### Step 2：粘贴启动指令到 Codex

```
开始 autopilot 自治循环开发模式（V4 IMPROVEMENTS）。

详读以下文件：
- AGENTS.md §3.7 双轨命名 + §3.8 商业宪法 V4
- .kiro/steering/business-theory.md 营销 / 说服学 / 架构理论
- .kiro/steering/autopilot-rules.md / decision-defaults.md / token-budget.md / self-verification.md / error-recovery.md
- docs/decisions/2026-05-16-adr-auto-business-model-v4.md
- docs/decisions/2026-05-16-adr-auto-improvements-package.md
- docs/decisions/2026-05-16-adr-auto-rename-agent-to-steward.md
- docs/decisions/2026-05-16-adr-auto-remove-agent-deposit.md

启动步骤：
1. 改 progress.json mode = autopilot
2. 跑 00-PRE-1：读 .env 对照 P0 凭证清单（精简版，5 项最小集）
3. P0 缺失 → BLOCKED.md / 全部就绪 → 跑 01-A1
4. 按 build-order.md 推进 28 + 1 spec（含 29-prompt-testing）

V4 强制约束：
- prompt 必过价值密度自检表 6 题
- UI 走 i18n 不硬编码"智能管家"
- AI 输出含 4 强制要素 + 5 引导按钮按角色裁剪
- 营销套用 Cialdini 6 原则 + 防黑暗模式 10 条 SHALL NOT
- 所有 prompt 必过 29-prompt-testing 黄金测试集

V4 IMPROVEMENTS 强制约束：
- 一期 M1-M3 暂不开放 PARTNER 注册（Feature Flag 控制）
- 跑到 prompt 任务时停下等专家提供内容（W4-W12 阶段）
- 火山方舟已移除（用阿里百炼 + OpenRouter + DeepSeek 直连 3 渠道）

完成 28 + 1 spec → 99-FINAL → 生成最终报告。

跑起来。
```

### Step 3：盯进度（每天 5 分钟）

```bash
# 看进度
cat .kiro/state/progress.json | grep done_count
# 看 BLOCKED
ls BLOCKED.md
# 看提交
git log --oneline -10
```

### Step 4：W4 起准备 P1（不阻塞 Codex）

按 `docs/owner-preparation-checklist.md` M / N / O / P / Q 段推进。

### Step 5：W4-W12 你团队配合写核心 Prompt 内容

Codex 跑到合同审查 / 标书 / 资质 / 资金匹配 / 早安简报 时会停下 → 你团队咨询专家给内容 → 继续。

---

## 🎯 上线后日常运维（≤ 5 分钟 / 天）

打开 `https://admin.tongqian.io`：
- 红线告警（自动企微推送）
- 智能管家审核队列
- 退款 / 提现审批
- 月度自检报告

99% 操作不写代码。
