# 2026-05-16 V4 IMPROVEMENTS 终版（启动开发前最后修补）

## 触发

经创始人评估 V4 系统的"落地率与爆款概率"，确定 4 项改进 + 1 项调整 + 8 个重大漏洞修补，作为启动 Codex Autopilot 前的最后一次升级。

## 决策

详见 [ADR-AUTO-2026-05-16-IMPROVEMENTS](decisions/2026-05-16-adr-auto-improvements-package.md)。

## 改动清单

### 4 项主要改进（决策 1-4）

| # | 改进 | 落地 |
|---|---|---|
| 1 | 智能管家代理人 PARTNER 角色 | 22-spec R15 / 24-spec R22 / BR-004 升级 5 子类型 / 二期 M4 启用 |
| 2 | 核心 Prompt 由专家亲自写（W4-W12 提醒）| owner-checklist M 段 + Codex W4 触发 BLOCKED |
| 3 | M3 内测客户晚宴 | owner-checklist H5（你团队已有计划，仅记录）|
| 4 | 专家黄金测试集 | 29-prompt-testing 独立子 spec（8 任务 + 300 案例）|

### 1 项调整（决策 5）

| 调整 | 落地 |
|---|---|
| 火山方舟移除 → DeepSeek 直连替代 | decision-defaults §6 / 04-spec / .env.example |

### 8 个重大漏洞修补（决策 6）

| # | 漏洞 | 修补位置 |
|---|---|---|
| 1 | 运营成本"虚增" | BR-903 / 24-spec R24 |
| 2 | 客户 Onboarding | 26-spec R17（5 触点）|
| 3 | 客服 SOP | owner-checklist T+U 段 |
| 4 | 报告反盗版 | 10-spec R11 |
| 5 | 智能管家私下交易反作弊 | 22-spec R17 |
| 6 | AI 成本飙升降级 | BR-904 / 04-spec R12 |
| 7 | 案例市场抄袭 | 22-spec R11 升级 |
| 8 | 测试 fixtures 体系 | 02-spec R5 |

## 文件改动统计

```
spec 改动：13 个
ADR 新增：1 个（improvements-package）
changelog：本文件
准备清单：PREP-CHECKLIST.md 重写 + owner-checklist T/U 段
.env.example：火山方舟改 DeepSeek + PARTNER 配置
progress.json：精简 P0 + 加 29-A1~A8 任务
新增子 spec：29-prompt-testing 完整三件套
```

## V4 IMPROVEMENTS 总任务数

```
原 28 spec 任务（progress.json）：~ 230
V4 主 ADR P1-P8 补丁任务：~ 70
V4 IMPROVEMENTS 任务：62
29-prompt-testing 任务：8

V4 IMPROVEMENTS 完成后总任务：~ 370
预计 Codex Autopilot 完成时间：6-10 周
（取决于上下文管理 + 单次推进效率）
```

## 启动条件

P0 凭证最小集（6 项）：
- ALIYUN_DASHSCOPE_API_KEY（10 分钟开通）
- OPENROUTER_API_KEY（5 分钟开通 + USDT 充值）
- DEEPSEEK_API_KEY（你已有）
- JWT_SECRET（PowerShell 30 秒生成）
- WECHAT_PAY_MCH_ID + WECHAT_MP_APP_ID（你已申请到位）
- DATABASE_URL / REDIS_URL（Codex 自动 Docker）

## 后续依赖（不阻塞启动）

- W4-W12 由你团队配合写 30+ Prompt 内容
- 上线前 1 个月律师起草 6 份协议
- 上线前 1 个月你团队写 100+ 客服 SOP
- 上线前 1 个月专家打 50+ 黄金测试集
- M3 内测客户晚宴
- M4 PARTNER 通道开放

## 评估

```
V4 商业宪法：✅ 锁定（红线 3 + 价值密度自检 + 5 引导）
V4 IMPROVEMENTS：✅ 锁定（PARTNER + 测试集 + 8 漏洞补完）
落地率：85-90%
爆款概率：60-70%（中性达标 ¥424 万首年净利）
```
