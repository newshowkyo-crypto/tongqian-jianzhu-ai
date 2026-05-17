---
inclusion: always
---

# UI 视觉规范（UI Visual Spec）

> 本文档为 Codex / Claude Code 的图像生成模型（如 GPT-Image-2、Flux、SD3）提供完整视觉指导，让 AI 在生成 UI 截图、Mockup、组件设计时能产出**专业、统一、精美**的界面。
>
> 本文档与 [`ui-ux-rules.md`](./ui-ux-rules.md) 配套：那份规定"用什么组件、写什么样的代码"，本份规定"长什么样、视觉感受是什么"。
>
> **核心目标**：所有页面看上去像**德勤 / 用友 / 飞书** 这一档的企业级 SaaS 产品，不是淘宝、不是花花绿绿的工具站。

---

## 1. 整体视觉气质（Mood Board）

### 1.1 关键词（每次生成 UI 时给图像模型的 prompt 必须包含这些）

```
专业、克制、信息密度高、值得信任、有质感、轻量化、留白充足、
现代企业级 SaaS、不浮夸、不花哨、不电商风、不游戏化、不卡通

英文 prompt 关键词：
"professional, restrained, information-dense, trustworthy,
sophisticated, minimal, generous whitespace, modern enterprise SaaS,
not flashy, not consumer-style, refined, polished"
```

### 1.2 视觉参考品牌（Codex 生成时参考的目标气质）

| 参考品牌 | 借鉴的方面 |
|---|---|
| **飞书 Lark** | 整体克制 + 信息密度 + 表格设计 |
| **Linear** | 暗色主导 + 高级感 + 圆角 + 细节阴影 |
| **Stripe Dashboard** | 数据可视化 + 清晰的层级 + 商业气质 |
| **Notion** | 文档型布局 + 留白 + 字体层级 |
| **Vercel Dashboard** | 现代感 + 玻璃拟态（轻度）+ 高对比 |
| **同乾方略品牌** | 沉稳深蓝 + 暖金辅色 + 中文专业气质 |

❌ **避免参考**：淘宝 / 拼多多 / 抖音 / 小红书 / Steam（这些是消费向，气质完全错位）

### 1.3 一句话视觉总纲

> "**让中型建筑公司的 50 岁老板看了觉得专业可信，让 30 岁的标书员看了觉得现代好用，让智能管家看了觉得有面子。**"

---

## 2. 配色系统（精确到 HEX）

### 2.1 主色板

```
品牌色（Brand）
  primary-50:  #f0f6fe    极浅蓝（背景层）
  primary-100: #dde9fc    浅蓝（hover 背景）
  primary-200: #bbd2f8    
  primary-300: #92b3f1    
  primary-400: #5e8be6    
  primary-500: #1e5fbf    主色 ★ 同乾深蓝（按钮/链接/重点）
  primary-600: #1a4ea3    深一档（按钮 hover）
  primary-700: #163e87    
  primary-800: #143570    
  primary-900: #0d2950    最深（标题/重要文字）

辅助色（Accent，限用于标志性重点：徽章、勋章、CTA 强调）
  accent-50:  #fdf6e7
  accent-500: #d4953a    同乾金（暖金，建筑业气质）
  accent-700: #a06d24

中性色（Neutral，灰阶系统，使用频率最高）
  neutral-50:  #fafafa    页面背景
  neutral-100: #f4f4f5    卡片次背景
  neutral-200: #e4e4e7    分割线
  neutral-300: #d4d4d8    边框
  neutral-400: #a1a1aa    占位符
  neutral-500: #71717a    辅助文字
  neutral-600: #52525b    
  neutral-700: #3f3f46    正文
  neutral-800: #27272a    
  neutral-900: #18181b    标题
```

### 2.2 语义色（强约束，禁止用其他颜色表达这些含义）

```
成功 / 已完成 / 安全 / 绿色风险（低风险）
  success-50:  #ecfdf5
  success-100: #d1fae5
  success-500: #10b981    ★
  success-700: #047857

警告 / 黄色风险（中风险）/ 待处理
  warning-50:  #fffbeb
  warning-100: #fef3c7
  warning-500: #f59e0b    ★
  warning-700: #b45309

危险 / 红色风险（高风险）/ 错误 / 失败
  danger-50:  #fef2f2
  danger-100: #fee2e2
  danger-500: #dc2626     ★
  danger-700: #b91c1c

信息 / 提示
  info-50:  #eff6ff
  info-500: #0284c7       ★
  info-700: #075985
```

