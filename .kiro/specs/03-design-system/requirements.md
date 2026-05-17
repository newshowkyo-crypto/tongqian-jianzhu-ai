# 03 设计系统（Design System）- Requirements

## Introduction

> **同乾方略 · 建筑 AI 经营管家** 的统一 UI 设计系统 + 共享组件库。本 spec 把 [`ui-visual-spec.md`](../../steering/ui-visual-spec.md) 与 [`ui-ux-rules.md`](../../steering/ui-ux-rules.md) 的"视觉宪法"物理化为 `packages/ui` 中可被 4 大子前端（apps/web / gov / agent / admin）+ 桌面端复用的代码库。
>
> **核心目标**：让 4 个前端长得像同一个产品，让 Codex 写前端时只调用现成组件、不发明新组件。

**关联顶层 spec**：[`00-project-overview`](../00-project-overview/) — 实现 D-3（共享契约层）的 UI 部分；落地 [`design.md` §5.6 BR-405](../00-project-overview/design.md)（点数 UI 一致性）。

**前置依赖**：
- [`01-infra-monorepo`] 完成 Phase A（packages 占位目录）
- [`02-shared-contracts`] 完成 Phase F2（ui 起步骨架，含 design-token）

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| Design Token | 颜色 / 字号 / 间距 / 阴影 / 圆角的命名变量（CSS 变量 + Tailwind preset 双形态）|
| Primitive | 包装 shadcn/ui 的最小基础组件（Button / Input / Card 等）|
| Domain Component | 业务领域组件（OpportunityCard / RiskBadge / LevelBadge 等）|
| Composition | 由 primitives 组合的页面级骨架（PageLayout / PageHeader / DataTable）|

---

## Requirements

### Requirement 1：Design Token 体系

**User Story**：作为前端开发者（人 + Codex），我希望所有颜色 / 字号 / 间距 / 阴影 / 圆角都从 token 取，不允许写死值，以便整体视觉统一、暗色模式预留接口、4 个子前端微调主题（accent 色、字号 +1 档等）只改 token。

#### Acceptance Criteria

1. THE `packages/ui/src/tokens/` SHALL 提供 5 类 token：`colors.ts` / `typography.ts` / `spacing.ts` / `radius.ts` / `shadows.ts`，**值与 [`ui-visual-spec.md` §2/§3/§4](../../steering/ui-visual-spec.md) 完全一致**（精确到 HEX）。
2. THE token SHALL 双形态导出：
   - **CSS 变量**：写入 `packages/ui/src/styles/tokens.css`，挂在 `:root` 与 `.dark`（暗色模式预留，一期不实现）
   - **Tailwind preset**：导出 `packages/ui/src/tailwind-preset.ts`，被 4 个 `apps/{name}/tailwind.config.ts` 引用
3. THE 4 个子前端 SHALL 在自己的 `tailwind.config.ts` 中**仅覆盖 accent 与字号倍率**（按 [`ui-visual-spec.md` §9](../../steering/ui-visual-spec.md)）：
   - `apps/web`：accent = 同乾金（默认）
   - `apps/gov`：accent 移除 + 字号 +1 档 + primary-700 强化
   - `apps/agent`：accent + LV5 紫色渐变可用
   - `apps/admin`：表格密度 +20% + 移除装饰
4. THE token SHALL NOT 在业务代码中被任何 `inline style` 或硬编码值绕过；ESLint 规则 `no-restricted-syntax` 禁用 inline `color: '#xxx'`。

---

### Requirement 2：Primitive 组件（包装 shadcn/ui）

#### Acceptance Criteria

1. THE `packages/ui/src/primitives/` SHALL 提供以下组件（按 [`ui-ux-rules.md` §5.1](../../steering/ui-ux-rules.md) 白名单）：
   - 表单类：`Button` / `Input` / `Textarea` / `Select` / `Checkbox` / `Radio` / `Switch` / `Slider` / `DatePicker` / `DateRangePicker` / `FileUpload` / `Combobox`
   - 布局类：`Card` / `Tabs` / `Accordion` / `Collapsible` / `Separator`
   - 反馈类：`Dialog` / `AlertDialog` / `Sheet` / `Drawer` / `Popover` / `Tooltip` / `Toast` / `Alert`
   - 数据类：`Table` / `DataTable`（TanStack Table 集成）/ `Pagination` / `Badge` / `Avatar` / `Progress` / `Skeleton` / `Spinner` / `Breadcrumb`
2. 每个 primitive SHALL 100% 用 token 驱动样式，**SHALL NOT** 引入未在白名单内的 UI 库。
3. 每个 primitive SHALL 在 `packages/ui/src/primitives/__tests__/` 提供 RTL（React Testing Library）渲染 + 基础交互测试。

---

### Requirement 3：Layout Composition 组件

