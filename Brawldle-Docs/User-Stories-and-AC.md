# User Stories & Acceptance Criteria

## Daily Player
- Mode selection and start within 2 taps on `/daily`. AC: mode via `?mode=...` renders content.
- Localized titles/labels; time until next daily. AC: keys exist in `src/lib/i18n.ts`; RTL layout and motion.
- Guesses persist; duplicate guesses ignored. AC: dedupe + persistence in `src/stores/useDailyStore.ts`.
- Completion tracked and clear; progress totals consistent. AC: `getCompletionProgress()` aligns with rendered modes.
 - AC: Totals reflect 5 modes (classic, gadget, starpower, audio, pixels).

## Join Us Applicant
- Submit role-tagged application with validation and feedback. AC: success/error toasts; insert row to `join_applications`.

## Accessibility & Performance
- Reduced-motion support. AC: orchestrator respects `prefers-reduced-motion`.
- Fast load with code-splitting/preloads. AC: LCP budget met.
