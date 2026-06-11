# 2026-06-11 Production AI Provider Credential Gate

## Fixed

- Production AI provider routing no longer treats local mock providers as healthy when real DashScope or DeepSeek credentials are missing.
- Placeholder values such as `PLACEHOLDER_REPLACE_VIA_ADMIN_PANEL` and `sk-xxx` are treated as missing credentials for both DashScope and DeepSeek.
- Deprecated `midlayer` remains unavailable in production failover, so live AI calls either use real domestic providers or fail clearly with `AI.GATEWAY.UNAVAILABLE`.

## Verification

- Added `provider-router.service.spec.ts` to the `@tongqian/api` stable test subset.
- Verified production missing-key, placeholder-key, and development offline-mock behavior.
