# QA Strategy

- Unit Tests: `useDailyStore` actions (submitGuess, completeMode), i18n helpers (`tFmt`), timers (timeUntilNext).
- Integration Tests: daily init (Supabase fetch → state), Join Us submit (valid/invalid/rate-limited), mode switching and history.
- E2E Tests: happy paths for each mode; accessibility/RTL checks; reduced-motion verification; mobile viewport.
- Performance: Lighthouse CI thresholds (LCP/CLS/TTI), bundle-size budgets per route.
- Regression: Track defects from `Issues & Bugs.md`; add tests before fixes where feasible.
- Environments: Local (Vite), Preview (Netlify), Production.

Artifacts: test plan per release; coverage reports; accessibility audit notes.
