# M3 Visual Self Check

Date: 2026-05-18

## Scope

- Design assets generated under `packages/ui/src/assets`, `apps/api/src/report-templates/covers`, `docs/marketing/assets`, and `apps/web/src/assets/ai-assistant`.
- Component library expanded beyond 50 exports in `packages/ui`.
- Owner, steward, government, admin, H5, and WeChat entry pages added.
- Habit animation system added with feedback exits.

## Checklist

| # | Item | Result |
|---|---|---|
| 1 | Colors come from token families | Pass |
| 2 | Typography stays within platform scale | Pass |
| 3 | Spacing uses 4px multiples | Pass |
| 4 | Card radius stays restrained | Pass |
| 5 | Primary action hover states exist | Pass |
| 6 | Risk colors use green/yellow/red semantics | Pass |
| 7 | LV1-LV5 badge assets exist | Pass |
| 8 | Empty states exist on module templates | Pass |
| 9 | Loading states exist on module templates | Pass |
| 10 | Error states exist on module templates | Pass |
| 11 | H5 report includes disclaimer | Pass |
| 12 | H5 report includes Tier badge | Pass |
| 13 | H5 report includes AI confidence | Pass |
| 14 | H5 report includes role-cropped buttons | Pass |
| 15 | Mobile touch targets are at least 44px | Pass |
| 16 | Admin pages expose permission toggles | Pass |
| 17 | Government pages use more formal visual density | Pass |
| 18 | Steward pages include service and reputation workflows | Pass |
| 19 | Habit animations include feedback channel | Pass |
| 20 | AI assistant bubble has 2s pulse animation | Pass |
| 21 | WeChat menu has 3 entry configuration | Pass |
| 22 | No consumer/ecommerce visual pattern introduced | Pass |

## Notes

- Chinese copy is centralized in route copy maps or existing i18n modules; a later polish pass can move all newly added copy into each app's `i18n/zh-CN.ts`.
- Visual assets are deterministic SVG/PNG files rather than raster AI generations so logos, badges, and report covers remain reproducible and versionable.
- Next local dependency cache was refreshed with `pnpm install --force --frozen-lockfile`; no dependency file changes were committed for that cache repair.

