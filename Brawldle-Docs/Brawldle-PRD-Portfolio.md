# Brawldle — Comprehensive PRD & Product Portfolio

Last updated: 2025-08-11

This document is a professional PRD and portfolio artifact for Brawldle. It consolidates product vision, requirements, UX/motion, technical architecture, analytics, and an actionable roadmap. It is grounded in the current codebase and existing plans.

Related in-repo documents:
- DAILY-MODES-MOTION-PLAN.md
- daily-modes-single-page-migration-plan.md
- TIER-LIST-PLAN.md
- Issues & Bugs.md (current defect log for future remediation)

Code evidence anchors (key files):
- Routing: src/App.tsx
- Daily hub: src/pages/DailyModesPage.tsx
- Motion orchestrator: src/components/layout/DailyModeTransitionOrchestrator.tsx
- State: src/stores/useDailyStore.ts
- i18n: src/lib/i18n.ts
- Supabase: src/integrations/supabase/client.ts, src/integrations/supabase/types.ts
- Join Us flow: src/pages/JoinUsPage.tsx

---

## 1. Executive Summary
- Problem: Fans want quick, fresh, fair daily Brawl Stars challenges with mobile-first polish and Hebrew-first UX.
- Solution: Brawldle is a unified daily challenge hub with multiple modes, motion-rich interactions, persistent progress, and community onboarding.
- Differentiators: 5-mode daily hub, RTL-aware animations, typed Supabase backend, Join Us funnel, and Tier List ecosystem plans.

## 2. Objectives & Success Criteria
- Delight: NPS ≥ 50 on-day interaction; animation jank < 5% frames; LCP ≤ 2.5s on mid devices.
- Engagement: ≥ 55% complete at least one mode per session; avg. guesses ≤ 6 for Classic.
- Retention: D1 ≥ 20%, D7 ≥ 8%; Streak ≥ 3 days for 20% of DAU.
- Growth: Join Us conversion ≥ 8% of landing sessions; share CTR ≥ 3%.

## 3. Scope
- In-Scope: Unified daily hub (/daily), 5 modes (classic, gadget, star power, audio, pixels), Hebrew/RTL, Join Us, typed Supabase models, motion v1, basic analytics events.
- Out-of-Scope (this phase): Monetization, accounts beyond anon session, server-side admin panel, service-role keys in client.

## 4. Personas
- Competitive Teen: Hebrew-first, quick loops, shares wins, seeks variety.
- Casual Fan: Guidance (hints), gentle motion, clear feedback, accessible.
- Community Organizer: Club/Instructor use cases, Join Us funnel, contact management offline.

## 5. User Stories & Acceptance Criteria
A. Daily Player
- As a player, I choose a mode on /daily and start guessing within 2 taps.
  - AC: /daily loads; mode set via ?mode=; mode content renders with header.
- I see localized titles, labels, and time until next daily.
  - AC: i18n keys map correctly for EN/HE; RTL layout and motion flipping respected.
- My guesses persist during the day; duplicate guesses are ignored.
  - AC: useDailyStore submitGuess dedupes; persistence via localStorage.
- Completion is tracked and clearly indicated; progress displays total modes consistently.
  - AC: areAllModesCompleted/getCompletionProgress aligned with rendered modes.

B. Join Us Applicant
- As a user, I submit a role-tagged application with validation and feedback.
  - AC: Schema-driven validation; rate limit and honeypot; success/error toasts; row inserted to join_applications.

C. Accessibility & Performance
- As a motion-sensitive user, I get reduced-motion behavior.
  - AC: prefers-reduced-motion respected; orchestrator honors disabled state or user prefs.
- As a mobile user, I see fast load with code-splitting and preloaded critical assets.
  - AC: LCP budget met; chunks named and split; image preloads executed.

## 6. Experience Design
- UX principles: mobile-first, quick TTFG (time-to-first-guess), progressive disclosure, consistency across modes.
- Motion: orchestrated transitions between modes; small deltas for subtlety; RTL-aware slide direction (see DAILY-MODES-MOTION-PLAN.md).
- Accessibility: keyboard focus order, aria labels, contrast, reduced motion.
- Empty-state: show meaningful copy when daily content missing; never leak real answers.

