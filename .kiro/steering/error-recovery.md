---
inclusion: always
---

# 错误恢复手册（Error Recovery Playbook）

> 当 [`self-verification.md`](./self-verification.md) DoD 失败时，Codex / Claude Code **必须**先查本手册对应 playbook 修复。仅当本手册无对应方案 + 重读 spec 仍无解 → 标记 blocked。

## 0. 失败分类总览

| 失败类型 | Playbook |
|---|---|
| TypeScript 错误 | §1 |
| ESLint 错误 | §2 |
| Build 失败 | §3 |
| 单元测试失败 | §4 |
| e2e 测试失败 | §5 |
| Prisma migration 失败 | §6 |
| OpenAPI gen 失败 | §7 |
| 循环依赖 | §8 |
| AI Gateway 调用失败 | §9 |
| Docker 构建失败 | §10 |
| Git commit / push 失败 | §11 |
| 跨租户 e2e 失败 | §12 |

## 1. TypeScript 错误

### 常见症状 + 修法

| 错误关键字 | 原因 | 修法 |
|---|---|---|
| `Cannot find module '@tongqian/types'` | workspace 包未 build | 跑 `pnpm --filter @tongqian/types build` |
| `Property 'X' does not exist on type` | DTO 字段缺失 | 先改 `packages/types`，再 commit；后改业务代码 |
| `Type 'string \| undefined' is not assignable` | strict null check | 加 `if (!x) throw` 或 `x ?? defaultValue` |
| `Argument of type 'X' is not assignable` | 类型不匹配 | 转换：`as X` 仅在确认安全；否则改类型定义 |
| `Object is possibly 'undefined'` | noUncheckedIndexedAccess | 加保护：`x?.field` 或 early return |
| `Element implicitly has an 'any' type` | index signature 缺 | 加 `Record<string, T>` 或显式类型 |

❌ **禁止**：
- 加 `any` / `// @ts-ignore` 绕过
- 把 strict 关掉

✅ **正确做法**：
1. 看错误的具体类型
2. 找定义来源（grepSearch type 名）
3. 修类型 / 加守卫

## 2. ESLint 错误

| 错误 rule | 修法 |
|---|---|
| `unused-imports/no-unused-imports` | 删未用 import |
| `import/order` | 按 builtin → external → internal → parent → sibling → index 重排 |
| `@typescript-eslint/no-explicit-any` | 改用具体类型或 unknown + 类型守卫 |
| `@typescript-eslint/consistent-type-imports` | `import type { X }` |
| `@typescript-eslint/no-floating-promises` | 加 `await` 或 `void promise` |

❌ **禁止** `// eslint-disable` 绕过。改代码。

## 3. Build 失败

### 症状判断

```bash
# 单 package 失败 → 该 package 内部问题
pnpm --filter <pkg> build

# 多 package 失败 → 依赖链问题
# 按拓扑顺序：types → errors → permissions → constants → contracts → utils → ui → api/web
```

### 修法

| 症状 | 修法 |
|---|---|
| Next.js standalone 模式找不到文件 | `output: 'standalone'` 在 next.config 是否设置 |
| Prisma client 未生成 | `pnpm prisma generate` |
| 缺 `.d.ts` | `pnpm --filter @tongqian/types build` 后重试 |
| Worker 找不到 BullMQ Job | 注册 module + Processor 装饰器 |
| 内存溢出 | `NODE_OPTIONS='--max-old-space-size=4096' pnpm build` |

## 4. 单元测试失败

| 症状 | 修法 |
|---|---|
| Mock 没生效 | 检查 `vi.mock()` 在 import 之前 |
| 异步断言 | `await expect(...).rejects.toThrow()` 顺序 |
| 测试间状态泄漏 | 加 `afterEach` 清理 + truncate 测试库 |
| Prisma 测试库连不上 | 检查 `DATABASE_URL_TEST` + docker-compose 起来了吗 |
| Date 不稳定 | 用 `vi.setSystemTime(new Date('2025-05-15'))` |
| 随机失败（flaky）| 用 fast-check seed 固定，写到代码里 |

❌ **禁止**：
- 删测试 / 加 `it.skip` 让构建通过
- 把断言改宽（如 `expect(x).toBeTruthy()` 替代具体值）

## 5. e2e 测试失败

| 症状 | 修法 |
|---|---|
| Playwright 找不到元素 | 用 `data-testid` 而不是文本，加 `await page.waitFor` |
| 后端 500 | 检查 logs 找根因，回头修 service |
| 数据库未 reset | 测试前 `truncate` + `seed` |
| AI 调用真实模型超时 | mock AI Gateway，仅 stub 输出 |
| 微信支付 webhook | mock 签名 + 直接调 webhook 接口 |
| 端口冲突 | 测试前清理 docker-compose down |

## 6. Prisma migration 失败

| 症状 | 修法 |
|---|---|
| `migration drift detected` | `pnpm prisma migrate reset` （仅开发库）|
| `relation already exists` | 删 dev migration 重生成，或手动 fix migration SQL |
| 字段类型不兼容 | 按"加新字段 + 拷数据 + 删旧字段" 三步走，不直接改 |
| 主键变更 | 几乎不可逆，先备份再做 |
| Cascade 误删 | 立即停 + 用最近备份恢复 |

