---
inclusion: always
---

# 测试规则（Testing Rules）

## 1. 测试金字塔

```
        /\
       /  \    e2e（少量，关键流程）
      /----\
     /      \   集成测试（中量）
    /--------\
   /          \  单元测试（大量）
  /____________\
```

## 2. 工具

| 类型 | 工具 |
|---|---|
| 单元测试 | Vitest |
| 集成测试 | Vitest + supertest |
| e2e | Playwright |
| Mock | vitest mock + msw |
| 覆盖率 | c8 (内置) |

## 3. 后端测试

### 3.1 单元测试
- 每个 service 必须有 `*.service.spec.ts`
- 覆盖率 ≥ 70%
- 必测路径：happy / 边界 / 错误 / 权限拒绝

```ts
describe('CreditService', () => {
  describe('preCharge', () => {
    it('扣点成功返回 true', async () => {
      const result = await service.preCharge('user1', 100);
      expect(result.success).toBe(true);
    });
    
    it('余额不足抛 BusinessError', async () => {
      await expect(service.preCharge('user1', 99999))
        .rejects.toThrow(BusinessError);
    });
    
    it('租户隔离：不允许跨租户扣点', async () => {
      // ...
    });
  });
});
```

### 3.2 集成测试
- e2e API 测试覆盖核心流程
- 用 supertest + 真实 PG（test schema）
- 每个 endpoint 至少：happy + 1 错误路径

```ts
describe('POST /api/v1/contracts/review', () => {
  it('上传 PDF 成功创建审查任务', async () => {
    const res = await request(app)
      .post('/api/v1/contracts/review')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'tests/fixtures/contract.pdf');
    expect(res.status).toBe(201);
    expect(res.body.data.taskId).toBeDefined();
  });
  
  it('文件超过 50MB 返回 422', async () => {
    // ...
  });
});
```

## 4. 前端测试

### 4.1 组件测试
- 关键组件必须有测试
- 重点测：渲染 / 交互 / 边界

```tsx
test('OpportunityCard 渲染机会数据', () => {
  render(<OpportunityCard opportunity={mockOpp} />);
  expect(screen.getByText(mockOpp.title)).toBeInTheDocument();
});

test('点击卡片调用 onSelect', async () => {
  const onSelect = vi.fn();
  render(<OpportunityCard opportunity={mockOpp} onSelect={onSelect} />);
  await userEvent.click(screen.getByRole('button', { name: '查看详情' }));
  expect(onSelect).toHaveBeenCalledWith(mockOpp.id);
});
```

### 4.2 Hook 测试

```tsx
test('useCreditBalance 正确返回余额', async () => {
  const { result } = renderHook(() => useCreditBalance(), { wrapper });
  await waitFor(() => expect(result.current.data).toBeDefined());
});
```

### 4.3 e2e（Playwright）
- 必测：注册 / 登录 / 充值 / 创建报告 / 续订
- CI 中每次 PR 跑

```ts
test('用户从注册到生成第一份报告', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[name="phone"]', '13800000000');
  // ...
  await expect(page).toHaveURL('/dashboard');
  await page.click('text=新建合同审查');
  await page.setInputFiles('input[type=file]', 'tests/contract.pdf');
  await expect(page.locator('text=审查中')).toBeVisible();
});
```

## 5. Mock 策略

### 5.1 Mock 外部依赖
- AI 模型（用固定响应）
- 阿里云 API
- 微信支付
- OCR

```ts
import { mockProvider } from '@/test/mocks/ai-provider';
beforeEach(() => mockProvider.reset());
```

### 5.2 不 Mock 数据库（用测试库）
```
DATABASE_URL_TEST=postgresql://.../test_db
```

每次测试前 truncate + seed。

### 5.3 不 Mock Redis（用真实测试实例）
```
REDIS_URL_TEST=redis://localhost:6380
```

## 6. 测试数据

`packages/test-fixtures/`：
- 用户 fixture
- 企业 fixture
- 合同 / 招标 / 资质 fixture
- 文件 fixture（PDF / Word / 图片）

## 7. 覆盖率目标

| 模块 | 目标 |
|---|---|
| 核心业务（auth / credit / payment）| ≥ 85% |
| 杀手锏（contract / tender / qualification）| ≥ 75% |
| AI Gateway | ≥ 80% |
| 前端组件 | ≥ 60% |
| 工具函数 | ≥ 90% |

## 8. CI 集成

每次 PR 必须：
- ✅ lint 通过
- ✅ typecheck 通过
- ✅ 单元测试通过
- ✅ 集成测试通过
- ✅ e2e 关键路径通过
- ✅ 覆盖率不低于 baseline

## 9. 性能测试

主要接口必须测：
- 1 QPS / 10 QPS / 100 QPS 下响应时间
- 用 k6 / Artillery

## 10. 安全测试

- SQL 注入：自动跑 sqlmap 关键 endpoint
- XSS：模板渲染必须 escape
- 越权：每个写接口必须测跨租户拒绝
- 限流：超阈值必须返回 429

## 11. 禁止行为

❌ 跳过测试用 `it.skip`（除非有 issue 跟踪）
❌ 用 `expect(true).toBe(true)` 占位
❌ Mock 全部依赖（保留至少一层真实调用）
❌ 测试硬编码现实数据（用 fixture）
❌ 测试间互相依赖（每个测试独立）
❌ 测试不清理副作用（必须 afterEach）
❌ 测试运行时间超过 10s（拆分）
