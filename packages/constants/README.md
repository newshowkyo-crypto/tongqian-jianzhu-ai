# @tongqian/constants

Shared constants for pricing, credits, limits, feature flags, tiers, and platform-level business rules.

## Responsibilities

- Provide one shared source of business constants for API, worker, frontend, and admin apps.
- Avoid duplicated prices, thresholds, states, and string literals in business modules.
- Keep commercial defaults aligned with ADRs, specs, and `docs/business-model.md`.

## Commands

```powershell
pnpm --filter @tongqian/constants typecheck
pnpm --filter @tongqian/constants lint
pnpm --filter @tongqian/constants build
```

## Override Boundary

System-config overridable: subscription plans, discount ladders, credit pricing, commission rates, dispatch thresholds, dispatch rates, referral fees, premium services, reputation rules, reputation levels, dispatch weights, takeover triggers, red lines, and tier thresholds.

Code-only constants: rate limits, AI rate limits, cache TTLs, currency display, refund policy, refund tiers, reactivation window, agent activity thresholds, agent referral bonus, fission rates, check-in rewards, lottery schedule, urgency limits, and cost floor.
