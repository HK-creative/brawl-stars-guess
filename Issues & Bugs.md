# Issues & Bugs

This document lists discovered issues with enough detail to locate, reproduce, and fix them later. All references use repo-relative paths.

- __[i18n key mismatches: daily page title]__
  - Location: `src/pages/DailyModesPage.tsx`, function `DailyModesPage()` → uses `usePageTitle(`${t(`mode.${currentMode}`)} | ${t('daily.challenge')}`)`.
  - Evidence: `src/lib/i18n.ts` has no `"daily.challenge"` key. It also defines mode titles as `"mode.<mode>.title"` (e.g., `"mode.starpower.title"`, `"mode.audio.title"`), but no keys like `"mode.classic"`.
  - Repro: Open `/daily?mode=classic`; the title translation will fall back to the raw key/log a warning.
  - Likely root cause: Mismatch between code’s key pattern and i18n catalog.
  - Proposed fix options:
    1) Change code to `t(`mode.${currentMode}.title`)` and use an existing key for daily label, e.g. `t('label.daily_challenge')`.
    2) Or add missing keys to `src/lib/i18n.ts`: `mode.classic`, `mode.gadget`, `mode.starpower`, `mode.audio`, `mode.pixels`, and `daily.challenge`.
  - Acceptance: No console warnings; title renders localized correctly for EN/HE.

- __[Daily completion excludes Pixels mode]__
  - Location: `src/stores/useDailyStore.ts`.
  - Details:
    - `areAllModesCompleted()` checks only `classic`, `gadget`, `starpower`, `audio`.
    - `getCompletionProgress()` calculates `completed` from the same 4 modes and returns `{ total: 4 }`.
    - State includes `pixels`, and `/daily` renders 5 modes including `pixels`.
  - Impact: Progress/completion UI or logic may be inconsistent with 5-mode UX.
  - Decision required: Should Pixels count toward daily completion? If yes, include it and set `total: 5`.
  - Fix: Update both functions to include `pixels`; adjust any UI depending on `total`.
  - Acceptance: Progress/completion reflects all rendered modes consistently.

- __[Duplicate history entries on daily mode change]__
  - Location: `src/pages/DailyModesPage.tsx`, `handleModeChange()`.
  - Details: Calls both `setSearchParams({ mode })` (which pushes a history entry) and `window.history.pushState(...)`, likely causing duplicate history entries.
  - Repro: Switch modes multiple times, then press browser back; you may observe more steps than expected.
  - Fix options:
    - Use only `setSearchParams({ mode })`.
    - Or use `setSearchParams({ mode }, { replace: true })` for replacement semantics (no extra entries).
  - Acceptance: Back/forward navigation steps match mode switches as designed.

- __[Animations disabled for daily mode transitions]__
  - Location: `src/pages/DailyModesPage.tsx`, JSX uses `<DailyModeTransitionOrchestrator ... disabled>`.
  - Impact: Transition orchestrator supports RTL-aware slide and reduced-motion, but `disabled` bypasses animations.
  - Decision required: If transitions are desired, remove `disabled` (or make it conditional on user prefs).
  - Acceptance: Mode switches animate (except when `prefers-reduced-motion`), with RTL-aware direction.

- __[i18n interpolation not implemented]__
  - Location: `src/lib/i18n.ts`, function `t(key: string): string`.
  - Details: Catalog contains strings with placeholders like `{brawler}` or `{count}`, but `t()` returns literal strings and doesn’t interpolate.
  - Impact: UIs expecting dynamic values won’t substitute.
  - Fix: Add a `tFmt(key, params)` helper or enhance `t()` to perform simple token replacement (e.g., `/\{(\w+)\}/g`). Update call sites accordingly.
  - Acceptance: Strings with placeholders render with substituted values and are covered by minimal tests.

- __[Supabase anon key embedded in client bundle]__
  - Location: `src/integrations/supabase/client.ts`.
  - Details: Uses the public anon key inline (normal for client apps). Ensure no service-role keys or privileged secrets are included in client.
  - Hardening: Move publishable key to environment variables (`import.meta.env`) and configure in Netlify. Confirm RLS policies protect data.
  - Acceptance: Build uses env vars; security review confirms no secret leakage.

- __[Pixels challenge default fallback value]__
  - Location: `src/stores/useDailyStore.ts`, within `initializeDailyModes`: sets `pixels.brawlerName = pixelsData?.brawler || 'Spike'`.
  - Impact: UX may show a real brawler name when content is absent/in error. Other modes may not use similar fallbacks.
  - Fix options:
    - Use a neutral placeholder and show an error/empty-state UI.
    - Align all modes to a consistent empty-state strategy.
  - Acceptance: Missing-content flows are consistent and localizable.

- __[Naming consistency for daily label]__
  - Finding: `src/lib/i18n.ts` contains `"label.daily_challenge"` which likely corresponds to the daily title/label.
  - Recommendation: Standardize usage across app to either `label.daily_challenge` or a new `daily.challenge` key; avoid duplicates.

- __[Progress text vs. internal total discrepancy]__
  - Context: If UI displays progress like “X of Y modes complete”, ensure `Y` matches rendered modes (4 vs 5). This ties to the Pixels inclusion decision above.
  - Action: Audit UI strings/components relying on `getCompletionProgress()` to prevent mismatched totals.

References for triage:
- `src/pages/DailyModesPage.tsx` (mode parsing, history updates, transition orchestrator usage)
- `src/stores/useDailyStore.ts` (completion/progress logic, daily initialization defaults)
- `src/lib/i18n.ts` (catalog, interpolation capability, key existence)
- `src/integrations/supabase/client.ts` (client initialization, anon key)