❗ **生产强约束**：仅 `prisma migrate deploy`，不用 dev。

## 7. OpenAPI gen 失败

| 症状 | 修法 |
|---|---|
| `redocly lint` 报错 | 看具体行号，修 yaml 语法 |
| client 类型与 types 不一致 | 改 OpenAPI yaml（先行）→ regen → 改 types |
| 路径冲突 | 检查 paths/*.yaml 是否重复定义 |
| ref 找不到 | 检查相对路径，应是 `./paths/auth.yaml#/register` |

## 8. 循环依赖

```bash
pnpm madge --circular packages/
```

| 报错 | 修法 |
|---|---|
| `types → constants → types` | 把跨用类型抽到 types 顶层（不依赖 constants）|
| 业务模块互相 import | 通过 packages/types 中转 |
| 服务间依赖 | 用事件总线（BullMQ）解耦 |

❌ **禁止** 用 `import('./foo')` 动态 import 绕过（仍是循环）。

## 9. AI Gateway 调用失败

| 错误码 | 原因 + 修法 |
|---|---|
| `AI.GATEWAY.UNAVAILABLE` | 所有 provider 失败 → 检查 API key + 网络 + 切兜底 provider |
| `AI.RATE_LIMIT.EXCEEDED` | 等待 retry-after 或调高 system_configs |
| `AI.TASK_TYPE.UNKNOWN` | 任务未在 04 R14 注册，先注册 |
| `AI.OUTPUT.SCHEMA_INVALID` | Prompt 输出不符合 schema → 调 Prompt + 加 few-shot |
| `AI.OUTPUT.SAFETY_BLOCKED` | 内容被审核拦截 → 改 Prompt 软化措辞 |
| `AI.PROVIDER.TIMEOUT` | 超时 → 重试 1 次同模型 → 切兜底 |
| `AI.SANITIZER.UNRECOVERABLE` | 脱敏字段过多 → 检查 sanitizer 规则 |
| `AI.CONSENT.MISSING` | 未授权 → 自动降级国产模型 |

## 10. Docker 构建失败

| 症状 | 修法 |
|---|---|
| 镜像超过限额（API 150MB / Next 200MB）| 检查 multi-stage 是否有冗余依赖 |
| pnpm install 在 build 阶段重复 | 利用 layer 缓存 + lockfile 复制策略 |
| Healthcheck 失败 | 看应用日志，可能是端口或路径 |
| ACR 推送 401 | 检查 GitHub Secrets 凭证 |

## 11. Git commit / push 失败

| 症状 | 修法 |
|---|---|
| pre-commit hook 失败 | 修代码（不用 --no-verify）|
| Conventional Commits 格式不符 | 用规范前缀 `feat(scope): ...` |
| 文件超 5 个 | 拆 commit |
| push 被 GitHub 拒绝 | 看错误：分支保护 / pre-receive hook → 改 PR 流程 |
| Force push 被拒 | 不要 -f；revert 然后正常 push |

## 12. 跨租户 e2e 失败

| 症状 | 修法 |
|---|---|
| tokenB 能查到 tokenA 的数据 | 检查 BaseRepository 是否 import；或 service 用了 PrismaClient 直连 |
| 404 vs 403 | 必须 404（防泄漏存在性，[`security-rules.md` §3](./security-rules.md)）|
| 写操作落到错租户 | 检查 createInput 是否 spread 了 tenant_id |
| Prisma middleware 没拦住 | 检查 SYSTEM_MODELS 列表是否误把业务表加入例外 |

## 13. 紧急情况（写 BLOCKED.md）

以下情况停下并写 `BLOCKED.md`：

| 情况 | 写到 BLOCKED.md 的内容 |
|---|---|
| 缺 P0 凭证 | 列出缺哪些 + 创始人去哪获取 + 申请预计周期 |
| 触发安全红线 | 描述场景 + 已防御措施 + 建议 |
| 同一 task 失败 ≥ 3 次 | 错误日志 + 已尝试修法 + 推测原因 |
| 外部 API 异常 | provider name + 错误 + 已切兜底情况 |
| Migration 失败回滚不了 | 数据库现状 + 备份恢复建议 |

## 14. 失败重试上限规则

```
单一 task 同一类错误：
  尝试 1：按本手册对应 playbook 修
  尝试 2：grep 周边代码模式参考已有实现
  尝试 3：重读 spec 确认约束
  尝试 4：仍失败 → blocked + 跳过 + 写 BLOCKED.md

跨会话：
  下次会话 progress.json 仍标 blocked → 跳过
  仅当用户手动改回 pending 才重试
```

## 15. 修复后验收

每次修复后**必须**重新跑 [`self-verification.md` §4](./self-verification.md) 命令套件。所有项绿才算 fix 成功。

## 16. 写 ADR 的时机

修复涉及"非临时决策"时（即同类问题以后还会遇到）：

```bash
# 写到 docs/decisions/
auto-{date}-{topic}.md

格式：
- 问题
- 决策
- 理由
- 影响范围
- 是否需要更新 spec / steering
```

例：`auto-2025-05-20-prisma-tenant-id-on-system-tables.md`。
