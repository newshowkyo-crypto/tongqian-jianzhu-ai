# 03 设计系统 - Tasks

## 任务总数：14

## Phase A：Tokens + Tailwind preset（3 个）

- [x] **A1** 实现 `packages/ui/src/tokens/` 5 文件（colors / typography / spacing / radius / shadows）+ `styles/tokens.css`
  - 验收：值与 [`ui-visual-spec.md` §2/§3/§4](../../steering/ui-visual-spec.md) 完全一致

- [x] **A2** 实现 `packages/ui/tailwind-preset.ts` + 4 个子前端的 `tailwind.config.ts` 完成 token 引用 + 差异化覆盖
  - 验收：4 个 app 都能跑 `pnpm dev` + 视觉一致

- [x] **A3** 实现 `packages/ui/src/fonts/` + `src/styles/globals.css`（重置 + 字体）
  - 验收：4 个 app 的 layout.tsx 引用后字体生效

## Phase B：Primitives（3 个）

- [x] **B1** 包装 shadcn/ui 表单类组件：Button / Input / Textarea / Select / Checkbox / Radio / Switch / Slider / DatePicker / DateRangePicker / FileUpload / Combobox
  - 验收：每个组件 RTL 测试通过

- [x] **B2** 包装 shadcn/ui 布局 + 反馈类：Card / Tabs / Accordion / Collapsible / Separator / Dialog / AlertDialog / Sheet / Drawer / Popover / Tooltip / Toast / Alert
  - 验收：同上

- [x] **B3** 包装 shadcn/ui 数据类：Table / DataTable（TanStack Table）/ Pagination / Badge / Avatar / Progress / Skeleton / Spinner / Breadcrumb
  - 验收：DataTable 支持排序 / 分页 / 搜索 / 批量

## Phase C：Layout + Forms（2 个）

- [x] **C1** 实现 layout 组件：PageLayout / PageHeader / PageContent / SectionCard / FilterBar / EmptyState / LoadingState / ErrorState
  - 验收：在 `apps/web` 创建 demo 页验证

- [x] **C2** 实现 forms 组件：FormShell / FormField / FormSection（基于 react-hook-form + zod）
  - 验收：demo 表单完整提交 + 错误处理

## Phase D：Data Display（1 个）

- [x] **D1** 实现 9 个数据展示组件：StatCard / TrendCard / RiskBadge / LevelBadge / TierBadge / ConfidenceIndicator / **CreditDisplay**（强制 BR-405）/ MoneyDisplay / RelativeTime
  - 验收：CreditDisplay 强制 1 元 = 100 点格式 + ESLint 规则禁止业务代码直接用 `点`/`元`

## Phase E：Domain + Report（2 个）

- [x] **E1** 实现 7 个 domain 组件：OpportunityCard / RiskFinding / QualificationCard / DispatchCard / AgentRow / ReportHeader / ServicePremiumCard
  - 验收：每个组件的 props 类型来自 `@tongqian/types`

- [x] **E2** 实现报告版式组件：ReportCardH5 / ReportFullPdf（@react-pdf/renderer）/ BrandHeader / DisclaimerFooter
  - 验收：ReportHeader 强制接收 RequiredElements props（缺一编译期 fail）

- [x] **E3** 实现 5 个 dashboard 骨架（OwnerDashboard / TenderWriterDashboard / PMDashboard / FinanceDashboard / DocStaffDashboard）
  - 验收：apps/web 按 PositionTag 路由到对应 dashboard；数据通过 props 传入

## Phase F：Icons + 动效（1 个）

- [x] **F1** 实现 `icons/index.ts`（re-export lucide）+ `icons/function-zones.ts`（17 大功能区映射）+ `AnimatedNumber`（react-countup 包装）+ 动效配置
  - 验收：所有组件用 lucide 图标；KPI 数字带 800ms 动画

## Phase G：测试 + Storybook（2 个）

- [x] **G1** 配置 Vitest + RTL + axe-core；为 primitives + data-display 写测试
  - 验收：覆盖率 ≥ 60%（前端基线）

- [x] **G2** Storybook 配置 + 为每个 primitive / domain 写 1 个 story（P2，可后置）
  - 验收：staging 内部访问可用

## 完成标准

- ✅ 4 个子前端 + 桌面端能从 `@tongqian/ui` import 全部组件
- ✅ 4 个子前端**只在 tailwind.config 覆盖 accent / 字号倍率**，其他 token 一致
- ✅ ESLint 规则禁止 inline style + 禁止业务代码直接用 `点`/`元` 字符
- ✅ ReportHeader 缺 RequiredElements props 编译期 fail
