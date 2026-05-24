# M26 一次跑完（VPS 同步 + 全网爬虫 + AI 抽取 + 候选审核台）

> Codex 一段读完，按 7 步执行，每步 1 commit。

---

## 0. 必读 + 节流契约（最高优先级）

**Token 节流强约束**（违反任一立即停手 commit + push + 主动结束会话）：

- 上下文 ≥ 50% → 立刻 commit + push + 主动结束（不撑到 80% 才被动）
- **不开 dev server**（`pnpm dev` / `next dev` / `tauri dev` 一律不许）
- **不截图**（不跑 puppeteer / playwright headless / playwright trace；用户明确说截图太慢）
- **不写 MILESTONE 长文档**（最终交 6 段文本即可）
- **不真跑爬虫上量**（只验证 fetcher 真发 HTTP + 单元测试 mock HTTP；上量在 VPS cron 才跑）
- **不真跑 docker build / tauri build**（10+ 分钟太久）
- grep 定位行号后只读相关行段，禁 readFile 整文超 300 行
- 同一 grep 不重复 > 2 次
- 工具调用预算：LOAD ≤ 8 / CODE ≤ 18 / VERIFY ≤ 5 / COMMIT ≤ 8（**单子块**）
- 每子块 ≤ 5 文件 / ≤ 500 行 / 1 commit
- SHALL NOT 询问用户；SHALL NOT 写 BLOCKED.md（除真触发 security-rules 红线）；SHALL NOT 改 mode 为 paused（除上下文 ≥ 60% 主动结束）
- 工具问题（husky / Node v25 engine warning / pnpm engine-strict）允许 `--no-verify` 和 `--config.engine-strict=false` 绕开

**先读**（按顺序，只读相关行段）：

1. `.kiro/state/PROJECT-MEMORY-2026-05-23.md` 全文（**§A 永久事实区必看**：VPS=`deploy@101.132.191.128` 私钥`C:\Users\Administrator\.ssh\id_ed25519`，DeepSeek 已付费，ICP 审核中尾声，业务底料改全网采集）
2. `AGENTS.md` 仅 §3.7 双轨命名 + §3.8 V4 商业宪法 + §16 全局阻塞预防
3. `.kiro/steering/security-rules.md` §10 数据出境 + §13 审计日志
4. `.kiro/state/M26-CRAWLER-AUTO-CURATION.md` 全文（已写好的 M26 spec）
5. `apps/api/src/modules/security-compliance/security-compliance.service.ts`（12 个公开数据源已列）
6. `apps/api/src/modules/knowledge/knowledge.service.ts`（既有 `triggerCrawler` mock）
7. `apps/api/src/modules/admin/ingest/ingest-admin.controller.ts`（既有 3 个 mock job）
8. `apps/api/src/modules/rule-curation/rules.service.ts`（候选审核入口已在）

**双轨命名**：用户可见层中文，代码层英文 `crawler / fetcher`，**绝不出现"中介"**。

---

## 1. 7 步执行（每步 1 commit）

### 步骤 1 · VPS 代码同步（最先做，30 秒）

在本机 PowerShell 跑：

```powershell
ssh -o StrictHostKeyChecking=no deploy@101.132.191.128 "test -d /opt/tongqian/.git && (cd /opt/tongqian && git pull origin main) || sudo git clone https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai.git /opt/tongqian"
```

如 SSH 提示 passphrase 等用户输入：等待用户输完即可（**SHALL NOT** 询问用户密码内容，让 ssh 自己交互）。
如返回 `Permission denied (publickey)`：跳过此步骤，标注"VPS 备份待 SSH 配置就绪后人工跑"，继续步骤 2。
**SHALL NOT** 写 BLOCKED.md。

成功后跑一次 ls 确认：

```powershell
ssh deploy@101.132.191.128 "ls -la /opt/tongqian/.kiro/state/PROJECT-MEMORY-2026-05-23.md /opt/tongqian/.kiro/state/M26-CRAWLER-AUTO-CURATION.md 2>&1 | head -5"
```

**步骤 1 不需要 commit**（只是 VPS 同步，本机没改文件）。

---

### 步骤 2 · 子块 1 爬虫框架 + 6 个真 fetcher（commit 1）

**文件清单（≤ 7 个文件）**：

- `apps/worker/src/crawlers/base-fetcher.ts`（新建）
- `apps/worker/src/crawlers/cebpubservice.fetcher.ts`（新建）
- `apps/worker/src/crawlers/wenshu.fetcher.ts`（新建）
- `apps/worker/src/crawlers/creditchina.fetcher.ts`（新建）
- `apps/worker/src/crawlers/mohurd.fetcher.ts`（新建）
- `apps/worker/src/crawlers/mof.fetcher.ts`（新建）
- `apps/worker/src/crawlers/ndrc.fetcher.ts`（新建）
- `apps/worker/src/queues/crawler.queue.ts`（新建或改）
- `apps/worker/src/main.ts`（注册 6 processor，改 ≤ 30 行）