#### Acceptance Criteria

1. THE `packages/ui/src/layout/` SHALL 提供：
   - `PageLayout`：根布局（侧栏 + 顶部导航 + 主内容 + 页脚）
   - `PageHeader`：含 title / description / breadcrumbs / actions
   - `PageContent`：主内容容器（max-w-7xl + 间距规范）
   - `SectionCard`：内容分组卡片（含可选状态条）
   - `FilterBar`：列表页过滤栏
   - `EmptyState` / `LoadingState` / `ErrorState`：3 种 UI 状态（按 [`ui-ux-rules.md` §7](../../steering/ui-ux-rules.md) 强约束）
2. 每个 layout 组件 SHALL 内置移动端响应式（按 [`ui-visual-spec.md` §4.4](../../steering/ui-visual-spec.md) 断点）。

---

### Requirement 4：Data Display 组件

#### Acceptance Criteria

1. THE `packages/ui/src/data-display/` SHALL 提供：
   - `StatCard`：KPI 数据卡（首页 4 件套用，含图标 + 数字 + 趋势）
   - `TrendCard`：含 Recharts mini chart 的趋势卡
   - `RiskBadge`：3 色风险徽章（🟢 / 🟡 / 🔴，按 [`ui-visual-spec.md` §2.3](../../steering/ui-visual-spec.md)）
   - `LevelBadge`：智能管家 5 级勋章（LV1 灰 / LV2 蓝 / LV3 青 / LV4 金 / LV5 紫渐变，按 [`ui-visual-spec.md` §2.4](../../steering/ui-visual-spec.md)）
   - `TierBadge`：AI 报告 Tier 1-4 徽章（按 [`ui-visual-spec.md` §2.5](../../steering/ui-visual-spec.md)）
   - `ConfidenceIndicator`：4 圆点信心度（●●●○）
   - `CreditDisplay`：点数显示组件（强制 1 元 = 100 点格式，落地 BR-405）
   - `MoneyDisplay`：金额显示（千分位 + tabular-nums，自动转万 / 亿）
   - `RelativeTime`：相对时间 + 鼠标悬停绝对时间
2. CreditDisplay SHALL 在所有用户可见的扣费 UI 强制使用，业务代码 SHALL NOT 直接渲染 `元` 字。

---

### Requirement 5：Form Composition 组件

#### Acceptance Criteria

1. THE `packages/ui/src/forms/` SHALL 提供：
   - `FormShell`：基于 react-hook-form + zod 的表单骨架（错误处理 / 提交态 / 重置）
   - `FormField`：单字段包装（label + input + error 三件套）
   - `FormSection`：多段表单分组
2. THE 业务表单 SHALL 一律使用 FormShell，禁止 useState 管理复杂表单字段（[`ui-ux-rules.md` §5.4](../../steering/ui-ux-rules.md)）。

---

### Requirement 6：Domain Components（业务组件）

> 这些组件复用度极高，多个杀手锏页面都会用。

#### Acceptance Criteria

1. THE `packages/ui/src/domain/` SHALL 提供：
   - `OpportunityCard`：项目机会卡（消费 [`11-opportunity-radar`] 输出）
   - `RiskFinding`：风险发现条目（消费 [`13-risk-review`] / [`12-tender-factory`] 输出）
   - `QualificationCard`：资质证书卡
   - `DispatchCard`：派单卡（含智能管家信誉 / 报价标色 / 接单 CTA）
   - `AgentRow`：智能管家列表行（头像 / 等级 / 信誉分 / 评价摘要 / 报价）
   - `ReportHeader`：AI 报告封面（含联合品牌 + 4 强制要素：disclaimer / tier / confidence / nextStep）
   - `ServicePremiumCard`：高端服务货架卡（10 类 B 类服务用）
2. 每个 domain 组件 SHALL 仅消费 `packages/types` 的 DTO，**SHALL NOT** 直接调用 API（API 调用在业务页面）。

---

### Requirement 6.5：OWNER 首页 / 工作台骨架（落地顶层 R3 A.1 / R3.5）

> 各角色登录后看到差异化首页（OWNER / 标书员 / 项目经理 / 财务 / 资料员 等），由本 spec 提供**布局组件 + 数据消费契约**。

#### Acceptance Criteria

1. THE `packages/ui/src/dashboards/` SHALL 提供：
   - `OwnerDashboard`：OWNER 登录默认首页（KPI 4 件套 + 今日机会 + 风险红灯 + 待办审批）
   - `TenderWriterDashboard`：标书员投标工作台
   - `PMDashboard`：项目经理项目驾驶舱（仅 ¥499+ 档位）
   - `FinanceDashboard`：财务现金流看板
   - `DocStaffDashboard`：资料员归档工作台
