# M9 PIXEL POLISH DONE

Branch: `feature/m9-pixel-polish`

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

## visual-lint.mjs

```text
PASS visual-lint R1-R8: no violations
```

Rules covered:

```text
R1 hardcode hex utility classes
R2 oversized typography
R3 odd spacing
R4 oversized radius
R5 oversized shadow
R6 data-center English leftovers
R7 functional emoji
R8 inline color/background style
```

## Codemod Stats

```text
m9-color-codemod replacements=110 files=24
m9-typography-codemod replacements=181 files=49
total replacements=291
```

## Screenshots

```text
m9-admin-ai-monitor-readable.png     size=8246592   IDAT=2009
m9-admin-data-center-zh.png          size=8265604   IDAT=2014
m9-admin-health-readable.png         size=8241763   IDAT=2008
m9-admin-jobs-readable.png           size=8236689   IDAT=2007
m9-admin-notifications-readable.png  size=8238498   IDAT=2007
m9-web-dashboard-tokenized.png       size=10236226  IDAT=2493
```

## Regression

```text
verify-m5.ps1: SUMMARY: PASS=12 FAIL=0
verify-m6.ps1: PASS 18/18
verify-m7.ps1: PASS 14/14
verify-m8.ps1: PASS 14/14
```

## Axe-Core Contrast

`tests/e2e/screenshots/m9` capture uses `axe-core` with `color-contrast` rule on:

```text
/admin/notifications
/admin/jobs
/admin/health
/admin/ai-monitor
/admin/data-center/dashboard
/dashboard
```

Result: zero color-contrast violations.