## 7. Information Architecture
- Entry points: / (Index), /daily (hub), legacy /daily/* redirect/compat, /join-us, /tier-list, /survival.
- Navigation: Daily header controls mode switching; browser back/forward coherent with query-state.
- Localization: Hebrew default; language toggle possible; direction set on document.

## 8. System Architecture
- Client: React + Vite; lazy routes via Suspense; Tailwind for styling; Sonner for toasts.
- State: Zustand persisted store for daily modes (currentDate, per-mode state, timeUntilNext).
- Backend: Supabase anon client (PKCE, persisted session); typed Database model.
- Security: RLS required on tables; anon key only in client; no service-role keys exposed.
- Deployment: Netlify static build; environment variables for Supabase URL/key in production builds.

## 9. Data Model (Supabase)
- daily_challenges: { id, date, mode, challenge_data, created_at }
- join_applications: { id, created_at, role, name, contact, trophies, age?, locale?, user_agent? }
- profiles: { id, current_streak, last_completed_date }

## 10. Localization (i18n)
- Current: key-value catalog with Hebrew default and RTL direction.
- Gaps: Interpolation not applied; key mismatch for daily titles (see Issues & Bugs.md).
- Plan: Introduce tFmt(key, params); consolidate keys; add tests to prevent drift.

## 11. Analytics & Telemetry
- Core events: app_load, daily_init, mode_switch, guess_submit, guess_duplicate, guess_correct, completion, join_submit, join_success, join_error.
- Funnels: daily engagement funnel; Join Us conversion funnel.
- Tooling: lightweight (Plausible/PostHog) + custom logs; respect privacy and consent.

## 12. KPIs & Dashboards
- Engagement: mode completion rate, avg. guesses.
- Retention: D1/D7, streak distribution.
- Performance: LCP/CLS/TTI, bundle size per route.
- Quality: error rate, animation jank, API latency p95.

## 13. Roadmap & Milestones
Phase 1 — Hardening (Now → +2 weeks)
- i18n fixes (keys + interpolation), daily completion consistency, history push cleanup, motion toggles.
- Analytics baseline events; bundle budgets.

Phase 2 — Tier List MVP (+2 → +6 weeks)
- Minimal components, data model, routing; content curation; A/B for ranking UX.

Phase 3 — Survival & Growth (+6 → +12 weeks)
- Survival polish; shareables; streak UX; opt-in notifications; social integrations.

## 14. Risks & Mitigations
- i18n drift: enforce typed keys or CI checks; unit tests for tFmt.
- Completion logic mismatch: define single source of truth; update store + UI.
- Navigation duplication: use one navigation primitive; QA back/forward.
- Content missing: robust empty-states; monitoring; fallback copy.
- Security: RLS audit; ensure keys via env in builds; periodic advisors.

## 15. QA Strategy
- Unit: store actions (submitGuess, completeMode), i18n helpers, timeUntilNext.
- Integration: daily init flow (fetch + state), Join Us submit (valid/invalid/rate-limit), mode switch.
- E2E: happy paths for each mode; accessibility checks; RTL layout & motion.
- Perf: Lighthouse CI; bundle-size thresholds.

## 16. Stakeholders & RACI
- Product: requirements, prioritization, accept/reject.
- Engineering: implementation, testing, performance.
- Design: UX/motion patterns, assets, a11y.
- Content Ops: daily challenge creation & QA.
- Community: Join Us intake, comms.

## 17. Release & Operations
- Hosting: Netlify with immutable assets; redirects for legacy routes.
- Observability: logs + analytics dashboards; error tracking.
- Runbooks: daily reset verification, content publishing checklist, incident response.

## 18. Open Issues & Technical Debt
See Issues & Bugs.md for actionable items (i18n keys, completion logic, history duplication, motion flags, Supabase env usage, empty-state policy).

## 19. Appendices
- A. Motion Plan — DAILY-MODES-MOTION-PLAN.md
- B. Daily Migration Plan — daily-modes-single-page-migration-plan.md
- C. Tier List Plan — TIER-LIST-PLAN.md
- D. Evidence Map — paths listed at top of this document

---

## Change Log
- 2025-08-11: Initial comprehensive PRD & portfolio document created.