### 2.3 风险等级专用配色（必须严格使用）

```
合同 / 招标 / 资质 等所有风险展示统一：

🟢 绿色风险（GREEN_LOW）
   背景: success-50 (#ecfdf5)
   边框: success-200 (#a7f3d0)
   图标背景: success-100 (#d1fae5)
   图标颜色: success-700 (#047857)
   文字主色: success-700
   徽章: bg-success-100 text-success-700 border-success-200

🟡 黄色风险（YELLOW_MID）
   背景: warning-50 (#fffbeb)
   边框: warning-200 (#fde68a)
   图标颜色: warning-700 (#b45309)
   文字主色: warning-700
   徽章: bg-warning-100 text-warning-700 border-warning-200

🔴 红色风险（RED_HIGH）
   背景: danger-50 (#fef2f2)
   边框: danger-200 (#fecaca)
   图标颜色: danger-700 (#b91c1c)
   文字主色: danger-700
   徽章: bg-danger-100 text-danger-700 border-danger-200
```

### 2.4 智能管家信誉等级专用配色（吸睛但不浮夸）

```
LV1 见习管家     灰色  neutral-500 + 普通边框
LV2 入职管家     蓝色  primary-500 + 浅蓝徽章
LV3 资深管家     青色  #0891b2 + 渐变细微
LV4 金牌管家     金色  accent-500 (#d4953a) + 暖金渐变
LV5 首席管家     紫色  #7c3aed → #c084fc 双色渐变 + 微光效果（仅用于此处）

每个等级的徽章必须显示：
  [图标] LV{n} {等级名}
  示例：[💎] LV5 首席管家
```

### 2.5 Tier 标识专用配色（AI 报告右上角）

```
Tier 1 直接使用            success-500 圆角徽章
Tier 2 建议人工复核         warning-500 圆角徽章
Tier 3 申请同乾方略咨询     primary-500 圆角徽章 + 推荐光晕
Tier 4 强制人工接管         danger-500 圆角徽章
```

---

## 3. 字体系统

### 3.1 字体家族

```css
font-family-sans:
  -apple-system, BlinkMacSystemFont,
  "PingFang SC",      /* 苹方（Mac 优先） */
  "Microsoft YaHei",  /* 微软雅黑（Win 优先） */
  "Hiragino Sans GB",
  "Inter",            /* 英文 / 数字 */
  Arial, sans-serif;

font-family-mono:
  "JetBrains Mono",
  "Source Code Pro",
  Menlo, Consolas, monospace;

数字 / 金额 / 报表强制：font-variant-numeric: tabular-nums;
```

### 3.2 字号等级（精确像素 + 字重 + 行高）

| 用途 | Tailwind | size | weight | line-height | 实际效果 |
|---|---|---|---|---|---|
| H1 页面主标题 | text-2xl | 24px | 700 bold | 32px | 仪表盘标题 / 报告标题 |
| H2 段落标题 | text-xl | 20px | 600 semibold | 28px | 卡片标题 / 章节标题 |
| H3 卡片标题 | text-lg | 18px | 600 semibold | 26px | 子卡片 / 列表分组 |
| H4 小标题 | text-base | 16px | 500 medium | 24px | 表单字段名 / 标签 |
| body 正文 | text-sm | 14px | 400 normal | 22px | 默认文字 |
| caption 辅助 | text-xs | 12px | 400 normal | 18px | 副标题 / 时间戳 |
| 数据 / KPI 数字 | text-3xl | 30px | 700 bold + tabular-nums | 36px | 仪表盘大数字 |
| 数据 / 表格数字 | text-sm | 14px | 500 medium + tabular-nums | 20px | 表格金额 / 计数 |

### 3.3 文字颜色规则

```
最高级标题：neutral-900
H1/H2 标题：neutral-800 ~ neutral-900
H3/H4 副标题：neutral-700
正文：neutral-700
辅助文字：neutral-500
占位符：neutral-400
禁用文字：neutral-300

链接色：primary-600
链接 hover：primary-700
链接 visited：primary-800
```

---

## 4. 间距与布局系统

### 4.1 间距 scale（Tailwind 4px 倍数，强制使用）

```
xs    1   4px
sm    2   8px
base  3  12px
md    4  16px ★ 最常用
lg    6  24px ★ 最常用
xl    8  32px
2xl  12  48px
3xl  16  64px
4xl  24  96px
```

