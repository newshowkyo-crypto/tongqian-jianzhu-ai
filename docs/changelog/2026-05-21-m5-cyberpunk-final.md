# M5 Cyberpunk Final Shell

Date: 2026-05-21

## Completed

- Added shared `CyberShell` in `packages/ui/src/layout/page.tsx` and exported it from `@tongqian/ui`.
- Replaced duplicated shell markup in `apps/web`, `apps/agent`, `apps/gov`, and `apps/admin` with the shared shell.
- Added explicit `navigationItems` configuration in each app shell for grep/audit visibility.
- Added real topbar click state for tenant, notifications, theme mode, and avatar panels.
- Preserved existing `Command` search and role-specific `AiAssistantBubble` wiring.
- Captured real local screenshots under `tests/e2e/screenshots/m5-cyberpunk/`.

## Screenshot Evidence

- `tests/e2e/screenshots/m5-cyberpunk/web-dashboard.png`
- `tests/e2e/screenshots/m5-cyberpunk/admin-console.png`
- `tests/e2e/screenshots/m5-cyberpunk/agent-workspace.png`
- `tests/e2e/screenshots/m5-cyberpunk/gov-workspace.png`

## Verification

- `pnpm --config.engine-strict=false --filter @tongqian/ui typecheck`
- `pnpm --config.engine-strict=false --filter @tongqian/web typecheck`
- `pnpm --config.engine-strict=false --filter @tongqian/agent typecheck`
- `pnpm --config.engine-strict=false --filter @tongqian/gov typecheck`
- `pnpm --config.engine-strict=false --filter @tongqian/admin typecheck`
- Playwright opened `127.0.0.1:3000-3003`, injected dev auth cookies, verified `.tq-cyber-shell`, topbar buttons, and `data-navigation-config="CyberShell"` links before saving screenshots.

Note: local Node is `v25.2.1` while the repo engine expects `>=22 <23`, so verification used `--config.engine-strict=false` without changing repo config.
