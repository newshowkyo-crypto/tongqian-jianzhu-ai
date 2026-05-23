# M13 Stitch Integration Done

## Verify Output

```text
PASS [1] ui colors contain material token aliases
PASS [2] web light theme contains Stitch CSS variables
PASS [3] 5 page groups exist: dashboard, opportunities, H5 report, 4 logins, welcome
PASS [4] Stitch pages use tokens instead of raw design hex
PASS [5] Stitch pages do not use Material Symbols or Tailwind CDN
PASS [6] Stitch pages import at least 3 @tongqian/ui components
PASS [7] Stitch pages use lucide-backed icons via @tongqian/ui
PASS [8] opportunity AI buttons call apiClient.aiGateway.invoke
PASS [9] welcome page is public in middleware
PASS [10] 6 M13 screenshots are real, including comparison
PASS [11] visual-lint still PASS
PASS [12] verify-m5 through verify-m12 still PASS
PASS 12/12
```

## Screenshots

| Screenshot | Size |
|---|---:|
| tests/e2e/screenshots/m13/m13-dashboard-stitch.png | 2,683,102 |
| tests/e2e/screenshots/m13/m13-opportunities-stitch.png | 2,386,993 |
| tests/e2e/screenshots/m13/m13-h5-contract-review-stitch.png | 2,042,083 |
| tests/e2e/screenshots/m13/m13-login-web-stitch.png | 1,162,336 |
| tests/e2e/screenshots/m13/m13-welcome-marketing-stitch.png | 2,192,470 |
| tests/e2e/screenshots/m13/m13-side-by-side-comparison.png | 3,286,148 |

## DeepSeek Trace

```json
{
  "traceId": "6678fd08-7021-4cd8-8256-8c01a7feb3b4"
}
```

## Page Translation Summary

- Dashboard: translated Stitch workstation layout into tokenized React, preserved the M12 five-step recommended journey card, and kept owner dashboard data through `apiClient.dashboard.owner()`.
- Opportunity radar: replaced the generic module shell with KPI cards, controlled filters, a five-row table, side drawer, and real `apiClient.aiGateway.invoke` AI actions.
- H5 contract review report: rebuilt the mobile report using the joint-brand header, risk block, five key findings, confidence dots, and the shared AI report footer.
- Login pages: moved all four apps to the shared Stitch login shell while preserving `setPending`, persistent cookies, and `window.location.replace`.
- Welcome page: added the public marketing entry at `/welcome` with feature cards, sanitized demo cases, pricing, FAQ, and CTA sections.

## Seven-Point Self Check Evidence

- Raw Stitch design hex in translated page files: 0 matches for `#00479b`, `#1e5fbf`, `#d99880`, `#f9f9ff`, `#191b22`.
- Material Symbols and Tailwind CDN: 0 matches across dashboard, opportunities, H5 report, login pages, and welcome.
- UI imports: every translated page group imports at least three components from `@tongqian/ui` or uses `StitchLoginShell`, which centralizes the UI primitives.
- Icons: lucide-backed icons are imported through `@tongqian/ui`; no new `lucide-react` dependency was added to apps.
- Visual lint: `node scripts/visual-lint.mjs` passed during `verify-m13.ps1`.
- Font and spacing discipline: translated pages use existing text scale classes and tokenized spacing without raw Stitch CSS.
- Regression safety: `verify-m13.ps1` ran M5-M12 regressions and ended with `PASS [12] verify-m5 through verify-m12 still PASS`.

## Before And After Notes

- Stitch design drafts remain reference-only under `design/stitch/`; production pages use local tokens, shared UI primitives, and app data flows.
- The side-by-side comparison screenshot combines the Stitch reference and the real implementation for visual alignment evidence.
- M10 and M12 screenshot helpers were made compatible with the shared Stitch shell and the new M13 opportunity AI button while retaining real browser and screenshot checks.
