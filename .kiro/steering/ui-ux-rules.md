---
inclusion: always
---

# UI / UX 设计规则（UI Rules）

> 任何前端代码必须 100% 遵守。Codex / Claude Code 写前端时按本文件 + Design System spec 同时遵守。
> **核心原则**：所有页面用同一套设计语言，看上去像一个产品，不是几个产品拼起来的。

## 1. 设计语言

### 1.1 整体风格
- **专业、克制、信息密度高**（建筑业老板看到不会觉得"花哨"）
- **配色低饱和**（深蓝 + 暖灰为主，不用电商风的鲜艳色）
- **圆角中等**（rounded-md / rounded-lg 为主，不用太圆 / 太方）
- **阴影轻**（shadow-sm / shadow，不用浮夸 shadow-2xl）
- **间距宽松**（让老板看着不累）

### 1.2 视觉层级
```
重要 > 较重要 > 普通 > 次要 > 装饰
H1     H2      H3     文本   图标
深色   中色    浅色   灰色   极浅色
```

## 2. 配色规范

### 2.1 主色（统一使用 Tailwind 设计变量）

```ts
// tailwind.config.ts 中定义
colors: {
  primary: {
    50: '#f0f6fe',
    100: '#dde9fc',
    500: '#1e5fbf',  // 主色（同乾深蓝）
    600: '#1a4ea3',
    700: '#163e87',
    900: '#0d2950',
  },
  accent: {
    500: '#d4953a',  // 辅助色（同乾金）
  },
  success: { 500: '#10b981' },   // 绿
  warning: { 500: '#f59e0b' },   // 橙
  danger:  { 500: '#dc2626' },   // 红
  info:    { 500: '#0284c7' },   // 蓝
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    500: '#71717a',
    700: '#3f3f46',
    900: '#18181b',
  }
}
```

### 2.2 风险等级色（强约束）
- 红色风险（高）：`bg-danger-50 text-danger-700 border-danger-200`
- 黄色风险（中）：`bg-warning-50 text-warning-700 border-warning-200`
- 绿色风险（低 / 安全）：`bg-success-50 text-success-700 border-success-200`

**禁止自由发挥用其他颜色表达风险**。

### 2.3 状态色
- success（成功 / 已完成）：绿
- warning（警告 / 待处理）：橙
- danger（错误 / 失败）：红
- info（信息 / 提示）：蓝
- neutral（默认）：灰

## 3. 字体规范

### 3.1 字号
| 用途 | Tailwind | size | weight |
|---|---|---|---|
| H1 页面标题 | text-2xl | 24px | font-bold |
| H2 段落标题 | text-xl | 20px | font-semibold |
| H3 卡片标题 | text-lg | 18px | font-semibold |
| H4 小标题 | text-base | 16px | font-medium |
| body 正文 | text-sm | 14px | font-normal |
| caption 辅助 | text-xs | 12px | font-normal |
| 数据 / 数字 | text-2xl tabular-nums | 24px | font-bold |

### 3.2 字体
- 中文：系统默认（PingFang SC / Microsoft YaHei）
- 英文 / 数字：`Inter`（用 next/font 加载）
- 代码 / 表格数字：`JetBrains Mono` + `tabular-nums`

### 3.3 行高
- 正文：`leading-relaxed`（1.625）
- 标题：`leading-tight`（1.25）

## 4. 间距规范

统一使用 Tailwind 的 spacing scale（4 的倍数）：
- 卡片内边距：`p-4` / `p-6`
- 卡片间距：`gap-4`
- 段落间距：`space-y-4`
- 表单 label 与输入间距：`space-y-2`
- 页面外边距：`px-6 py-8`

**禁止用 `p-3`、`p-5`、`p-7` 这类奇数间距**（除非有充分理由）。

## 5. 组件约束（基于 shadcn/ui）

### 5.1 强制使用 shadcn/ui

只允许用以下组件，禁止引入其他 UI 库：

```
shadcn/ui 已安装组件白名单：
- Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- Card, Tabs, Accordion, Collapsible
- Dialog, AlertDialog, Sheet, Drawer, Popover, Tooltip
- Dropdown, ContextMenu, Menubar, NavigationMenu
- Form (react-hook-form 集成)
- Table, DataTable
- Toast, Alert
- Badge, Avatar
- Progress, Skeleton, Spinner
- Calendar, DatePicker
- Command (搜索)
- Pagination, Breadcrumb
```

如需新组件：
1. 先去 shadcn/ui 看有没有
2. 没有用 Radix UI 原语自建（同 shadcn 风格）
3. 禁用 antd / element / mui / chakra 等其他库

### 5.2 自建组件目录

```
packages/ui/src/
├── primitives/      # 基础（包装 shadcn 组件）
├── layout/          # 布局组件（PageHeader、PageContent、SectionCard）
├── data-display/    # 数据展示（StatCard、TrendCard、RiskBadge）
├── forms/           # 表单组件
├── feedback/        # 反馈（EmptyState、ErrorState、LoadingState）
└── domain/          # 业务组件（OpportunityCard、ContractRiskList...）
```

