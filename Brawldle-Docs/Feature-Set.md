# Feature Set — Past, Current, Future

## Past / Shipped
- Unified `/daily` page with conditional rendering; legacy route compatibility (`src/App.tsx`, `src/pages/DailyModesPage.tsx`).
- State centralization + persistence (`src/stores/useDailyStore.ts`).
- Motion system v1 (`src/components/layout/DailyModeTransitionOrchestrator.tsx`), respects RTL/reduced-motion.
- Join Us MVP with validation, anti-spam, Supabase insert (`src/pages/JoinUsPage.tsx`).
- Hebrew-first i18n scaffolding (`src/lib/i18n.ts`).

## Current
- 5 daily modes: classic, gadget, star power, audio, pixels (`src/pages/DailyModesPage.tsx`).
- Supabase tables: `daily_challenges`, `join_applications`, `profiles` (`src/integrations/supabase/types.ts`).

## Future
- Tier List MVP (`TIER-LIST-PLAN.md`).
- Survival mode polish; analytics baseline.
- i18n interpolation + key alignment; translation coverage.
- Sharing, streaks UX, notifications (opt-in), A/B testing.
