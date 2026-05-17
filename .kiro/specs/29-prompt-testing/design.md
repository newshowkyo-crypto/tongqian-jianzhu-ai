# 29 Prompt 黄金测试集 - Design

## 1. 模块结构

```
apps/api/src/prompt-testing/
├── golden-test-runner.service.ts       # 测试执行引擎
├── similarity-calculator.service.ts    # 语义相似度计算
├── embedding-cache.service.ts          # embedding 24h 缓存
├── test-report-renderer.service.ts     # diff 报告渲染
└── ci-integration.service.ts            # PR comment + 阻止合并

.kiro/golden-test-sets/                 # 测试集存放（git 内）
├── contract-review-pro/
│   ├── _meta.json                       # 元数据 + 通过阈值
│   ├── case-001.json
│   ├── case-002.json
│   └── ... 10 case
├── tender-framework-pro/
├── qualification-upgrade-pro/
├── policy-fund-match/
├── morning-briefing/
├── boss-assistant-strict/
├── boss-assistant-brotherly/
├── reminder-letter-aged/
├── modification-letter/
├── daily-quiz/
└── ... 30+
```

## 2. 数据模型

```prisma
model PromptGoldenTestRun {
  id             String   @id @default(cuid())
  prompt_name    String
  prompt_version String
  test_run_id    String   // CI run id
  total_cases    Int
  passed_cases   Int
  failed_cases   Int
  pass_rate      Decimal
  passed         Boolean  // pass_rate ≥ 0.7 ?
  details        Json     // 每个案例的相似度 + diff
  triggered_at   DateTime @default(now())
  
  @@index([prompt_name, prompt_version])
}
```

## 3. 测试运行流程

```
1. CI 检测到 apps/api/src/prompts/X.ts 变更
   ↓
2. 加载 .kiro/golden-test-sets/X/ 下所有 .json 案例
   ↓
3. 遍历每个案例：
   a. 跑当前 Prompt 拿 AI 输出
   b. 计算 AI 输出与 expected_output 的 embedding
   c. 余弦相似度 ≥ min_passing_similarity → 通过
   d. 否则失败 + 记录 diff
   ↓
4. 汇总通过率
   ≥ 70% → CI 绿
   < 70% → CI 红 + PR comment + 阻止合并
   ↓
5. 写 PromptGoldenTestRun 表（保留历史）
```

## 4. 相似度计算

```typescript
async function calculateSimilarity(actual: any, expected: any): Promise<number> {
  // 1. 序列化为对比字符串
  const actualText = stringifyForComparison(actual);
  const expectedText = stringifyForComparison(expected);
  
  // 2. 调 embedding API（阿里百炼 / OpenRouter）
  const [actualEmb, expectedEmb] = await Promise.all([
    embeddingService.embed(actualText),
    embeddingService.embed(expectedText),
  ]);
  
  // 3. 余弦相似度
  return cosineSimilarity(actualEmb, expectedEmb);
}
```

## 5. PR comment 格式

```markdown
## 🎯 Prompt 黄金测试报告

**Prompt**: contract-review-pro v3 → v4
**通过率**: 8/10 (80%) ✅

### 详情

| Case | 相似度 | 阈值 | 结果 |
|---|---|---|---|
| 001 | 0.85 | 0.70 | ✅ |
| 002 | 0.78 | 0.70 | ✅ |
| 003 | 0.65 | 0.70 | ❌ |
| 004 | 0.42 | 0.70 | ❌ |
| ...

### 失败案例 diff

#### Case 003
- expected.summary: "建议关注无限连带责任..."
- actual.summary: "合同存在风险..."
- 差异：actual 缺失"无限连带"具体术语
```

## 6. embedding 缓存

```prisma
model EmbeddingCache {
  id          String   @id @default(cuid())
  text_hash   String   @unique  // SHA256
  text        String
  embedding   Float[]
  model       String   // text-embedding-v2 / text-embedding-3-small
  expires_at  DateTime
  created_at  DateTime @default(now())
  
  @@index([text_hash])
}
```

24h TTL，命中即复用，省 embedding 调用费。
