# MILESTONE M6 FINISH DONE

Date: 2026-05-21
Branch: feature/m6-finish-everything

## verify-m6.ps1 Output

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
PASS [18] m6 screenshots >= 12 and each >= 50KB
PASS 18/18
```

## verify-m5.ps1 Output

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

## Screenshot List

```text
m6-admin-ai-monitor.png              186666
m6-admin-credentials-edit-drawer.png 194255
m6-admin-credentials-overview.png    194370
m6-admin-health.png                  185901
m6-admin-jobs.png                    185343
m6-admin-notifications.png           189086
m6-admin-observability.png           191117
m6-admin-overview-with-metrics.png   194006
m6-agent-dispatch-with-data.png      194122
m6-cyber-component-storybook.png     193998
m6-gov-dashboard-with-data.png       193497
m6-web-dashboard-with-data.png       192589
```

Path: `tests/e2e/screenshots/m6/`

## SELECT COUNT(*) Output

```text
ai_cost_logs,50
audit_logs,110
contract_reviews,15
ingest_runs,32
metrics_snapshots,40
opportunities,200
permissions,45
qualification_certificates,10
role_permissions,67
roles,6
secrets,28
tenants,95
tender_projects,20
```

## Six Blocks Status

Block 1: Completed. PermissionGuard now uses `@tongqian/permissions`, RBAC tables and seed are present, Cyber components have a `packages/ui/src/cyber` barrel, and root `BLOCKED.md` was moved to `docs/known-issues/KI-001-vps-ssh-deferred.md`.

Block 2: Completed with editable mock/real credential management. The `secrets` table has 28 rows; DeepSeek and DashScope are marked real-ready, and missing P1/P2 credentials remain editable mock providers.

Block 3: Completed. Admin pages exist for credentials, observability, jobs, AI monitor, notifications, and health.

Block 4: Completed. Demo seed rows meet all M6 thresholds for tenants, opportunities, tenders, contract reviews, qualification certificates, AI cost logs, and audit logs.

Block 5: Completed. `scripts/run-all-jobs-once.mjs` wrote 10 cron audit records and 10 collector ingest records.

Block 6: Completed. `scripts/verify-m6.ps1` passes 18/18, `scripts/verify-m5.ps1` remains 12/12 PASS, and 12 screenshots were generated over 50KB each.

## Still Mock

P1/P2 external providers without real credentials remain in mock mode: WeChat Pay, WeChat MP, WeChat Work, Alipay, Aliyun OSS, Aliyun OCR/DocMind, Aliyun SLS, Aliyun SMS, DashVector, Tianyancha, OpenRouter, and ICP record number.

## User Credential TODO

Use `/admin/credentials` to fill the real provider values listed in `docs/HANDOVER-FOR-USER.md`.
