# 03 设计系统 - Design

## 1. 整体目录结构

```
packages/ui/
├── package.json
├── tsconfig.json
├── tailwind-preset.ts            # Tailwind preset（被 4 个子前端引用）
├── src/
│   ├── index.ts                  # 主导出
│   ├── tokens/                   # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   └── shadows.ts
│   ├── styles/
│   │   ├── tokens.css            # CSS 变量（:root + .dark）
│   │   └── globals.css           # 重置 + 字体
│   ├── primitives/               # 基础组件（包装 shadcn）
│   │   ├── button/
│   │   ├── input/
│   │   ├── card/
│   │   └── ... 30+
│   ├── layout/
│   │   ├── page-layout.tsx
│   │   ├── page-header.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-state.tsx
│   │   └── error-state.tsx
│   ├── data-display/
│   │   ├── stat-card.tsx
│   │   ├── risk-badge.tsx
│   │   ├── level-badge.tsx
│   │   ├── tier-badge.tsx
│   │   ├── credit-display.tsx    # 强制 BR-405
│   │   └── money-display.tsx
│   ├── forms/
│   │   ├── form-shell.tsx
│   │   └── form-field.tsx
│   ├── domain/
│   │   ├── opportunity-card.tsx
│   │   ├── risk-finding.tsx
│   │   ├── dispatch-card.tsx
│   │   ├── agent-row.tsx
│   │   ├── report-header.tsx
│   │   └── service-premium-card.tsx
│   ├── report/
│   │   ├── report-card-h5.tsx
│   │   ├── report-full-pdf.tsx
│   │   ├── brand-header.tsx
│   │   └── disclaimer-footer.tsx
│   ├── icons/
│   │   ├── index.ts              # re-export lucide
│   │   └── function-zones.ts     # 17 大功能区
│   ├── fonts/
│   │   └── index.ts              # next/font
│   └── lib/
│       └── utils.ts              # cn() 等
└── tests/
```

## 2. Design Tokens（精确值，与 ui-visual-spec.md 对齐）

```ts
// src/tokens/colors.ts
export const colors = {
  primary: {
    50: '#f0f6fe',
    100: '#dde9fc',
    200: '#bbd2f8',
    300: '#92b3f1',
    400: '#5e8be6',
    500: '#1e5fbf',  // ★ 主色（同乾深蓝）
    600: '#1a4ea3',
    700: '#163e87',
    800: '#143570',
    900: '#0d2950',
  },
  accent: {
    50:  '#fdf6e7',
    500: '#d4953a',  // ★ 同乾金
    700: '#a06d24',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  success: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 700: '#047857' },
  warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 700: '#b45309' },
  danger:  { 50: '#fef2f2', 100: '#fee2e2', 500: '#dc2626', 700: '#b91c1c' },
  info:    { 50: '#eff6ff', 500: '#0284c7', 700: '#075985' },
} as const;
```

## 3. Tailwind Preset 摘要

```ts
// tailwind-preset.ts
import { colors, typography, spacing } from './src/tokens';

export default {
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '2px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

## 4. 4 个子前端的 token 覆盖差异（实现）

```ts
// apps/web/tailwind.config.ts
import preset from '@tongqian/ui/tailwind-preset';
export default { presets: [preset] };

// apps/gov/tailwind.config.ts —— 庄重保守
export default {
  presets: [preset],
  theme: { extend: {
    colors: { accent: { 500: 'transparent' } }, // 移除金色
    fontSize: { /* +1 档：所有字号 ×1.125 */ },
  }},
};

// apps/agent/tailwind.config.ts —— 默认 + LV5 紫色
export default { presets: [preset] };

// apps/admin/tailwind.config.ts —— 表格密度 +20%
export default {
  presets: [preset],
  theme: { extend: { spacing: { /* px-4→px-3、py-3→py-2.5 */ } } },
};
```

## 5. 关键组件实现要点

### 5.1 CreditDisplay（强制 BR-405）

```tsx
// 强制：所有用户可见的扣费 UI 都用这个组件
interface CreditDisplayProps {
  /** 点数（不是元！）*/
  credits: number;
  /** 'compact' 显示 1500 点 / 'verbose' 显示 1500 点（约¥15） */
  variant?: 'compact' | 'verbose';
  className?: string;
}

export function CreditDisplay({ credits, variant = 'compact', className }: CreditDisplayProps) {
  return (
    <span className={cn('tabular-nums font-medium', className)}>
      <span>{credits.toLocaleString('zh-CN')}</span>
      <span className="text-neutral-500 ml-1">点</span>
      {variant === 'verbose' && (
        <span className="text-neutral-400 ml-1 text-xs">
          （约¥{(credits / 100).toFixed(2)}）
        </span>
      )}
    </span>
  );
}
```

❗ ESLint 规则禁止业务代码直接渲染 `点` / `元` 字符串（仅允许通过 CreditDisplay / MoneyDisplay）。

### 5.2 RiskBadge（3 色风险，BR 强约束）

```tsx
type RiskLevel = 'green' | 'yellow' | 'red';