## 6. 必备页面元素

### 6.1 每个页面必有

```tsx
<PageLayout>
  <PageHeader
    title="页面标题"
    description="页面副标题（可选）"
    breadcrumbs={[...]}
    actions={<Button>主操作</Button>}
  />
  <PageContent>
    {/* 内容 */}
  </PageContent>
</PageLayout>
```

### 6.2 列表页骨架

```tsx
<PageLayout>
  <PageHeader title="..." actions={<NewButton />} />
  <PageContent>
    <FilterBar>...</FilterBar>
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyState={<EmptyState />}
    />
    <Pagination />
  </PageContent>
</PageLayout>
```

### 6.3 详情页骨架

```tsx
<PageLayout>
  <PageHeader title="..." breadcrumbs={[...]} actions={...} />
  <PageContent>
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="detail">详情</TabsTrigger>
        <TabsTrigger value="logs">日志</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">...</TabsContent>
    </Tabs>
  </PageContent>
</PageLayout>
```

### 6.4 表单页骨架

用 react-hook-form + zod：

```tsx
const schema = z.object({...});
const form = useForm({ resolver: zodResolver(schema) });

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField ... />
      <FormField ... />
      <Button type="submit">提交</Button>
    </form>
  </Form>
);
```

## 7. 状态体现（必做）

### 7.1 加载状态
- 列表 / 卡片：用 `Skeleton`
- 按钮：`<Button disabled><Spinner />提交中...</Button>`
- 全屏：`<LoadingState />`

### 7.2 空状态
**禁止显示空白页面**。每个列表 / 模块为空时必须有 EmptyState：

```tsx
<EmptyState
  icon={<FileText />}
  title="还没有合同"
  description="上传一份合同，AI 帮你审一下风险"
  action={<Button>上传合同</Button>}
/>
```

### 7.3 错误状态
```tsx
<ErrorState
  title="加载失败"
  description="网络错误，请重试"
  action={<Button onClick={refetch}>重试</Button>}
/>
```

### 7.4 成功反馈
- 短反馈：`toast.success('保存成功')`
- 重要操作：弹 `Dialog` 显示结果

## 8. 表格规范

### 8.1 必备字段
- 序号 / ID
- 主标题
- 状态（用 `Badge` 表示）
- 时间（用 `formatDistanceToNow` 显示"3 小时前"或绝对时间）
- 操作（最多 3 个，多了用 DropdownMenu）

### 8.2 表格交互
- 必须支持：排序、分页、搜索、批量操作
- 大数据量必须用游标分页
- 长文本必须 truncate + tooltip 显示完整内容
- 数字必须 tabular-nums + 千分位

## 9. 表单规范

### 9.1 验证
- 必须用 zod 定义 schema
- 校验失败立即在字段下方显示错误（红色 + 图标）
- 提交时禁用按钮 + 显示 spinner
- 错误信息中文 + 给出修改方向

### 9.2 字段类型对照
| 字段 | 组件 |
|---|---|
| 单行文本 | `<Input />` |
| 多行文本 | `<Textarea />` |
| 数字 / 金额 | `<Input type="number" />` + 千分位格式化 |
| 选择 | `<Select />` |
| 多选 | `<Checkbox />` 组 / `<MultiSelect />` |
| 日期 | `<DatePicker />` |
| 日期范围 | `<DateRangePicker />` |
| 文件上传 | `<FileUpload />`（拖拽 + 进度 + 预览） |
| 富文本 | `<RichTextEditor />`（轻量，不用 TinyMCE） |
| 长选择列表 | `<Combobox />` |

## 10. 移动端响应式（一期重点 PC，但移动端不能挂掉）

### 10.1 断点

```
sm: 640px   (手机横屏)
md: 768px   (平板)
lg: 1024px  (笔记本)
xl: 1280px  (桌面)
2xl: 1536px (大屏)
```

### 10.2 响应式策略
- 默认 mobile first（写小屏样式 → 再加大屏覆盖）
- 桌面用 `lg:` 前缀
- 表格在 `md:` 以下转卡片视图
- 侧边栏在 `lg:` 以下变 Drawer

### 10.3 必测尺寸
- 1440x900（笔记本，主要用户）
- 1920x1080（桌面）
- 768x1024（平板）
- 375x667（iPhone SE 备测）

## 11. 中文文案规范

### 11.1 语气
- **专业、简洁、温暖**（不像机器人，也不撒娇）
- 第二人称用"您"（敬语）
- 禁用网络流行语 / 表情包文字

### 11.2 数字格式
- 金额：`¥1,234.56`（带千分位）
- 大额：`¥12.34 万` / `¥1.23 亿`（自动转换）
- 百分比：`12.3%`（保留 1 位小数）
- 日期：`2026-05-15` / `5 月 15 日` / `3 小时前`
- 时间段：`6 个月` / `90 天`

