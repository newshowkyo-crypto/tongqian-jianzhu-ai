# MILESTONE M3.10 AI Assistant Done

Date: 2026-05-20

## Scope

- AI Gateway now exposes frontend-callable HTTP endpoints.
- Chat Hub has a web page at `/chat-hub`.
- Web, admin, agent, and gov shells all include a real floating AI assistant widget.
- The shared API client has typed AI and Chat Hub methods with mock fallback.

## Key Files

- `apps/api/src/ai-gateway/ai-gateway.controller.ts`
- `apps/api/src/ai-gateway/ai-gateway.module.ts`
- `apps/api/src/main.ts`
- `packages/api-client/src/index.ts`
- `packages/ui/src/domain/ai-assistant-widget.tsx`
- `packages/ui/src/domain/index.tsx`
- `packages/ui/src/index.ts`
- `apps/web/src/app/chat-hub/page.tsx`
- `apps/web/src/app-shell.tsx`
- `apps/admin/src/app-shell.tsx`
- `apps/agent/src/app-shell.tsx`
- `apps/gov/src/app-shell.tsx`

## Verification

- API, API client, UI, web, admin, agent, and gov typecheck passed.
- API, API client, UI, web, admin, agent, and gov lint passed.
- Build passed for `@tongqian/api`, `@tongqian/web`, `@tongqian/admin`, `@tongqian/agent`, and `@tongqian/gov`.

由 Codex 自动生成 + 创始人审核。
