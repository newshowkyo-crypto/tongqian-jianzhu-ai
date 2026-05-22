# M7 FULL ALIGNMENT DONE

Branch: `feature/m7-full-alignment`

## verify-m7.ps1

```text
PASS [1] typecheck, lint, test targeted M7 packages
PASS [2] credentials page has no forbidden English visible labels
PASS [3] ingest pages have no forbidden English visible labels
PASS [4] Playwright visits M7 pages and captures screenshots
PASS [5] 4 frontend assistants do not leak prompt templates
PASS [6] 4 apps have CyberError and CyberLoading boundaries
PASS [7] admin home has no duplicated navigation tabs
PASS [8] legacy console label grep hits = 0
PASS [9] AiReportFooter exists with 4 audience types
PASS [10] 4 role action key groups exist in i18n
PASS [11] AGENT_PARTNER exists in types, i18n, and seed
PASS [12] deposit status and UI deposit guarantee hits are zero
PASS [13] red-line phrase constants are enforced by PromptBuilder
PASS [14] 8 M7 screenshots each >= 200KB and IDAT >= 5
PASS 14/14
```

## verify-m6.ps1

```text
PASS [1] pnpm typecheck targeted packages
PASS [2] pnpm lint targeted packages
PASS [3] pnpm test targeted packages
PASS [4] packages/ui/src/cyber/*.tsx >= 12
PASS [5] 4 apps import @tongqian/ui/cyber
PASS [6] 4 app navConfig total >= 43
PASS [7] RolePermission admin:ingest:run grants PLATFORM_OWNER
PASS [8] admin-ingest-rbac.spec.ts exists with OWNER 403 / PLATFORM_OWNER 200 assertions
PASS [9] /admin/credentials page exists
PASS [10] /admin/credentials rows >= 20
PASS [11] credentials controller exposes >= 6 endpoints
PASS [12] /admin observability/jobs/ai-monitor/notifications/health pages exist
PASS [13] demo seed row counts meet M6 thresholds
PASS [14] 20 jobs have audit_logs or ingest_runs records
PASS [15] secrets table >= 20 encrypted rows
PASS [16] root has no BLOCKED.md
PASS [17] verify-m5 remains 12/12 PASS
PASS [18] m6 screenshots >= 12, each >= 200KB and IDAT >= 5 (real Playwright capture)
PASS 18/18
```

## verify-m5.ps1

```text
PASS: B-1 prisma schema has 8 M5 model groups
PASS: B-1 migration SQL creates ingest tables
PASS: B-1 seed writes all table samples
PASS: B-1 database counts >= 1 for all 8 tables
PASS: B-2 10 collectors are mapped to tables
PASS: B-2 ingest_runs audit has >= 10 collector rows
PASS: C-1 admin ingest controller exposes 6 endpoints
PASS: C-1 admin module wires IngestAdminController
PASS: C-2 api-client has real ingest methods
PASS: C-2 8 admin ingest pages exist under (main)
PASS: A nav items >= 43 and ingest entries present
PASS: D screenshots exist and each >= 50KB
SUMMARY: PASS=12 FAIL=0
```

## M7 Screenshots

```text
m7-admin-home-no-duplicate-tabs.png 6837452 bytes IDAT=1666
m7-agent-partner-subtype.png 7595344 bytes IDAT=1850
m7-ai-orb-no-template-leak.png 6841235 bytes IDAT=1667
m7-credentials-zh.png 10118083 bytes IDAT=2465
m7-ingest-tianyancha-zh.png 8192796 bytes IDAT=1996
m7-prompts-no-crash.png 9766790 bytes IDAT=2379
m7-rules-no-crash.png 9538405 bytes IDAT=2323
m7-web-report-5-actions.png 8634891 bytes IDAT=2103
```

## V4 Evidence

- Red-line constants: `packages/constants/src/red-line-phrases.ts`
- Value-density checklist: `packages/constants/src/value-density-check.ts`
- Prompt enforcement: `apps/api/src/ai-gateway/prompt-builder.service.ts` imports `RED_LINE_PHRASES` and throws `AI.PROMPT.RED_LINE_VIOLATION`
- Shared report footer: `packages/ui/src/report/AiReportFooter.tsx`

## Role Action Evidence

```text
apps/agent/src/i18n/zh-CN.ts: agentActions
apps/gov/src/i18n/zh-CN.ts: govActions
apps/web/src/i18n/zh-CN.ts: ownerActions, employeeActions
apps/admin/src/i18n/zh-CN.ts: ownerActions
```

## AGENT_PARTNER Seed Count

```sql
SELECT COUNT(*) FROM agent_profiles WHERE subtype='AGENT_PARTNER';
-- 1
```

## Deposit Cleanup Evidence

```text
scripts/verify-m7.ps1 [12] PASS: deposit status and UI deposit guarantee hits are zero
```