**强制约束**：
- 卡片内边距：`p-6`（桌面）/ `p-4`（移动）
- 卡片之间间距：`gap-6`（桌面）/ `gap-4`（移动）
- 段落之间：`space-y-4` 或 `space-y-6`
- 表单字段间距：`space-y-2`（label-input）/ `space-y-4`（field-field）
- 页面外边距：`px-8 py-10`（桌面）/ `px-4 py-6`（移动）
- ❌ 禁止 `p-3 p-5 p-7`（奇数间距，破坏节奏）

### 4.2 圆角系统

```
rounded-sm    2px    极小圆角（很少用）
rounded       4px    小圆角（输入框/小标签）
rounded-md    6px    中等（按钮 / 输入框）★ 最常用
rounded-lg    8px    较大（卡片）★ 最常用
rounded-xl   12px    大圆角（弹窗 / 重要卡片）
rounded-2xl  16px    最大圆角（仅特殊场景）
rounded-full          完全圆形（头像 / 圆点）
```

**强制约束**：
- 按钮：`rounded-md`
- 输入框：`rounded-md`
- 卡片：`rounded-lg`
- 弹窗 / Modal：`rounded-xl`
- ❌ 禁止 `rounded-3xl` 及以上（过分圆润）
- ❌ 禁止完全直角 `rounded-none`（过于硬朗）

### 4.3 阴影系统

```
shadow-sm
  0 1px 2px 0 rgb(0 0 0 / 0.05)
  → 卡片默认阴影 ★

shadow
  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
  → hover 状态阴影 ★

shadow-md
  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
  → 弹窗 / Dropdown ★

shadow-lg / xl
  → 大弹窗 / 焦点元素

❌ 禁止：shadow-2xl（浮夸）/ 彩色阴影 / 内阴影 inset
```

### 4.4 网格 / Layout

```
桌面端（≥ 1280px）：
  侧边导航：w-64 (256px)
  主内容：max-w-7xl mx-auto
  内容栏：可分 1 / 2 / 3 列网格 (grid-cols-1 / 2 / 3 + gap-6)
  数据看板：grid-cols-4 (4 个 KPI 卡)
  详情页：左侧 2/3 主内容 + 右侧 1/3 侧栏

平板端（768–1279px）：
  侧边导航折叠为图标 + 顶部 Drawer 触发
  网格降级为 2 列

手机端（< 768px）：
  侧边导航完全隐藏，改顶部抽屉式
  网格降级为 1 列
  表格自动转为卡片视图
```

---

## 5. 核心组件视觉规范

### 5.1 按钮（Button）

```
主按钮（Primary）
  bg-primary-500 hover:bg-primary-600 text-white
  px-4 py-2 rounded-md text-sm font-medium
  shadow-sm hover:shadow

次按钮（Secondary）
  bg-white border border-neutral-300 hover:bg-neutral-50
  text-neutral-700 px-4 py-2 rounded-md text-sm font-medium

危险按钮（Danger）
  bg-danger-500 hover:bg-danger-600 text-white
  仅用于：删除 / 强制下线 / 清退智能管家

幽灵按钮（Ghost）
  bg-transparent hover:bg-neutral-100
  text-neutral-700 px-3 py-1.5 rounded text-sm

链接按钮（Link）
  text-primary-600 hover:text-primary-700 underline-offset-2

禁用状态
  opacity-50 cursor-not-allowed pointer-events-none

按钮高度：
  - sm: h-8 (32px)
  - md: h-10 (40px) ★
  - lg: h-12 (48px)
```

### 5.2 卡片（Card）

```
基础卡片
  bg-white rounded-lg shadow-sm
  border border-neutral-200
  p-6

可悬停卡片（hover 态）
  + hover:shadow-md transition-shadow duration-200

带状态条卡片（顶部彩色条）
  + 顶部一条 4px 高的状态色 bar
  - 红色 bar：高风险卡片
  - 黄色 bar：警告卡片
  - 绿色 bar：成功卡片
  - 蓝色 bar：信息卡片

KPI 数据卡（首页 4 件套用）
  ┌────────────────────┐
  │ [图标]  指标名     │   text-sm text-neutral-500
  │                    │
  │ 1,234              │   text-3xl font-bold tabular-nums
  │  ↑ 12.3% vs 上月   │   text-xs text-success-600
  └────────────────────┘
```

### 5.3 表格（Table）