**base-fetcher.ts 核心要求**（≤ 120 行）：

```ts
import { fetch } from 'undici'; // 或 node-fetch
import * as cheerio from 'cheerio';
import crypto from 'node:crypto';

export interface FetchResult<TItem> {
  items: TItem[];
  fetchedCount: number;
  upsertedCount: number;
  failedCount: number;
  errors: string[];
  traceId: string;
  durationMs: number;
}

export abstract class BaseFetcher<TItem> {
  abstract sourceName: string;
  abstract sourceUrl: string;
  abstract fetch(): Promise<TItem[]>; // 真发 HTTP
  abstract parse(html: string): TItem[];
  abstract dedup(items: TItem[]): Promise<TItem[]>;
  
  protected userAgent = 'Tongqian research crawler + biz@tongqian.xin';
  protected requestIntervalMs = 2000;
  protected maxRetries = 5;
  
  protected async checkRobotsTxt(): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', this.sourceUrl).toString();
      const res = await fetch(robotsUrl, { headers: { 'User-Agent': this.userAgent } });
      const text = await res.text();
      return !text.includes(`Disallow: /${new URL(this.sourceUrl).pathname.split('/')[1] ?? ''}`);
    } catch {
      return true; // robots 不可访问视为允许（保守可改 false）
    }
  }
  
  protected async exponentialBackoff(attempt: number): Promise<void> {
    const delay = Math.min(this.requestIntervalMs * Math.pow(2, attempt), 60_000);
    await new Promise((r) => setTimeout(r, delay));
  }
  
  async run(): Promise<FetchResult<TItem>> {
    const traceId = crypto.randomUUID();
    const start = Date.now();
    const result: FetchResult<TItem> = { items: [], fetchedCount: 0, upsertedCount: 0, failedCount: 0, errors: [], traceId, durationMs: 0 };
    
    if (!(await this.checkRobotsTxt())) {
      result.errors.push('robots.txt disallow');
      result.durationMs = Date.now() - start;
      return result;
    }
    
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const items = await this.fetch();
        result.fetchedCount = items.length;
        result.items = await this.dedup(items);
        result.upsertedCount = result.items.length;
        break;
      } catch (e) {
        result.failedCount++;
        result.errors.push(`attempt ${attempt}: ${e instanceof Error ? e.message : 'unknown'}`);
        attempt++;
        if (attempt < this.maxRetries) await this.exponentialBackoff(attempt);
      }
    }
    
    result.durationMs = Date.now() - start;
    await this.writeIngestRun(result); // 写 ingest_runs 表审计
    return result;
  }
  
  protected abstract writeIngestRun(result: FetchResult<TItem>): Promise<void>;
}
```

**6 个 fetcher 各 ≤ 80 行**：每个继承 BaseFetcher，实现 `fetch()` 真发请求 + `parse(html)` 用 cheerio 解析 + `dedup()` 按 sourceUrl + sha256 去重 + `writeIngestRun()` 调既有 `ingest_runs` 表（看 `apps/api/src/modules/admin/ingest/ingest-admin.controller.ts` 第 102-106 行的 SQL 模板复用）。

**6 个 cron 时间**（防风控分散）：
- cebpubservice: 每天 04:00
- wenshu: 每周日 03:00（防风控）
- creditchina: 每周三 05:00
- mohurd: 每天 06:00
- mof: 每天 06:30
- ndrc: 每天 07:00

**单元测试**（`apps/worker/tests/crawlers/*.spec.ts`）：每个 fetcher 1 个，mock fetch 返回 sample HTML，验证 parse 出 ≥ 1 条 + writeIngestRun 被调用。

提交：

```bash
git add apps/worker/src/crawlers apps/worker/src/queues apps/worker/src/main.ts apps/worker/tests/crawlers
git commit --no-verify -m "feat(m26): base-fetcher + 6 real crawlers + bullmq schedule"
git push -u origin feature/m26-crawler-auto-curation
```

---

### 步骤 3 · 子块 2 AI 候选抽取 pipeline（commit 2）

**文件清单（≤ 5）**：

- `apps/api/src/modules/rule-extraction/rule-extraction.service.ts`（新建 ≤ 150 行）
- `apps/api/src/modules/rule-extraction/rule-extraction.module.ts`（新建 ≤ 30 行）
- `apps/api/src/prompts/rules/rule-extract.prompt.ts`（新建 ≤ 200 行，含 fewShotExamples ≥ 3）
- `apps/api/src/main.ts`（在 AppModule.imports 添加 RuleExtractionModule，改 ≤ 5 行）
- `apps/api/tests/rule-extraction.spec.ts`（1 个集成测试）

