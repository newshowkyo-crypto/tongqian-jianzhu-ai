# 2026-06-11 Auth Registration/Login Credential Baseline

## Changed
- Added the first repository-backed auth account baseline for registration/login.
- `POST /api/v1/auth/register` now persists a `Tenant` + `User` through Prisma instead of returning only generated ids.
- `POST /api/v1/auth/login` now requires an existing active account and verifies password hash or explicit non-production SMS mock code before issuing tokens.
- Login response includes `tenantId`, `userId`, and `defaultDashboard` so the four portals can route after unified login.
- `@tongqian/api-client` now exposes `auth.register()` and `auth.login()` with typed request/response shapes.
- `apps/web` unified login page now calls the real auth API for login/register, persists `accessToken`, `tenantId`, `userId`, and routes by dashboard/role instead of writing dev-cookie tokens.

## Credential Boundary
- Password registration uses `bcryptjs` with cost 12 and stores hashes as `bcrypt:v1:{cost}:{hash}`.
- Non-production SMS mock accepts `000000` only when an account exists.
- Production login rejects the universal SMS mock code; real SMS/WeChat credentials must be connected before using those channels with customers.
- Platform admin registration remains closed to public signup; platform users must be created by a `PLATFORM_OWNER`/seed/admin workflow.

## Validation
- `pnpm --config.engine-strict=false --filter @tongqian/api test` passed: 80/80.
- `pnpm --config.engine-strict=false --filter @tongqian/api lint` passed.
- `pnpm --config.engine-strict=false --filter @tongqian/api typecheck` passed.
- `pnpm --config.engine-strict=false --filter @tongqian/api-client test` passed: 6/6.
- `pnpm --config.engine-strict=false --filter @tongqian/web lint` passed.
- `pnpm --config.engine-strict=false --filter @tongqian/web typecheck` passed.
- `pnpm --config.engine-strict=false --filter @tongqian/web build` passed: 94/94 pages generated.
- `pnpm --config.engine-strict=false lint` passed: 16/16.
- `pnpm --config.engine-strict=false typecheck` passed: 22/22.
- `pnpm --config.engine-strict=false test` passed: 22/22 workspace tasks.
- `pnpm --config.engine-strict=false --filter @tongqian/prisma exec prisma validate` passed.

## Follow-Up
- Connect Aliyun SMS and WeChat login providers through explicit credential admin configuration.
- Replace in-memory `JwtTokenService` refresh-token storage with the DB-backed refresh token table before large public traffic.
- Seed or create the first production `PLATFORM_OWNER` account with a bcrypt hash before disabling all dev cookie fallbacks.
