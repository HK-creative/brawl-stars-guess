# Brawldle — PRD & Product Portfolio Outline

This outline structures the comprehensive PRD and portfolio document for Brawldle. It references current plans and code to ground details and ease future expansion.

- Related plans in repo:
  - `DAILY-MODES-MOTION-PLAN.md`
  - `daily-modes-single-page-migration-plan.md`
  - `TIER-LIST-PLAN.md`
- Evidence map (code cited throughout):
  - Routing: `src/App.tsx`
  - Daily container: `src/pages/DailyModesPage.tsx`
  - Motion orchestrator: `src/components/layout/DailyModeTransitionOrchestrator.tsx`
  - State: `src/stores/useDailyStore.ts`
  - i18n: `src/lib/i18n.ts`
  - Supabase: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`
  - Join Us: `src/pages/JoinUsPage.tsx`

---

## 1. Document Purpose & Audiences
- __[purpose]__ Define product scope, experience, and system to guide build, QA, and portfolio presentation.
- __[audiences]__ PM portfolio reviewers, devs, designers, community, and contributors.

## 2. Product Overview
- __[one-liner]__ “Daily Brawl Stars guessing challenges with rich motion, Hebrew-first experience, and community growth.”
- __[problem]__ Players want fresh, bite-sized challenges around Brawl Stars IP, localized and mobile-first.
- __[solution]__ Unified daily challenge hub, multiple modes, accessible UX, typed backend, and social hooks.
- __[positioning]__ Casual daily puzzle; inspiration: Wordle-like dailies; unique: multi-mode + motion polish + RTL.

## 3. Vision, Goals, Non-Goals
- __[vision]__ Be the most delightful, localized, and fair daily Brawl puzzle, built for longevity.
- __[goals]__
  - High day-1 delight via motion, polish, and quick time-to-first-guess.
  - Sticky daily loop with streaks and varied modes.
  - Community growth via Join Us funnel and social sharing.
- __[non-goals]__
  - No pay-to-win mechanics.
  - No server-side secret exposure; anon-only client.

## 4. Target Audience & Personas
- __[personas]__
  - Competitive Teen (mobile-first, Hebrew, speed + share)
  - Casual Fan (light hints, accessibility, reminders)
  - Community Organizer (clubs, recruiting via Join Us)

## 5. Market & Competitive Analysis
- __[landscape]__ Daily-guess genre (Wordle, Loldle), F2P fan projects, Brawl Stars community sites.
- __[differentiators]__ 5-mode daily hub, RTL-aware motion, typed backend, planned Tier List ecosystem tie-in.
- __[risks]__ Content IP, availability of assets/audio; mitigate with fair use policy and original descriptions.

## 6. Feature Set (Past → Current → Future)
- __[past shipped]__
  - Unified `/daily` page with conditional rendering; legacy route fallbacks (`src/App.tsx`, `DailyModesPage.tsx`).
  - State centralization with persistence (`useDailyStore.ts`).
  - Motion system v1 (`DailyModeTransitionOrchestrator.tsx`), reduced-motion and RTL-aware.
  - Join Us MVP form with validation, anti-spam, and Supabase insert (`JoinUsPage.tsx`).
  - Hebrew-first i18n scaffolding and RTL (`src/lib/i18n.ts`).
- __[current]__
  - 5 daily modes: classic, gadget, star power, audio, pixels (`DailyModesPage.tsx`).
  - Supabase tables: `daily_challenges`, `join_applications`, `profiles` (`types.ts`).
- __[future backlog]__
  - Tier List MVP (`TIER-LIST-PLAN.md`).
  - Survival mode polish and analytics.
  - Proper i18n engine + interpolation; translation coverage.
  - Share cards, streaks UX, push/notification strategy (opt-in), A/B testing.

## 7. User Stories & Acceptance Criteria
- __[daily guesser]__ As a player, I can pick a mode and guess the brawler in ≤ N taps; my progress persists.
- __[streak keeper]__ As a returning player, I see time until next daily and streak feedback.
- __[community applicant]__ As a user, I can submit Join Us with validation and receive feedback.
- __[acceptance cues]__ Loading → guess → feedback → completion → next daily timer; keyboard/ARIA accessible; RTL correct.

## 8. User Flows & Wireframes (placeholders)
- __[flows]__
  - Daily mode selection and switching (`DailyModesPage.tsx`).
  - Guess submission loop (store actions: `submitGuess`, `completeMode`).
  - Join Us submission → success/toast (`JoinUsPage.tsx`).
- __[wireframes]__ To be attached (mobile-first, dark theme, motion stages).

## 9. UX & Motion Principles
- __[guidelines]__ From `DAILY-MODES-MOTION-PLAN.md`.
- __[orchestration]__ Centralized wrapper respects prefers-reduced-motion and RTL (`DailyModeTransitionOrchestrator.tsx`).
- __[accessibility]__ Keyboard focus, screen-reader labels, high-contrast; ensure animation durations pass WCAG guidance.

## 10. Technical Architecture
- __[frontend]__ React + Vite, lazy routes, Suspense; TailwindCSS; Sonner.
- __[state]__ Zustand persisted store for daily modes (`useDailyStore.ts`).
- __[routing]__ React Router v6; unified `/daily` with query `?mode=...` + legacy path compatibility (`/daily/*`).
- __[i18n]__ Custom translator (`t`) with Hebrew default; needs interpolation and key alignment.
- __[backend]__ Supabase anon client (`client.ts`), typed models (`types.ts`), RLS required.
- __[perf]__ Preload images, analyze bundle, split chunks; device-aware motion.

## 11. Data Model & Content Pipeline
- __[tables]__
  - `daily_challenges(date, mode, challenge_data, ...)`
  - `join_applications(role, name, contact, trophies, age, locale, user_agent, ...)`
  - `profiles(id, current_streak, last_completed_date)`
- __[content ops]__ Daily content creation, validation, and publishing timeline; fallbacks and empty-state policy.

## 12. Analytics & Telemetry
- __[events]__ app_load, daily_init, mode_switch, guess_submit, guess_correct, guess_duplicate, completion, join_submit, join_success, join_error.
- __[funnel]__ Daily entry → mode select → first guess → completion; Join Us view → submit → accepted.
- __[tooling]__ Plausible/PostHog/Segment (TBD), custom logs; privacy-aware.

## 13. Roadmap & Milestones
- __[phase 1]__ i18n hardening, completion consistency, motion polish.
- __[phase 2]__ Tier List MVP rollout; analytics baseline.
- __[phase 3]__ Survival mode polish; sharing; growth loops.
- __[timeline]__ Q3–Q4 2025 placeholders; to be refined.

## 14. KPIs & Success Metrics
- __[engagement]__ DAU/WAU, session length, mode completion rate, average guesses.
- __[retention]__ D1, D7, streak distribution.
- __[growth]__ Join Us conversions, share CTR, funnel completion.
- __[quality]__ LCP/CLS/TTI, error budgets, animation jank rate, 95p API latency.

## 15. Risks & Mitigations
- __[catalog drift]__ i18n keys mismatched; interpolation absent → Align keys, add `tFmt`, tests.
- __[progress discrepancy]__ Pixels excluded from completion → Clarify policy; update store.
- __[navigation]__ Duplicate history entries → Use single navigation primitive.
- __[content]__ Missing daily data → Standard empty-state UX; monitoring.
- __[security]__ Client-only anon key; ensure RLS; move keys to env in builds.
- See `Issues & Bugs.md` for actionable findings.

## 16. Stakeholders & RACI
- __[roles]__ Product (you), Engineering, Design, Content ops, Community manager.
- __[cadence]__ Weekly planning, daily sync during releases; retro per milestone.

## 17. Release & Operations
- __[hosting]__ Netlify static; CI: Vite build; env vars for Supabase.
- __[db]__ Supabase migrations/types; advisory scans; RLS policies.
- __[runbooks]__ Daily reset checks, content publishing, on-call contact.

## 18. QA Strategy
- __[tests]__ Unit (store/i18n), integration (daily init/flow), E2E happy paths, accessibility checks.
- __[gates]__ Lighthouse budgets, bundle-size thresholds, regression list from Issues log.

## 19. Appendices
- __[A]__ Motion plan (`DAILY-MODES-MOTION-PLAN.md`).
- __[B]__ Daily migration plan (`daily-modes-single-page-migration-plan.md`).
- __[C]__ Tier List plan (`TIER-LIST-PLAN.md`).
- __[D]__ Evidence map: key files and responsibilities (see top of doc).

## 20. Glossary
- __[classic/gadget/starpower/audio/pixels]__ Daily modes.
- __[RLS]__ Row-Level Security in Supabase.
- __[RTL]__ Right-to-left layout.

---

Open Issues Log Reference: see `Issues & Bugs.md` in repo root for specific, reproducible defects and proposed fixes.
