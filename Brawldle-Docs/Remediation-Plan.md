# Remediation Plan — Priority Defects and Enhancements

This plan prioritizes actionable items from the issues log, with proposed fixes, effort estimates, risks, and tests.

## 1) i18n key mismatches (daily titles)
- Scope: Align `/daily` title keys with catalog.
- Options:
  - A) Update code to `mode.<mode>.title` + use `label.daily_challenge`.
  - B) Add missing keys: `mode.classic`, `mode.gadget`, `mode.starpower`, `mode.audio`, `mode.pixels`, `daily.challenge`.
- Recommendation: A (uses existing `.title` convention; avoids key drift).
- Effort: S (0.5 day).
- Risks: None; verify coverage for EN/HE.
- Tests: unit for translator behavior; integration to assert page title string.

## 2) Completion logic excludes Pixels
- Scope: Include `pixels` in `areAllModesCompleted()` and `getCompletionProgress()`; set total to 5; update any UI copy/progress that assumed 4.
- Decision: Pixels count toward completion; total = 5.
- Effort: S (0.5 day).
- Risks: UI text or progress bars assuming hardcoded 4.
- Tests: unit for 5-mode progress totals; integration for complete-all behavior.

## 3) Duplicate history entries on mode change
- Scope: Use single navigation primitive.
- Fix: Remove `pushState` and keep `setSearchParams`, or use `replace: true` when needed.
- Effort: XS (0.25 day).
- Risks: None; verify back/forward.
- Tests: integration to simulate mode switches and back navigation.

## 4) Transition orchestrator disabled
- Scope: Re-enable animations unless reduced-motion.
- Fix: Remove `disabled` or make it controlled by user preference.
- Effort: XS (0.25 day).
- Risks: Motion sensitivity; ensure `prefers-reduced-motion` respected.
- Tests: visual check + integration flag for reduced-motion.

## 5) i18n interpolation support
- Scope: Add `tFmt(key, params)` token replacement.
- Fix: Implement simple `{token}` replacement; do not break `t()`.
- Effort: S (0.5–1 day).
- Risks: Edge cases in nested tokens.
- Tests: unit for tokens; fallback behavior.

## 6) Supabase key hardening
- Scope: Use env vars for anon key; verify RLS.
- Fix: Read from `import.meta.env`, configure on Netlify; run advisors policy review.
- Effort: S (0.5–1 day).
- Risks: Misconfigured envs break API.
- Tests: preview build check; 200 OK from health.

## 7) Pixels fallback policy
- Scope: Replace `'Spike'` with neutral placeholder and empty-state UX.
- Effort: XS–S (0.25–0.5 day).
- Risks: None.
- Tests: integration for missing-content handling.

## Sequencing (1 sprint)
1. (3) History cleanup
2. (1) i18n title alignment
3. (2) Completion consistency
4. (4) Transitions enablement
5. (5) Interpolation support
6. (7) Pixels empty-state
7. (6) Supabase hardening

## Acceptance
- No console i18n warnings; correct localized titles.
- Progress totals consistent with rendered modes.
- Back/forward steps match user expectations.
- Animations on (unless reduced-motion).
- Interpolated strings render correctly.
- Netlify env setup with anon key; RLS verified.
- Missing-content flows localized and consistent.
