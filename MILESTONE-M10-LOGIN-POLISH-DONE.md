# M10 Login Polish Done

## verify-m10.ps1

```text
PASS [1] 4 login pages use window.location.replace and no router.push
PASS [2] 4 login pages set pending and persistent cookies
PASS [3] 4 middleware files include dev auto-cookie branch
PASS [4] 4 login pages use cyber tokens and no old neutral shell
PASS [5] 3 M10 screenshots and 4 homepages pass dev direct dashboard check
PASS [6] visual-lint still PASS
PASS [7] verify-m5 through verify-m9 still PASS
PASS 7/7
```

## Screenshots

```text
m10-admin-login-styled.png           size=1106896 idat=271
m10-web-dev-direct-dashboard.png     size=9256533 idat=2255
m10-agent-login-button-clickable.png size=8476382 idat=2065
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

## verify-m8.ps1

```text
PASS [1] typecheck, lint, test 9 M8 packages
PASS [2] rule-curation module exists with 8 endpoints
PASS [3] knowledge-curation module exists with 6 endpoints
PASS [4] prompt-testing-curation module exists with 6 endpoints
PASS [5] 6 admin rules pages exist
PASS [6] 8 admin knowledge pages exist
PASS [7] golden-tests routes exist
PASS [8] risk, qualification, tender services call RulesService.match*
PASS [9] PromptBuilder accepts matchedRules and knowledgeRefs context
PASS [10] Prisma has RuleVersion.gray_percent and prompt_quality_reports
PASS [11] data collection 7 sources connect to rule candidate pool
PASS [12] no Coming Soon or TODO implement in M8 modules
PASS [13] 6 M8 screenshots each >= 200KB and IDAT >= 5
PASS [14] verify-m5, verify-m6, verify-m7 still all PASS
PASS 14/14
```

## verify-m9.ps1

```text
PASS [1] typecheck, lint, test 9 M9 packages
PASS [2] visual-lint R1-R8
PASS [3] colors token has navy, silver, rose, cyber
PASS [4] accent.500 is rose gold #d99880 and old #d4953a is absent
PASS [5] 5 admin readable pages have no direct text-white
PASS [6] admin data-center pages have no M7 English leftovers
PASS [7] M9 codemods exist and replacement count >= 50
PASS [8] 6 M9 screenshots each >= 200KB and IDAT >= 5
PASS [9] axe-core color-contrast audit has no violations on 5+ M9 pages
PASS [10] verify-m5, verify-m6, verify-m7, verify-m8 still all PASS
PASS 10/10
```