```
表头
  bg-neutral-50 border-b border-neutral-200
  text-xs font-medium text-neutral-500 uppercase tracking-wider
  px-4 py-3

表体行
  border-b border-neutral-100
  hover:bg-neutral-50
  text-sm text-neutral-700
  px-4 py-3

斑马纹（可选，行 ≥ 5 行时启用）
  even:bg-neutral-50/50

数字列
  text-right tabular-nums

操作列
  text-right
  最多 3 个图标按钮，超过用 ··· DropdownMenu

行选中（批量操作）
  bg-primary-50 + 左侧 2px 蓝色指示条

空状态
  全表中心：[图标] + "还没有数据" + "操作建议" + 主按钮
```

### 5.4 表单（Form）

```
Label
  text-sm font-medium text-neutral-700 mb-1.5
  必填：在 label 后加 <span class="text-danger-500">*</span>

Input
  h-10 px-3 py-2 rounded-md border border-neutral-300
  text-sm placeholder:text-neutral-400
  focus:border-primary-500 focus:ring-2 focus:ring-primary-100
  disabled:bg-neutral-50 disabled:text-neutral-400

错误态
  border-danger-500 focus:ring-danger-100
  错误信息：text-xs text-danger-600 mt-1.5

成功态（提交后）
  border-success-500 + ✓ 图标

禁用态
  bg-neutral-50 text-neutral-400 cursor-not-allowed

Textarea：min-h-24
```

### 5.5 徽章 / 标签（Badge）

```
状态徽章（圆角矩形）
  px-2.5 py-0.5 rounded-full text-xs font-medium
  
  待处理：bg-warning-100 text-warning-700
  进行中：bg-primary-100 text-primary-700
  已完成：bg-success-100 text-success-700
  已失败：bg-danger-100 text-danger-700
  已取消：bg-neutral-100 text-neutral-600

智能管家等级徽章（带图标）
  LV1 [⚪] 新手    bg-neutral-100 text-neutral-600
  LV2 [🔵] 见习    bg-primary-100 text-primary-700
  LV3 [🟦] 熟练    bg-cyan-100 text-cyan-700
  LV4 [🥇] 金牌    bg-accent-50 text-accent-700 + 金色边框
  LV5 [💎] 钻石    bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 + 微微光晕

风险徽章
  🟢 低 | 🟡 中 | 🔴 高
  统一格式：[圆点 + 文字]
```

### 5.6 头像 / 图标

```
头像
  圆形 rounded-full
  尺寸：sm=32px / md=40px / lg=48px / xl=64px
  默认：用户名首字母 + 随机配色（从中性色板取）
  企业头像：方形 rounded-md + 公司 logo 或首字

图标
  统一使用 lucide-react
  尺寸：w-4 h-4 (16px) 小 / w-5 h-5 (20px) 中 / w-6 h-6 (24px) 大
  颜色随上下文（neutral-500 / primary-500 / 风险色）
```

---

## 6. 关键页面视觉规范（重点 Codex 用）

### 6.1 老板首页（Dashboard）

> **生成 prompt 关键词**：professional construction company SaaS dashboard, executive overview, deep blue + warm gold accents, generous whitespace, 4 KPI cards on top, opportunity radar feed, risk red-light section, AI assistant floating button bottom-right

