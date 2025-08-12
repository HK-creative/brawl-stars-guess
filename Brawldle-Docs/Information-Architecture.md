# Information Architecture

- Entry points: `/` (Index), `/daily` (hub), legacy `/daily/*` (compat/redirect), `/join-us`, `/tier-list`, `/survival`.
- Navigation: Daily header/controls switch modes; query param `?mode=` reflects state; back/forward coherent.
- Localization: Hebrew default; `document.dir = 'rtl'`; potential language toggle.
- Assets: preloaded images and audio for dailies; lazy-loaded routes reduce TTI.

Evidence: `src/App.tsx`, `src/pages/DailyModesPage.tsx`, `src/lib/i18n.ts`. 
