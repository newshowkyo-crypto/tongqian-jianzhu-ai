---
inclusion: always
---

# 前端工程规则（Frontend Rules）

> 适用所有前端代码（apps/web、apps/gov、apps/agent、apps/admin、apps/desktop）。

## 1. 技术栈（强制）

```
Next.js 14+ (App Router)
React 18+
TypeScript 5.4+ (strict)
Tailwind CSS 3+
shadcn/ui (Radix UI 底层)
TanStack Query 5+ (数据请求)
Zustand 4+ (全局状态)
react-hook-form + zod (表单)
lucide-react (图标)
date-fns (日期)
clsx / tailwind-merge (类名合并)
next/font (字体)
next/image (图片)
```

不允许引入未列出的库。新增必须先写 ADR。

## 2. App Router 结构

```
apps/web/src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (main)/
│   ├── dashboard/page.tsx
│   ├── opportunities/
│   │   ├── page.tsx               # 列表
│   │   ├── [id]/page.tsx          # 详情
│   │   └── new/page.tsx           # 创建
│   ├── contracts/
│   ├── tenders/
│   ├── qualifications/
│   └── layout.tsx
├── api/                            # 仅做代理 / SSE
└── layout.tsx                      # 根 layout
```

### 2.1 路由约定
- 列表页：`/{module}`
- 详情页：`/{module}/[id]`
- 创建页：`/{module}/new`
- 编辑页：`/{module}/[id]/edit`
- 子资源：`/{module}/[id]/{subresource}`

### 2.2 客户端 / 服务端组件
- 默认服务端（数据获取效率高）
- 用 `'use client'` 只在交互组件标记
- 不要在服务端组件用 hooks（useEffect / useState）

## 3. 数据请求

### 3.1 服务端组件直接 fetch
```tsx
async function Page() {
  const data = await fetcher.get('/api/v1/opportunities');
  return <List data={data} />;
}
```

### 3.2 客户端用 TanStack Query
```tsx
'use client';
function List() {
  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => api.getOpportunities(filters),
  });
}
```

### 3.3 mutation
```tsx
const mutation = useMutation({
  mutationFn: api.createContract,
  onSuccess: () => {
    queryClient.invalidateQueries(['contracts']);
    toast.success('已创建');
  },
  onError: (e) => toast.error(getErrorMessage(e)),
});
```

### 3.4 禁止
- 禁用 useEffect 调 fetch（必须用 TanStack Query）
- 禁用 axios 直接 import（必须用统一 api client）
- 禁用 SWR（统一用 TanStack Query）

## 4. API 客户端

`packages/api-client/src/index.ts` 统一封装：

```ts
import { apiClient } from '@tongqian/api-client';

// 自动带 JWT、自动处理 401、自动 toast 错误
const data = await apiClient.contracts.review({ fileId: 'xxx' });
```

API client 必须：
- 用 OpenAPI 自动生成（`openapi-typescript-codegen`）
- 自动 JWT 头
- 401 自动跳登录
- 422 自动 toast
- 5xx 自动告警 + 友好错误
- 自动 traceId 透传

## 5. 状态管理

### 5.1 Zustand 全局状态
仅以下数据放 Zustand：
- 用户信息
- 当前租户 / 当前项目
- 主题（暗色 / 浅色）
- 全局通知
- 全局设置

### 5.2 服务端数据用 TanStack Query
**禁止把 API 数据放 Zustand**。

### 5.3 表单状态用 react-hook-form
**禁止用 useState 管理复杂表单**。

### 5.4 临时 UI 状态用 useState
- 当前 tab
- 当前展开的 accordion
- modal 开关
- ...

## 6. 组件设计

### 6.1 单一职责
- 一个文件一个组件
- 单组件 ≤ 200 行
- 超出必须拆分

### 6.2 命名
- 文件：kebab-case `opportunity-card.tsx`
- 组件：PascalCase `OpportunityCard`
- props：camelCase

### 6.3 props 类型
```tsx
interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect?: (id: string) => void;
  className?: string;
}

export function OpportunityCard({ opportunity, onSelect, className }: OpportunityCardProps) {
  // ...
}
```

### 6.4 className 合并
```tsx
import { cn } from '@/lib/utils';

<div className={cn('base classes', { 'active-class': active }, className)}>
```

## 7. 表单

### 7.1 标准模式
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, '名称至少 2 个字'),
  amount: z.number().positive('金额必须为正数'),
});

type FormValues = z.infer<typeof schema>;

export function ContractForm({ onSubmit }: { onSubmit: (v: FormValues) => Promise<void> }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: 0 },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>合同名称</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '提交中...' : '提交'}
        </Button>
      </form>
    </Form>
  );
}
```

### 7.2 zod 校验复用
统一 schema 在 `packages/types/src/schemas/`，前后端共用。

## 8. 错误处理

### 8.1 全局错误边界
每个 layout 必须有 `error.tsx`：

```tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <ErrorState
      title="出错了"
      description={error.message}
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
```

### 8.2 异步错误
- mutation 错误用 onError + toast
- query 错误用 isError + ErrorState
- 严重错误（500）用 Sentry 上报

## 9. 路由守卫

### 9.1 中间件鉴权
`middleware.ts` 检查 cookie / token：

```ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect('/login');
  }
}
```

### 9.2 角色守卫
组件内：
```tsx
const { hasPermission } = useAuth();
if (!hasPermission('contract:approve')) return <Forbidden />;
```

## 10. 国际化

一期统一中文：
- 文案在 `apps/web/src/i18n/zh-CN.ts`
- 用 `t('module.key')` 引用
- **禁止硬编码中文**到组件

## 11. 主题

```css
/* globals.css */
:root {
  --color-primary: #1e5fbf;
  --color-bg: #fafafa;
  /* ... */
}
.dark {
  --color-bg: #18181b;
}
```

## 12. 性能

### 12.1 代码分割
```tsx
const HeavyComponent = dynamic(() => import('./heavy'), {
  loading: () => <Skeleton />,
});
```

### 12.2 图片
```tsx
import Image from 'next/image';
<Image src="/foo.jpg" alt="..." width={400} height={300} />
```

### 12.3 字体
```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

## 13. 测试

### 13.1 组件测试（Vitest + Testing Library）
```tsx
test('renders contract card', () => {
  render(<ContractCard contract={mockContract} />);
  expect(screen.getByText('合同标题')).toBeInTheDocument();
});
```

### 13.2 e2e（Playwright）
```ts
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=username]', 'test');
  // ...
});
```

每个核心流程必须有 e2e。

## 14. 桌面端（Tauri）

- 复用 web 代码，最小差异
- 入口在 `apps/desktop/`
- 调用系统功能（文件 / 通知 / 系统托盘）通过 Tauri API
- Windows 安装包必须有：图标 + 签名 + 自动更新

## 15. SEO（仅 web 公开页用）

- 用 `metadata` API
- 关键页面必须有 sitemap.xml + robots.txt
- OG 标签

## 16. 禁止行为

❌ 用 `any`
❌ 直接 fetch 不经 api-client
❌ 把 API 数据放 Zustand
❌ 用 useState 管理复杂表单
❌ 引入非白名单的 UI 库
❌ 硬编码中文文案
❌ 写超过 200 行的组件
❌ 不写 EmptyState / LoadingState / ErrorState
❌ 不做表单校验
❌ 用 `index` 作为列表 key
❌ 不优化图片
❌ 用 `<a>` 而不是 `<Link>` 做内部跳转
❌ 用 inline style 而不是 className
❌ 滥用 useEffect（应该用 query / mutation / Zustand）
