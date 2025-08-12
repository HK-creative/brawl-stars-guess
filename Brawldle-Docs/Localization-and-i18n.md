# Localization & i18n

- Default: Hebrew (RTL); `document.documentElement.dir = 'rtl'`.
- Catalog: key-value translations in `src/lib/i18n.ts`.
- Gaps:
  - Missing keys used by `/daily` page title (see Issues & Bugs.md).
  - No interpolation for placeholders like `{brawler}`.
- Plan:
  - Introduce `tFmt(key, params)` for token replacement.
  - Align keys (`mode.<mode>.title`, `label.daily_challenge`) and add tests.
  - Expand EN coverage; consider language toggle.

Evidence: `src/lib/i18n.ts`, `src/pages/DailyModesPage.tsx`. 