**布局**：
```
┌──────────────────────────────────────────────────────────┐
│ [侧栏 256px]    顶部导航 64px (含搜索 + 通知 + 头像)        │
│  ├─ 工作台      ├──────────────────────────────────────┐ │
│  ├─ 机会雷达    │ 早安，张总   今日是 2026年5月15日 周五 │ │
│  ├─ 招标中心    │ 「同乾方略 · 建筑 AI 经营管家」          │ │
│  ├─ 资质护航    │                                       │ │
│  ├─ 合同审查    │ ┌─────┐┌─────┐┌─────┐┌─────┐         │ │
│  ├─ 财务现金流  │ │今日 ││风险 ││待办 ││点数 │           │ │
│  ├─ 项目部      │ │机会 ││红灯 ││审批 ││余额 │ KPI 4件套 │ │
│  ├─ 报告中心    │ └─────┘└─────┘└─────┘└─────┘         │ │
│  ├─ 派单大厅    │                                       │ │
│  ├─ 智能管家管理    │ ┌──────────────────┐ ┌──────────────┐ │ │
│  └─ 设置        │ │ 今日机会推送      │ │ 风险红灯      │ │ │
│                 │ │ • 武汉地铁三期    │ │ 🔴 张三建造证 │ │ │
│                 │ │ • 西安西咸学校    │ │    28天到期   │ │ │
│                 │ │ • 央企分包-中铁   │ │ 🟡 应收 ¥3.2M │ │ │
│                 │ │   (4 条)          │ │    超90天     │ │ │
│                 │ └──────────────────┘ └──────────────┘ │ │
│                 │                                       │ │
│                 │ ┌──────────────────────────────────┐  │ │
│                 │ │ 昨日 AI 报告速览                  │  │ │
│                 │ │ 合同审查 2 / 标书框架 1 / 催款 8 │  │ │
│                 │ └──────────────────────────────────┘  │ │
│                 │                          [💬 AI 助理] │ │
│                 └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**配色重点**：
- 顶部 banner：白色背景 + 浅灰底纹
- KPI 卡：白色卡 + 数据用 `text-3xl font-bold` + 同乾深蓝
- 机会卡：左侧 4px 蓝色条 + 白底 + neutral-200 边框
- 风险红灯：danger-50 背景 + danger-200 边框 + 红色图标
- AI 助理球：右下角 fixed，56px 圆形，primary-500 → primary-700 渐变 + shadow-lg + 微动画呼吸

### 6.2 派单大厅（智能管家视角）

> **生成 prompt**：modern dispatch hall interface, agent workspace, list of incoming construction service orders with bid quotes, reputation badges (LV1-LV5), traffic light pricing indicators (green/yellow/red), accept-order CTA button, professional B2B style

**布局**：
```
顶部 Tab：[全部派单 (12)] [我的归属 (5)] [跨域池 (3)] [公开抢单 (4)]

