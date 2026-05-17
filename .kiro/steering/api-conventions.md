---
inclusion: always
---

# API 设计规范（API Conventions）

## 1. URL 设计

- 统一前缀：`/api/v{n}/`，当前版本 `v1`
- 资源用复数：`/api/v1/users`、`/api/v1/contracts`
- 嵌套资源：`/api/v1/projects/:projectId/contracts`
- 动作类用动词在末尾：`/api/v1/contracts/:id/approve`
- 全部 kebab-case：`/api/v1/agent-payouts`（不是 `agentPayouts`）

## 2. HTTP 方法

| 方法 | 用途 | 幂等 |
|---|---|---|
| GET | 读取资源 | ✅ |
| POST | 创建资源 / 触发动作 | ❌ |
| PUT | 全量替换 | ✅ |
| PATCH | 部分更新 | ❌ |
| DELETE | 删除（软删）| ✅ |

## 3. 统一响应格式

### 成功
```json
{
  "code": 0,
  "data": { ... },
  "message": "ok",
  "traceId": "abc-123"
}
```

### 失败
```json
{
  "code": "MODULE.SUBMODULE.ERROR_CODE",
  "data": null,
  "message": "用户友好的中文错误信息",
  "traceId": "abc-123",
  "details": { ... }   // 可选
}
```

### 列表 / 分页
```json
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 1234,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  },
  "message": "ok",
  "traceId": "abc-123"
}
```

## 4. 错误码命名

格式：`{MODULE}.{SUBMODULE}.{ERROR}`

例：
- `AUTH.LOGIN.PASSWORD_INVALID`
- `CREDIT.DEDUCT.INSUFFICIENT`
- `AI.MODEL.TIMEOUT`
- `CONTRACT.REVIEW.FILE_TOO_LARGE`

错误码必须在 `packages/errors/codes.ts` 集中定义，每个有：
- code: 唯一字符串
- httpStatus: HTTP 状态码
- message: 默认中文消息
- userActionable: 用户能不能自己解决

## 5. HTTP 状态码使用

| 码 | 用途 |
|---|---|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回） |
| 400 | 客户端入参错误 |
| 401 | 未认证（token 无效 / 过期） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（重复创建 / 状态冲突）|
| 422 | 业务规则违反 |
| 429 | 限流 |
| 500 | 服务器内部错误 |
| 502 | 上游（模型 API）错误 |
| 503 | 服务暂不可用 |

## 6. 鉴权

- 所有 API 默认需要 JWT
- 用 `Authorization: Bearer {token}` 头
- 公开接口必须显式标注 `@Public()`
- 角色限制用 `@Roles(UserRole.PLATFORM_ADMIN)`
- 权限点用 `@RequirePermission('contract:approve')`

## 7. 分页

- 默认 `page=1, pageSize=20`
- pageSize 上限 100
- 排序用 `sort=createdAt:desc,name:asc`
- 长列表（大数据量）必须用游标分页：`?cursor=xxx&limit=50`

## 8. 过滤与搜索

- 等值过滤：`?status=active`
- 多值：`?status=active,frozen`
- 范围：`?createdAt[gte]=2025-01-01&createdAt[lte]=2025-12-31`
- 全文搜索：`?q=关键词`（专门的搜索字段）
- 复杂查询用 POST + body（避免 URL 长度问题）

## 9. 幂等性

写操作必须支持 `Idempotency-Key` 头：
- 客户端生成 UUID
- 服务端按 Idempotency-Key + userId + endpoint 缓存 24 小时
- 同 key 重复请求返回首次结果

## 10. 限流

请求头返回：
- `X-RateLimit-Limit`: 限制
- `X-RateLimit-Remaining`: 剩余
- `X-RateLimit-Reset`: 重置时间戳

429 响应必须带 `Retry-After` 头。

## 11. CORS

- 生产域名白名单
- `credentials: include`（带 cookie）
- 预检请求 OPTIONS 必须 200

## 12. 文件上传

- 单文件 ≤ 50MB
- 多文件总大小 ≤ 200MB
- 大文件分片上传（≥ 10MB）
- 上传成功返回 OSS 内部 URL（签名）+ 文件 ID
- 公网访问用临时签名 URL（≤ 1 小时）

## 13. 长任务

AI 任务、报告生成等耗时操作必须异步：

```
POST /api/v1/ai-tasks
→ 201 { taskId: "xxx", status: "queued" }

GET /api/v1/ai-tasks/:taskId
→ 200 { taskId, status, progress, result?, error? }
```

或用 SSE / WebSocket 实时推送进度。

## 14. WebSocket

- 路径 `/ws/{namespace}`
- 鉴权用 query 参数 token
- 心跳 30 秒
- 消息格式：`{ event: "...", data: {...}, traceId: "..." }`

## 15. OpenAPI 同步

- 所有接口必须在 `packages/contracts/openapi.yaml` 声明
- CI 自动校验代码与 OpenAPI 一致
- 接口变更必须先改 OpenAPI 再改代码

## 16. 兼容性

- API 不允许破坏性变更（禁止删字段 / 改类型 / 改语义）
- 必要的破坏性变更升 v2 版本，v1 至少保留 6 个月

## 17. 响应时间

- 普通 API：p95 ≤ 500ms
- 列表查询：p95 ≤ 1s
- AI 同步接口：p95 ≤ 30s（超时返回错误，不阻塞）
- AI 异步接口：触发后立即 201，状态查询 ≤ 200ms

## 18. 调试

每个响应必须带 `traceId`，可在监控系统按 traceId 追溯完整调用链。