const RISK_STYLES: Record<RiskLevel, string> = {
  green:  'bg-success-100 text-success-700 border-success-200',
  yellow: 'bg-warning-100 text-warning-700 border-warning-200',
  red:    'bg-danger-100 text-danger-700 border-danger-200',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  green: '低', yellow: '中', red: '高',
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      RISK_STYLES[level],
      className
    )}>
      <span aria-hidden>{level === 'green' ? '🟢' : level === 'yellow' ? '🟡' : '🔴'}</span>
      <span>{RISK_LABELS[level]}风险</span>
    </span>
  );
}
```

### 5.3 LevelBadge（智能管家 5 级，BR-332）

5 级渐变：
- LV1 灰：`bg-neutral-100 text-neutral-600`
- LV2 蓝：`bg-primary-100 text-primary-700`
- LV3 青：`bg-cyan-100 text-cyan-700`
- LV4 金：`bg-accent-50 text-accent-700 border border-accent-200`
- LV5 紫渐变：`bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700` + `shadow-sm shadow-purple-200`

### 5.4 TierBadge + ConfidenceIndicator + DisclaimerFooter（BR-322 4 强制要素）

每个 AI 报告页 **必须** 同时渲染这 3 个组件 + 1 个 CTA 按钮（nextStepHint）。

`ReportHeader` 强制接收 `requiredElements: RequiredElements` props，类型来自 `@tongqian/types`，缺一编译期 fail。

### 5.5 PageLayout / PageHeader / 3 状态组件

按 [`ui-ux-rules.md` §6](../../steering/ui-ux-rules.md) 实现。

## 6. 字体加载

```ts
// src/fonts/index.ts
import { Inter, JetBrains_Mono } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// 中文字体走系统字体（PingFang SC / Microsoft YaHei），不走 next/font 加载
```

每个 `apps/{name}/src/app/layout.tsx` 中：
```tsx
import { fontSans, fontMono } from '@tongqian/ui/fonts';
<html lang="zh-CN" className={cn(fontSans.variable, fontMono.variable)}>
```

## 7. 17 大功能区图标映射

```ts
// src/icons/function-zones.ts
import {
  Radar, Megaphone, Award, AlertTriangle, Wrench,
  HardHat, Calculator, FileImage, Wallet, FileSearch,
  UserCheck, Building2, Settings, MessageSquare, Sparkles,
  Bell, Shield,
} from 'lucide-react';

export const FunctionZoneIcons = {
  A: Radar,           // 经营机会区
  B: Megaphone,       // 投标赋能区
  C: Award,           // 资质护航区
  D: AlertTriangle,   // 风险审查区
  E: Wrench,          // 经营成本工具区
  F: HardHat,         // 项目部生产区
  G: Calculator,      // 造价/预算粗判区
  H: FileImage,       // 图纸智能区
  I: Wallet,          // 现金流/融资区
  J: FileSearch,      // 报告中心区
  K: UserCheck,       // 智能管家工作台区
  L: Building2,       // 政府/央国企区
  M: Settings,        // 平台后台区
  N: MessageSquare,   // AI 全局入口区
  O: Sparkles,        // 上瘾运营区
  P: Bell,            // 通知触达区
  Q: Shield,          // 合规与安全区
} as const;
```

## 8. 测试策略

### 8.1 单元测试（Vitest + RTL）

每个 primitive：渲染 + 基础交互 + a11y（axe-core）。

### 8.2 视觉回归（暂不做）

一期不引入 Chromatic / Percy（控制成本）。Storybook 部署到 staging 内部访问，运营人工检查。

### 8.3 PBT（仅适用于纯函数）

| 函数 | 属性 |
|---|---|
| `formatCredits(n)` | ∀ n ≥ 0：输出含千分位 + "点" |
| `formatMoney(n)` | ∀ n ≥ 10000：输出 "万" / ≥ 10^8：输出 "亿" |
| `riskLevelToStyle(level)` | ∀ level ∈ {green, yellow, red}：输出非空 |
| `tierToBadgeStyle(tier)` | ∀ tier ∈ {1,2,3,4}：输出对应色 |

## 9. 错误码命名空间

本 spec 不暴露 API，无业务错误码。仅在组件内部 throw `BaseError(code='UI.PROPS.INVALID', ...)` 用于开发期排错。

## 10. 关键设计权衡

| 决策 | 选择 | 备选 | 理由 |
|---|---|---|---|
| Token 双形态 | CSS var + Tailwind preset | 仅 Tailwind | CSS var 留暗色模式接口 |
| 报告 PDF 渲染 | @react-pdf/renderer + 本组件 | Puppeteer | 体积小、无浏览器依赖 |
| Storybook | P2 后置 | P0 必做 | OPC 模式优先核心 |
| 动效库 | tailwindcss-animate + Motion One | framer-motion | 体积更小 |

## 11. PBT 落点

弱 PBT（仅纯函数级），不强制。报告 schema 校验在 [`04-ai-gateway`] 与 [`10-report-center`]。

## 12. 后台覆盖

本 spec 不涉及 system_configs。
