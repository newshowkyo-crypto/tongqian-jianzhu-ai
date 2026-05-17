# 2026-05-16 商业模型 V4 + 5 大杀手锏精细化 + 8 个 bug 补丁

## 触发

经创始人 7 轮深度对话（取消保证金 → 改名智能管家 → 4 角色重定义 → 注册流程升级 → 5 大杀手锏精细化 → 上瘾机制重审 → 全量 bug 审计 → 商业宪法 V4），需要把所有讨论结晶成可执行的 spec 修订。

## 决策

详见 [ADR-AUTO-2026-05-16-V4](decisions/2026-05-16-adr-auto-business-model-v4.md)：商业模型 V4 + 5 大杀手锏精细化 + 8 个 bug 补丁。

## 改动清单（18 个文件）

### 基础层（3 个）

- `AGENTS.md` 新增 §3.8 商业宪法 V4（红线 3 + 价值密度自检表 + 4 强制要素 + 5 引导按钮）
- `docs/glossary.md` 已含双轨命名 §0
- `docs/business-model.md` 新增 §18 V4 宪法 + §19 政策性资金作战地图（30+ 资金 + 4 层更新）

### 顶层（1 个）

- `.kiro/specs/00-project-overview/requirements.md` 升级 BR-322（5 引导按钮 + 4 强制要素 + 难度雷达图）+ 新增 BR-325 V4 宪法

### 杀手锏精细化（5 个）

- `.kiro/specs/15-ops-toolkit/requirements.md`（重写）杀手锏 E：含 AI 老板助理 + 6 大日常钩子 + 财务 / 商务 / 资料员工具 + 政企公文矩阵 + 5 档功能墙 + 5 引导按钮
- `.kiro/specs/14-qualification-guard/requirements.md` 新增 R10-R13：智能管家业务延伸 + 5 个智能管家专属工具 + 挂证合规规避 + 派单标准
- `.kiro/specs/11-opportunity-radar/requirements.md` 待精细化（保留原 spec）
- `.kiro/specs/12-tender-factory/requirements.md` 待精细化（保留原 spec）
- `.kiro/specs/13-risk-review/requirements.md` 待精细化（保留原 spec）

### 横切补充（10 个）

- `.kiro/specs/06-auth-rbac/requirements.md` 新增 R3.4-R3.6：手机+微信注册 + 注册冲突检测 + 智能管家审核流程
- `.kiro/specs/16-project-site/requirements.md` 新增 R7：安全生产辅助提醒（V4 降级版）
- `.kiro/specs/22-agent-workspace/requirements.md` 新增 R10-R14：智能管家职责定义 + AI 客户预警卡 + 案例市场 + 防黑 4 维 + 边界
- `.kiro/specs/23-gov-soe-workspace/requirements.md`（重写）新增 R5-R10：政策性资金作战地图（30+ 资金 + 4 层更新机制 + 一键扫描）+ 项目台账 + 化债咨询 + 合规水印 + 政企不游戏化
- `.kiro/specs/24-admin-console/requirements.md` 新增 R13-R21：Feature Flag / 公告 / 数据库管理 / 系统日志 / 性能仪表盘 / 智能管家审核 / 案例市场审核 / 政策资金管理 / 上瘾机制后台
- `.kiro/specs/26-addiction-system/requirements.md` 新增 R12-R16：16 个粘性钩子分组 + 输出价值标杆 + 分期落地表 + 奖励发放清算流程 + 政企不游戏化
- `.kiro/specs/28-security-compliance/requirements.md` 新增 R5-R9：智能管家服务协议合规 + AI 数据源合规 + 政企公文水印 + AI 输出免责强制 + 项目寻源数据流约束
- `.kiro/specs/10-report-center/requirements.md` 新增 R8-R10：执行难度雷达图 + 报告水印 + traceId + 4 强制要素 + 5 引导按钮
- `.kiro/specs/09-payment-gateway/requirements.md` 新增 R10：大奖对公转账（≥¥800 必走对公 + 个税 20% 代扣）

## 8 个 bug 补丁映射

| Bug | 影响文件 | 补丁内容 |
|---|---|---|
| P1 | 24-admin-console R13-R17 | Feature Flag / 公告 / 数据库 / 日志 / 性能仪表盘 |
| P2 | 23-gov-soe-workspace R5 + 24 R20 | 资金窗口期智能提醒 + 增量更新 + 一键扫描按钮 |
| P3 | 22-agent-workspace R10 | AI 客户预警卡（信号库 + 预警 UI + 行为约束）|
| P4 | 28-security-compliance R5-R8 + 10-report-center R9 | 智能管家 5 项承诺 + AI 数据源合规 + 政企水印 + 报告免责强制 |
| P5 | 06-auth-rbac R3.5 | 手机号冲突检测（3 类场景 + 客服迁移）|
| P6 | 26-addiction-system R15 + 09-payment-gateway R10 | 3 层清算（点数 / 实物 / 现金）+ ≥¥800 对公转账 |
| P7 | 22-agent-workspace R11 + 24-admin-console R19 | 案例市场 3 道审核（自审 + AI 审 + 专家审）|
| P8 | 23-gov-soe-workspace R4 + 28-security-compliance R9 | 项目寻源双向脱敏 + 国产模型 only |

## 5 个 Q 决策（营销 + 说服学 + 架构师视角）

- Q1：早安简报 50 点 / 天 + 月度按档限免
- Q2：决策小测每天 1 题免 + 第 2 题 50 点；灵感卡每天前 3 张自动免 + 主动调 30 点
- Q3：政企一案两书 ¥199 月限 1 次免 / ¥499 月限 3 次免 / ¥999 月限 10 次免
- Q4：灵感卡 4 条件触发 + 默认每天 1 张主动 + 可关闭
- Q5：所有老板对话走 E（AI 助理）入口 + 内部分发到 ABCD（意图识别 10 点）

## 影响

### 代码层
- 零数据库迁移（schema 不动）
- 新增 prompt 模板 30+ 个（apps/api/src/prompts/）
- 新增 i18n 字典（packages/types/src/i18n/）
- Feature Flag 系统首次引入

### 商业层
- 智能管家定位升级：从"中介"到"智能管家 = 线下跑腿 + 关系 + 兜底"
- 上瘾机制 9 → 16
- 政企新增 30+ 资金作战地图
- 5 引导按钮按角色裁剪

### 合规层
- 法律免责声明所有报告底部强制
- 政企版水印 + 强制国产模型
- 智能管家 5 项合规承诺
- 中奖 ≥¥800 强制对公（个税合规）

## 后续

1. 智能管家协议律师起草
2. 智能管家学院 6 节培训内容大纲
3. AI Prompt 模板初稿（30+）
4. 数据爬虫工作（11 大权威源）
5. 杀手锏 A / B / C 待精细化（保留现有 spec 框架）
6. 进入 Codex Autopilot 自治开发