**rule-extraction.service.ts 核心**：
- 监听 `crawler.completed` 事件（BullMQ Event）
- 按 sourceType 路由到不同 Prompt
- 调 `aiGateway.invoke({ taskType: AiTaskType.RULE_EXTRACT, input })` （如 taskType 不存在则在 `packages/types/src/ai-task.ts` 添加 `RULE_EXTRACT = 'rule.extract'`）
- 输出 zod 校验失败重试 ≤ 2 次
- 调 `rulesService.createCandidate()` 写入候选表
- 写 audit log + 关联 source_url + extract_trace_id

**rule-extract.prompt.ts 核心**（PromptTemplate 标准结构）：
- version: v1
- primaryModel: deepseek-chat
- fallbackModel: qwen-plus
- needsSanitize: false（DeepSeek 国产，但 outputSchema 必须 zod）
- inputSchema: `{ sourceText: string, sourceType: 'judgment'|'tender'|'policy', sourceUrl: string }`
- outputSchema: `z.object({ candidates: z.array(z.object({ title: z.string(), type: z.enum(['contract','tender','qual','regulation','price']), clauseRef: z.string().optional(), riskLevel: z.enum(['red','yellow','green']), suggestion: z.string(), reverseExample: z.string().optional(), confidence: z.number().min(0).max(1) })).max(20) })`
- fewShotExamples: 3 个（红/黄/绿各 1）
- systemPrompt: 建筑业资深律师 + 招标专家联合视角，红线禁绝对化（"必须/绝对"），用"建议关注/通常做法"
- safetyChecks: ['no_political', 'no_pii_leak', 'no_jailbreak']
- fallbackText: '抱歉本次抽取失败，请重试'

提交：

```bash
git add -A
git commit --no-verify -m "feat(m26): ai rule extraction with deepseek prompt and zod schema"
git push
```

---

### 步骤 4 · 子块 3 时效性 + 去重 + 自动 deprecate（commit 3）

**文件清单（≤ 4）**：

- `apps/api/src/modules/rule-extraction/timeliness.service.ts`（新建 ≤ 80 行）
- `apps/api/src/modules/rule-extraction/dedup.service.ts`（新建 ≤ 100 行，simhash + jaccard）
- `apps/api/src/modules/rule-extraction/auto-deprecate.service.ts`（新建 ≤ 80 行，cron 每周日 02:00）
- `apps/api/tests/rule-governance.spec.ts`（PBT 测试 timeliness 单调性）

**核心规则**（参照 M26 spec §2 子块 3 全部要求）：
- timeliness 公式硬约束：`base + 30/(ageInDays+1) + sourceAuthority*20 - similarRulesCount*5`
- dedup 阈值 ≥ 0.85（不许 0.5，verify 会 grep）
- auto-deprecate 必须软标 + audit log + 通知 admin（**SHALL NOT 物理删除**）
- 旧版规则保留可 revert

提交：

```bash
git add -A
git commit --no-verify -m "feat(m26): timeliness scoring + dedup + auto-deprecate governance"
git push
```

---

### 步骤 5 · 子块 4 admin 候选审核台升级（commit 4）

**文件清单（≤ 5）**：

- `apps/admin/src/app/(main)/admin/rules/candidates/page.tsx`（新建或改活，≤ 200 行）
- `apps/admin/src/app/(main)/admin/rules/candidates/[id]/page.tsx`（新建详情页，≤ 200 行）
- `apps/api/src/modules/admin/rule-candidates/rule-candidates.controller.ts`（新建，≤ 100 行）
- `apps/api/src/modules/admin/rule-candidates/rule-candidates.module.ts`（新建，≤ 20 行）
- `apps/admin/src/i18n/zh-CN.ts`（追加 ≥ 15 行 i18n key）

**强约束**：
- `'use client'` + useQuery 拉 API（不许 hardcode）
- 表格列：标题 / 来源链接 / 风险等级 / AI 信心度 / 时效分 / 操作
- 详情页左右双栏（原文 vs AI 抽取，react-hook-form + zod 可改）
- 5 操作按钮：通过 / 拒绝+原因 / 修改后通过 / 待复核 / 上报创始人
- 批量上限 50 条/次
- 所有写操作必须 audit log

提交：

```bash
git add -A
git commit --no-verify -m "feat(m26): admin rule candidates review console with batch ops"
git push
```

---

### 步骤 6 · 子块 5 verify-m26.ps1（commit 5）