### 11.3 状态文案
| 英文 | 中文 |
|---|---|
| pending | 待处理 |
| processing | 进行中 |
| completed | 已完成 |
| failed | 失败 |
| canceled | 已取消 |
| active | 启用 |
| frozen | 冻结 |
| expired | 已过期 |

### 11.4 按钮文案
- 主按钮用动词："保存""提交""开始审查""立即升级"
- 次按钮用动词："取消""稍后再说""返回"
- 危险按钮用动词 + 后果："确认删除""强制下线"
- **禁止用 "OK / Cancel"**

## 12. 信息架构

### 12.1 导航层级
```
顶级导航（≤ 7 项）
  ├── 二级导航（≤ 10 项）
  │     ├── 三级（页面）
```

超过三级必须重构。

### 12.2 面包屑
- 首页 / 模块 / 页面 / 当前页
- 每页必有

### 12.3 全局搜索
- 顶部 `Cmd+K` / `Ctrl+K` 唤起
- 搜索：项目 / 客户 / 报告 / 合同 / 资质 / 政策

## 13. 加载性能

### 13.1 首屏 ≤ 2s
- 图片必须 next/image + lazyload
- 组件按路由 code-split
- 关键 CSS inline，非关键 defer

### 13.2 交互响应 ≤ 100ms
- 按钮点击立即视觉反馈
- 表单 onChange debounce 200ms

### 13.3 列表渲染优化
- ≥ 100 条用虚拟列表（react-virtuoso）
- ≥ 1000 行表格用 TanStack Table 分页 + 虚拟滚动

## 14. 无障碍（基础要求）

- 所有图片有 alt
- 所有按钮 / 链接有可读文字
- 色彩对比度 ≥ 4.5:1
- 表单字段有 label
- 焦点状态明显
- 支持键盘导航（Tab / Enter / Esc）
- ARIA 属性正确（用 shadcn 默认即可）

## 15. 暗色模式

- 一期默认浅色，预留暗色模式（用 CSS variable）
- 不强制 Codex 实现暗色，但配色变量必须用 CSS variable 而不是固定值

## 16. 图标

- 全部用 `lucide-react`
- 禁止用 emoji 表达功能（emoji 仅用于装饰 / 庆祝场景）
- 图标尺寸：`w-4 h-4`（小）/ `w-5 h-5`（中）/ `w-6 h-6`（大）

## 17. 空状态图标对照

| 模块 | 图标 |
|---|---|
| 合同 | `FileText` |
| 招标 | `Megaphone` |
| 资质 | `Award` |
| 项目 | `Building2` |
| 财务 | `Wallet` |
| 客户 | `Users` |
| 报告 | `FileSearch` |
| 智能管家 | `UserCheck` |
| 通知 | `Bell` |
| 设置 | `Settings` |

## 18. AI 报告样式（重要）

AI 报告页面必须严格按"老板版 + 详细版"分层：

### 老板版（H5 卡片）
- 单页可滚动 H5
- 顶部一句话结论 + 风险等级 Badge
- 中部 3–5 条关键发现（红黄绿色块）
- 底部 3 条推荐动作（CTA 按钮）
- 整页 ≤ 3 屏，3 分钟读完

### 详细版（PDF）
- A4 标准排版
- 封面（同乾方略 + 客户公司联合品牌）
- 目录
- 章节正文
- 风险条款详细列表
- 附录（参考依据 / 政策原文）
- 末页免责声明

详细布局见 `.kiro/specs/report-center/design.md`。

## 19. 通知 / 推送样式

### 19.1 站内消息
- Toast：操作即时反馈（成功 / 失败 / 警告）
- Notification 中心：长期消息（机会 / 风险 / 系统）
- 未读用红点 / 数字 badge

### 19.2 公众号 / 短信文案
- 标题 ≤ 15 字
- 摘要 ≤ 50 字
- 正文 ≤ 600 字
- 必有"查看详情"链接

## 20. 全局禁用清单

❌ 自由发挥的颜色（必须从设计变量取）
❌ 自由发挥的间距（必须用 Tailwind scale）
❌ 自由发挥的字号（必须用规范字号）
❌ 自由发挥的圆角（必须用 rounded-md / rounded-lg）
❌ 自由发挥的阴影（必须用 shadow-sm / shadow / shadow-md）
❌ 引入非 shadcn 的 UI 库
❌ 滥用 emoji
❌ 隐藏滚动条（除非有充分理由）
❌ 阻塞性动画（影响交互）
❌ 写死的中文文案（必须用 i18n / 常量）
❌ 没有 EmptyState 的列表
❌ 没有 LoadingState 的异步页
❌ 没有 ErrorState 的请求失败
❌ 表单不校验直接提交
❌ 表格不分页一次性加载所有数据