每条派单卡：
┌─────────────────────────────────────────────────────┐
│ ⚡ 武汉某建工 资质升级（二级→一级）         [紧急]    │
│ 同省 / 资质智能管家  │  保护期 22h  │  4 维匹配 38 分    │
│                                                     │
│ 客户：[公司头像] 武汉某建筑工程 [优质客户 ⭐]        │
│ 信誉分 850 / LV4  │  历史 12 单 5★ 平均             │
│                                                     │
│ 我的报价：  [¥_______ 输入框]   [服务说明 textarea]  │
│ 参考价范围：¥30,000 – ¥50,000                       │
│                                                     │
│ [实时颜色提示]：🟢 绿色推荐  在合理区间               │
│                                                     │
│              [立即接单] [跳过] [转同乾方略]          │
└─────────────────────────────────────────────────────┘
```

**配色重点**：
- 紧急派单：左边框 `border-l-4 border-warning-500`
- 优质客户：accent-500 金色徽章 + ⭐
- 报价输入框：当前值变化时实时改边框色（green/yellow/red）
- 报价合理区间用浅绿色高亮区段
- LV4 金牌管家标识：金色渐变徽章 + 暖光阴影

### 6.3 AI 报告（老板版 H5）

> **生成 prompt**：mobile-friendly H5 report card, AI-generated contract risk assessment, top header with traffic light overall verdict (red/yellow/green), 5 key findings with colored chips, 3 CTA action buttons at bottom, disclaimer at footer, Tier badge top-right corner, professional Chinese legal/business document style

**布局（手机宽度，≤ 3 屏可滚完）**：
```
┌──────────────────────────┐
│  同乾方略 ＸＸ 公司联合品牌  │
│  ─────────────────────  │
│  AI 合同风险审查 速读版     │
│  2026-05-15 14:32         │
│                  [Tier 1] │ ← 右上角徽章
├──────────────────────────┤
│                          │
│   总体风险等级            │
│   🟡 中等风险             │ ← 大字 + 大色块
│   发现 5 处需关注          │
│                          │
├──────────────────────────┤
│  关键发现                  │
│                          │
│  🔴 #1 无限连带担保条款    │
│     合同第 7.3 条          │
│     建议改为有限担保         │
│                          │
│  🔴 #2 付款节点过分推迟    │
│     合同第 12 条           │
│                          │
│  🟡 #3 工期违约金过高       │
│     合同第 9.2 条          │
│                          │
│  🟡 #4 ...                │
│  🟢 #5 ...                │
│                          │
├──────────────────────────┤
│  AI 信心度：高 ●●●○        │
│                          │
│  下一步建议（自动）：        │
│  ┌─────────────────┐    │
│  │ 直接修改合同      │  ← 主 CTA
│  └─────────────────┘    │
│  [查看详细报告 PDF]        │
│  [申请人工复核]            │
│                          │
├──────────────────────────┤
│  本报告由 AI 生成，仅作为... │ ← 免责声明
│  灰色小字 disclaimer       │
└──────────────────────────┘
```

**配色重点**：
- 顶部联合品牌区：`bg-primary-900` 深蓝 + 同乾金色 logo + 客户公司 logo
- 总体风险大色块：full-width 80px 高，用对应风险色 (-100 背景 + -700 文字)
- Tier 徽章右上角：浮动定位 + 圆角 + Tier 对应色
- 风险条目：统一 `border-l-4` + 风险色边框 + 白底
- CTA 按钮：主按钮 primary-500 + 圆角 + 阴影
- 信心度：用 4 个圆点 ●●●○ 视觉表达
- 免责声明：text-xs text-neutral-400，底部固定

### 6.4 智能管家信誉看板（智能管家工作台）

> **生成 prompt**：reputation dashboard for service agent, large 0-1000 circular score gauge in center, level badge (LV3 / LV4), monthly score change history bar chart, list of recent +/- events, appeal button, professional gamified but restrained design

**布局**：
```
┌────────────────────────────────────────────┐
│ 我的信誉分                                  │
│                                            │
│   ┌─────────────┐    距 LV4 还差 50 分     │
│   │   ╱──╲      │    ┌──────────────┐    │
│   │  │ 800│     │    │ ▓▓▓▓▓▓▓░░░  │    │
│   │  │ /  │     │    │   80%       │    │
│   │   ╲──╱      │    └──────────────┘    │
│   │   LV3 资深管家   │                        │
│   └─────────────┘   推荐费上限：15%       │
│   大圆形进度环         提现周期：T+7         │
│                                            │
├────────────────────────────────────────────┤
│ 本月加减分明细                  [申诉入口]  │
│                                            │
│ +50  推荐客户成 ABS 大单           5/14   │
│ +10  客户 5★ 评价                  5/12   │
│ +5   完成订单（武汉资质升级）        5/10   │
│ ─────────────────────────────             │
│ -20  客户 2★ 差评（西安标书）       5/8   │
│       已申诉，等待客服初审 (24h)             │
│ +5   完成订单                       5/5   │
│                                            │
│ 自然回血 +20/月（活跃 + 无差评）             │
└────────────────────────────────────────────┘
```

**配色重点**：
- 大圆环进度：背景 neutral-200 灰色 + 进度条 primary-500 → accent-500 渐变（LV4+ 才有金色渐变）
- LV 徽章：等级专用配色（LV3 = 青色、LV4 = 金色、LV5 = 紫色渐变）
- 距下一级进度条：双色渐变 + 百分比文字
- 加分项：success-700 文字 + 浅绿背景
- 减分项：danger-700 文字 + 浅红背景
- 申诉中标签：warning 黄色徽章

### 6.5 同乾方略服务货架（B 类高端服务）

> **生成 prompt**：premium consulting service shelf, 10 high-end service cards in grid (2x5 or 3x4), each card shows service name + price range + key deliverables + 'consult now' CTA, gold accent for premium feel, white background, professional consulting firm style

**布局**：
```
┌─────────────────────────────────────────────────┐
│ 同乾方略 · 高端咨询服务货架                       │
│ 由建筑业资深咨询团队亲自交付                       │
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ [图标]   │ │ [图标]   │ │ [图标]   │         │
│ │ 化债策略 │ │ ABS/REITs│ │ 央国企融资│         │
│ │          │ │          │ │          │         │
│ │ ¥50万起  │ │ ¥100万起 │ │ ¥30-100万│         │
│ │          │ │          │ │          │         │
│ │ 交付物：  │ │ 交付物：  │ │ 交付物：  │         │
│ │ • 方案书  │ │ • 框架图  │ │ • 路径图  │         │
│ │ • 路线图  │ │ • 评估   │ │ • 材料清单│         │
│ │          │ │          │ │          │         │
│ │ [咨询预约]│ │ [咨询预约]│ │ [咨询预约]│         │
│ └──────────┘ └──────────┘ └──────────┘         │
│ ... (共 10 张)                                  │
└─────────────────────────────────────────────────┘
```

**配色重点**：
- 整体白底 + neutral-50 卡片背景 + 浅金色边框（accent-100）
- 价格用 accent-500 金色 text-2xl font-bold
- "咨询预约" 按钮：primary-500 → primary-700 + 浅金色光晕
- 卡片悬停：shadow-md + 微微上抬 -translate-y-1
- 标题区：深蓝色 banner + 同乾金色横线分隔

---

## 7. 移动端 / H5 视觉规范

### 7.1 移动端必遵守

```
最小触控目标：44 × 44px（按钮 / 链接 / 图标按钮）
字号最小：12px（caption）
正文：14px
按钮：16px
所有内容左右留白 ≥ 16px
顶部导航高度：48px
底部安全区适配 iPhone notch
```

### 7.2 公众号 H5 报告专用

```
最大宽度：375px（iPhone SE 基准）
背景：neutral-50 灰白 + 卡片白色
卡片左右间距：16px
卡片之间间距：16px
顶部固定品牌区：62px 高，深蓝 + logo + 标题
底部固定 CTA：72px 高，白底 + 主按钮全宽
中部内容自由滚动
```

---

## 8. 微动效与状态过渡

### 8.1 必做的微动效

```
所有按钮 hover：transition-colors duration-150
所有卡片 hover：transition-shadow duration-200 + hover:shadow-md
所有抽屉 / Modal 进出：duration-200 ease-out
表单错误显示：抖动 1 次 + 错误信息淡入
KPI 数字变化：CountUp 动画 800ms（用 react-countup）
进度条变化：bar 宽度 transition-all duration-500
```

### 8.2 禁止的动效

```
❌ 旋转 logo / 跳动 emoji / 鞭炮闪烁
❌ 自动播放视频 / GIF
❌ 撞屏强制弹窗
❌ 抢眼但与功能无关的装饰动画
❌ duration > 600ms 的非数据动画
```

### 8.3 上瘾机制专用动效（克制使用）

```
签到成功：金币掉落动画（≤ 600ms，可关闭）
等级升级：徽章放大 + 撒花（仅 LV3→LV4、LV4→LV5）
抽点中奖：转盘减速停止（标准物理曲线 800ms）
连续签到突破 30 / 90 天：弹出庆祝卡片 + 实物礼券
```

---

## 9. 4 大子前端的差异化

虽然 4 个子前端共用同一套设计系统，但每个子前端的"主题色调"和"信息密度"有微妙差异：

| 子前端 | 气质关键词 | 主色调微调 | 字体倾向 |
|---|---|---|---|
| `apps/web` 建筑企业 | **专业、可信、成熟** | 深蓝主导 + 同乾金辅助 | 标准 |
| `apps/gov` 政府央国企 | **庄重、保守、严肃** | 深蓝加深（primary-700）+ 红色装饰条 + 移除金色 | 字号 +1 档（老干部友好）|
| `apps/agent` 智能管家工作台 | **激励、清爽、有活力** | 主色不变 + 增加暖金 + 增加成就色（紫色 LV5）| 标准 |
| `apps/admin` 平台后台 | **极简、信息密度高** | 主色不变 + 灰阶强化 + 减少装饰 | 标准 + 表格密度增加 |

**实现方式**：每个子前端的 `tailwind.config.ts` 仅微调 `accent` 和 `--ring` CSS 变量，**核心 50 个 token 不变**。

---

## 10. AI 生成 UI 截图时的 Prompt 模板

> 这是给 Codex / GPT-Image / Flux 的标准 prompt 模板。生成任何页面 UI 时复制 + 替换 {页面名}。

### 10.1 标准模板

```
A {页面名} interface for "Tongqian Fanglue · Construction AI Manager",
a Chinese construction industry SaaS platform.