2. 每个 dashboard SHALL 通过 props 接收已加载的数据，**SHALL NOT** 内部 fetch（apps/web 的 page 负责数据加载）。
3. KPI 数据来源（apps/web page 编排，不是 packages/ui）：
   - 今日机会 → [`11-opportunity-radar`] `GET /opportunities?today=true&limit=5`
   - 风险红灯 → [`14-qualification-guard`] `GET /qualifications/expiring` + [`19-cashflow-finance`] 现金流告警 + [`13-risk-review`] 高风险合同
   - 待办审批 → [`06-auth-rbac`] `GET /approvals/me/pending`
   - KPI 4 件套（订阅状态 / 点数余额 / 月度报告数 / 信誉分） → [`07`] / [`08`] / [`10`] / [`22`]
4. THE 角色 → 默认首页路由 SHALL 由 [`06-auth-rbac`] 在登录返回 JWT 时附带 `defaultDashboard` 字段（基于 PositionTag）。

---

### Requirement 7：报告版式组件

> 落地 [`ui-visual-spec.md` §6.3](../../steering/ui-visual-spec.md)（老板版 H5 + 详细版 PDF）。

#### Acceptance Criteria

1. THE `packages/ui/src/report/` SHALL 提供：
   - `ReportCardH5`：老板版 H5（≤ 3 屏 + 顶部 traffic-light 结论 + 5 关键发现 + 3 CTA + 免责声明）
   - `ReportFullPdf`：详细版 PDF 模板（A4 + 封面 + 目录 + 章节 + 附录 + 末页免责声明）
   - `BrandHeader`：联合品牌 banner（同乾方略 + 客户公司 logo）
   - `DisclaimerFooter`：免责声明（强制最小字号 12px + neutral-400）
2. 所有 AI 报告页面 SHALL 用以上组件，**SHALL NOT** 自行实现报告版式（防 BR-322 4 强制要素遗漏）。

---

### Requirement 8：图标 + 字体加载

#### Acceptance Criteria

1. THE `packages/ui/src/icons/` SHALL 仅 re-export `lucide-react`（业务代码统一从此处 import）。
2. THE 17 大功能区图标 SHALL 在 `packages/ui/src/icons/function-zones.ts` 集中映射（A-Q 17 个 lucide 图标）。
3. THE 字体加载 SHALL 通过 `packages/ui/src/fonts/` + `next/font` 在每个 Next.js app 中自动注入（PingFang SC / Microsoft YaHei / Inter / JetBrains Mono）。

---

### Requirement 9：动效与状态过渡

按 [`ui-visual-spec.md` §8](../../steering/ui-visual-spec.md)：

#### Acceptance Criteria

1. THE 所有 button 的 hover SHALL `transition-colors duration-150`。
2. THE 所有 card 的 hover SHALL `transition-shadow duration-200 + hover:shadow-md`。
3. THE Dialog / Sheet / Drawer 进出 SHALL `duration-200 ease-out`。
4. THE KPI 数字变化 SHALL 用 react-countup 800ms 动画（封装为 `<AnimatedNumber>`）。
5. THE 上瘾机制专用动效 SHALL 单独提供（签到金币掉落 / 等级升级撒花 / 抽点转盘减速），由 [`26-addiction-system`] 调用。

---

### Requirement 10：Storybook（仅 P2）

#### Acceptance Criteria

1. THE `packages/ui` SHALL 提供 Storybook 7+ 配置，每个 primitive / domain 组件至少 1 个 story。
2. ❗ Storybook 部署仅在 staging 环境内部访问，SHALL NOT 暴露生产域名。
3. P2 优先级，可在 [`24-admin-console`] 完成后并行做。

---

### Requirement 11：与 4 大子前端的契约

#### Acceptance Criteria

1. 4 个子前端 SHALL 仅从 `@tongqian/ui` 导入组件，SHALL NOT 各自实现重复组件。
2. 4 个子前端的 `tailwind.config.ts` SHALL 引用 `@tongqian/ui/tailwind-preset`，仅覆盖 accent / 字号倍率。
3. 4 个子前端 SHALL NOT 引入 antd / element / mui / chakra 等其他 UI 库（CI 检查依赖）。

---

### Requirement 12：边界（不做的）

1. SHALL NOT 实现完整的设计稿同步（Figma → code）流程，一期人工同步。
2. SHALL NOT 实现暗色模式（仅预留 CSS 变量接口）。
3. SHALL NOT 实现 i18n 文案管理（在 `apps/{name}/src/i18n/`）。
4. SHALL NOT 在本 spec 实现具体业务页面（只做组件库）。

---

### Requirement 13：依赖

- 前置：[`01-infra-monorepo`] / [`02-shared-contracts`] F2
- 后续阻塞：所有 4 大子前端 + 桌面端 + 报告中心
