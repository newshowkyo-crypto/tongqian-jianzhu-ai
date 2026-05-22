# M12 Product Usable Done

## Verification

```text
PASS [1] 4 app globals.css contain light/dark CSS variables
PASS [2] 4 layouts set default data-theme correctly
PASS [3] module-page calls apiClient.aiGateway.invoke without dispatchEvent
PASS [4] api-client exposes aiGateway.invoke
PASS [5] module-page has running/result state
PASS [6] web navigation is grouped into at least 4 journey groups
PASS [7] dashboard contains 5-step recommended journey card
PASS [8] 4 apps have friendly not-found.tsx
PASS [9] 4 dev apps have console.error count = 0
PASS [10] 6 screenshots are real and DeepSeek traceId exists
PASS [11] visual-lint and verify-m5 through verify-m11 still PASS
PASS 11/11
```

## DeepSeek Trace

```json
{
  "traceId": "23d1ec67-9c06-4296-a656-98807b17cbb5",
  "providerUsed": "deepseek_direct",
  "modelUsed": "deepseek-reasoner"
}
```

## Screenshots

| File | Size |
| --- | ---: |
| tests/e2e/screenshots/m12/m12-404-friendly.png | 2248832 |
| tests/e2e/screenshots/m12/m12-ai-action-button-deepseek.png | 2244178 |
| tests/e2e/screenshots/m12/m12-dashboard-journey-card.png | 3075752 |
| tests/e2e/screenshots/m12/m12-light-theme-dashboard.png | 3147728 |
| tests/e2e/screenshots/m12/m12-light-theme-opportunities.png | 3279740 |
| tests/e2e/screenshots/m12/m12-nav-grouped-by-journey.png | 2966205 |

## Summary

- Added light/dark theme token plumbing across web, admin, agent, and gov.
- Replaced empty AI action events with real `apiClient.aiGateway.invoke` calls and visible DeepSeek trace output.
- Grouped web navigation by user journey and added a 5-step dashboard journey card.
- Added friendly 404 pages for all four apps.
- Kept M5 through M11 verification green through `scripts/verify-m12.ps1`.