Visual style: professional enterprise SaaS like Lark, Stripe, Linear,
restrained, information-dense, generous whitespace, modern but not flashy.

Color palette:
- Primary: deep blue #1e5fbf (Tongqian brand color)
- Accent: warm gold #d4953a (used sparingly for premium highlights)
- Neutral grayscale: zinc-50 to zinc-900
- Risk colors: green #10b981 / amber #f59e0b / red #dc2626

Typography: PingFang SC / Microsoft YaHei (Chinese), Inter (numbers)
Border radius: medium (6-8px) on cards and buttons, no harsh corners
Shadows: subtle shadow-sm by default, shadow-md on hover only

Layout: {具体布局，参考本文档 §6}

Avoid:
- ecommerce-style colors or animations
- gamification overload
- consumer-app aesthetics
- emoji as functional elements (only as decoration)
- harsh borders or 3D effects

Target user: {老板 / 智能管家 / 政府 / 平台运营}, professional B2B context.
Show realistic Chinese content: {具体内容描述}
```

### 10.2 子页面专用 prompt 增量

按需追加（参考 §6 各页面）：

- **首页**：`+ executive dashboard, 4 KPI cards on top, opportunity feed, risk alerts, AI assistant floating button`
- **派单大厅**：`+ list of dispatch cards, agent reputation badges (LV1-LV5), price color indicators, accept-order CTAs`
- **AI 报告**：`+ mobile H5 layout, traffic-light verdict at top, 5 key findings with colored chips, Tier badge top-right, disclaimer at bottom`
- **信誉看板**：`+ large circular progress gauge 0-1000, level badge with crown icon, score history bar chart, recent +/- events list`
- **服务货架**：`+ 10 service cards in 3-column grid, gold price text, 'consult now' CTAs, premium feel`

---

## 11. 设计资产清单（开发期需要的视觉素材）

| 资产 | 数量 | 状态 | 用途 |
|---|---|---|---|
| 同乾方略 logo（彩色 + 白色 + 单色版）| 3 | ⏳ 你团队提供 | 全局品牌位 |
| "建筑 AI 经营管家" 子品牌 logo | 1 | ⏳ 设计 | 配合同乾方略联合署名 |
| Favicon（多尺寸 ico）| 1 套 | ⏳ 设计 | 浏览器标签 / 桌面端 |
| 等级勋章图标（LV1–LV5）| 5 | ⏳ 设计 | 智能管家信誉看板 |
| 17 大功能区图标 | 17 | lucide 选用即可 | 侧栏导航 |
| 空状态插画（5 类）| 5 | ⏳ 设计或免费图库 | 空表 / 空报告 / 空消息 / 空机会 / 空资质 |
| 报告封面模板 | 5 类 × 2 版（普通版 + 联合品牌版）| ⏳ 设计 | PDF 报告 |
| 公众号文章封面模板 | 8 类 | ⏳ 设计 | 内容运营 |
| 合伙人朋友圈卡片模板 | 10 套 | ⏳ 设计 | 智能管家网络素材 |
| 服务货架 10 类服务图标 | 10 | ⏳ 设计 | 高端服务展示 |

---

## 12. UI 自检清单（提交前必查）

```
□ 颜色全部从 §2 取，没有自由发挥
□ 字号全部从 §3.2 取，没有非标字号
□ 间距全部用 Tailwind 4px 倍数，没有奇数 px
□ 圆角统一 rounded-md / rounded-lg
□ 阴影只用 shadow-sm / shadow / shadow-md
□ 风险色严格遵守 🟢🟡🔴 三色规范
□ 智能管家等级配色按 LV1–LV5 专用色
□ 所有按钮 hover 有过渡
□ 所有列表有 EmptyState
□ 所有异步页有 LoadingState（Skeleton）
□ 所有错误页有 ErrorState（含重试按钮）
□ 所有表单有内联校验 + 错误提示
□ 所有金额用 tabular-nums 对齐
□ 所有时间用相对时间 + 鼠标悬停显示绝对时间
□ 所有图标来自 lucide-react，尺寸 4/5/6
□ 所有移动端触控目标 ≥ 44px
□ 中文文案统一用"您"
□ 没有 emoji 当功能元素
□ 没有 inline style，全用 className
□ 暗色模式 CSS 变量已留接口（即使一期不实现）
```

---

## 13. 不得违反的视觉红线

```
❌ 配色超出本文档定义的色板
❌ 引入 antd / element-ui / mui / chakra / arco 等其他 UI 库
❌ 使用渐变背景作为大面积主色（仅徽章 / 按钮特殊场景）
❌ 使用阴影 shadow-2xl 或彩色阴影
❌ 使用动画 duration > 600ms 的非数据动画
❌ 使用 emoji 表达功能（如 😀 替代图标）
❌ 使用电商风格（红色大促 / 倒计时炸眼 / 跳动数字）
❌ 使用消费 app 风格（卡通插画 / 圆角过大 / 配色饱和）
❌ 在政府版（apps/gov）使用金色或暖色调
❌ 在平台后台（apps/admin）使用过多装饰
❌ 在 AI 报告中省略 Tier 徽章 / 免责声明 / 信心度 / 下一步引导（4 强制要素）
```