新建 `scripts/verify-m26.ps1`，**12 条 PASS/FAIL**，按 `.kiro/state/M26-CRAWLER-AUTO-CURATION.md` §2 子块 5 所给的 12 条 grep / Test-Path / typecheck 完整复制。**全部 12/12 PASS** 才能 commit。

提交：

```bash
git add scripts/verify-m26.ps1
git commit --no-verify -m "test(m26): verify script 12 checks"
git push
```

---

### 步骤 7 · 合并到 main + 更新记忆

```bash
# 跑全套验证
powershell -ExecutionPolicy Bypass -File scripts/verify-m26.ps1
pnpm --config.engine-strict=false typecheck

# 12/12 PASS + typecheck 22/22 通过才合并
git checkout main
git pull origin main
git merge --no-ff feature/m26-crawler-auto-curation -m "merge: feature/m26-crawler-auto-curation into main

M26 全网爬虫 + AI 候选抽取 + 律师只审不录:
- base-fetcher 抽象框架 + robots.txt + 指数退避 + ingest_runs 审计
- 6 个真 fetcher（cebpubservice/wenshu/creditchina/mohurd/mof/ndrc）+ BullMQ cron
- AI rule-extract Prompt（DeepSeek 主 + Qwen 兜底）+ zod 校验
- 时效性打分 + simhash 去重 + 自动 deprecate（软标可 revert）
- admin 候选审核台 + 批量操作 + 审计日志
- verify-m26.ps1 12/12 PASS

ref: .kiro/state/M26-CRAWLER-AUTO-CURATION.md"

git push origin main
```

更新 `.kiro/state/PROJECT-MEMORY-2026-05-23.md` §1 加一行 "M26 完成 全网爬虫 + AI 抽取 + 候选审核台"，§4 标记业务底料策略已完成代码层（待 VPS 真跑）。

```bash
git add .kiro/state/PROJECT-MEMORY-2026-05-23.md
git commit --no-verify -m "docs(memory): mark M26 done"
git push origin main
```

最后 VPS 同步：

```powershell
ssh deploy@101.132.191.128 "cd /opt/tongqian && git pull origin main && docker compose -f infra/docker-compose.prod.yml ps 2>/dev/null | head -5"
```

如 ssh 失败跳过不阻塞。

---

## 2. 6 段交付（最后给万婷婷）

完成后**只**回这 6 段（不要其他废话，不要截图）：

```
1. main HEAD sha + 6 个 commit message（M26 子块 1-5 + merge + memory）
2. verify-m26.ps1 输出（必须 12/12 PASS）+ typecheck 22/22
3. 6 个 fetcher 行数 + 1 个 fetcher 真发 HTTP 关键代码片段（≤ 10 行）
4. AI 抽取 1 次 mock 判决书的输出 JSON（候选 ≥ 2 条 + traceId + 各 confidence 不同）
5. timeliness 公式 + dedup 阈值（≥ 0.85）+ auto-deprecate 触发条件 3 处代码片段
6. VPS 同步结果（git pull 输出或"SSH 失败，待人工跑"）
```

---

## 3. 反作弊清单（万婷婷验收，逐条核）

1. ✅ 6 commits（5 子块 + merge + memory，可 5+1+1=7 个）
2. ✅ verify-m26.ps1 12/12 PASS（不许 11/12）
3. ✅ 6 个 fetcher 必须真 fetch HTTP（grep 每个文件含 `fetch(` 或 `undici`）
4. ✅ base-fetcher abstract + dedup + ingest_runs 审计 + robots 检查 4 件齐
5. ✅ Prompt 必须 fewShotExamples ≥ 3 + outputSchema zod + fallbackText 不为空
6. ✅ rule_candidates 必须含 source_url + extract_trace_id（grep schema/migration）
7. ✅ dedup 阈值 ≥ 0.85（grep 不许出现 `0\.[0-7]`）
8. ✅ deprecate 不物理删除（grep 不许 `DELETE FROM rules` / `rule.delete`）
9. ✅ admin candidates 页 useQuery + 批量上限 ≤ 50
10. ✅ AI 抽取输出经 zod 校验且失败重试 ≤ 2 次
11. ✅ typecheck 22/22 cached pass
12. ✅ 不删除任何既有 mock job（保留兼容期，admin 一键切真）

---

## 4. 一句话总结给 Codex

> 节流模式 + 不开 dev server + 不截图 + 不真跑爬虫上量 + 7 步顺序 + 6 commits + verify 12/12 + 6 段文本交付。
> 跑完了，万婷婷开 admin 看候选审核台，律师只审不录，平台数据每天自动新陈代谢。VPS 上 cron 自动跑 6 个爬虫。
