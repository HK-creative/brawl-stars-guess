# Roadmap & Milestones

Phase 1 — Hardening (Now → +2 weeks)
- i18n fixes (keys + interpolation), daily completion consistency, history push cleanup, motion toggles.
- Analytics baseline events; bundle budgets.

Phase 2 — Tier List MVP (+2 → +6 weeks)
- Minimal components, data model, routing; content curation; A/B for ranking UX.

Phase 3 — Survival & Growth (+6 → +12 weeks)
- Survival polish; shareables; streak UX; notifications; social integrations.

Dependencies: `TIER-LIST-PLAN.md`, `DAILY-MODES-MOTION-PLAN.md`, `daily-modes-single-page-migration-plan.md`. 

## Timeline Anchors (based on 2025-08-11)
- Phase 1: 2025-08-11 → 2025-08-25
  - Week 1 (Aug 11–17): i18n key alignment + `tFmt` interpolation; navigation duplication fix; decide Pixels policy.
  - Week 2 (Aug 18–24): implement completion logic per decision; re-enable transitions (respect reduced motion); Supabase env hardening; baseline analytics.
- Phase 2: 2025-08-26 → 2025-09-22
  - Tier List MVP per `TIER-LIST-PLAN.md`: schema, routes, core UI, seed content, community feedback loop, initial A/B.
- Phase 3: 2025-09-23 → 2025-11-03
  - Survival polish, share cards, streak UX, opt-in notifications, social integrations, growth loops.

## Decision Gates
- DG-1 (Phase 1, Week 1): RESOLVED 2025-08-11T17:21:56+03:00 — Pixels count toward total; total = 5.
- DG-2 (Phase 1, Week 1): i18n strategy — align code to `mode.<mode>.title` + `label.daily_challenge` vs add missing keys.

## Exit Criteria
- Phase 1: No i18n title gaps; progress totals consistent; single-history navigation; transitions on (unless reduced-motion); env keys externalized; baseline analytics shipping.
- Phase 2: Tier List route functional with minimal viable ranking and persistence; basic analytics and QA passing.
- Phase 3: Shareables live; retention uplift observed; performance and quality thresholds within targets (see KPIs).
