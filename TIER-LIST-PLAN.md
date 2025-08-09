---
description: Plan to implement the Tier List page reachable from Home ➜ Tier List
---

# Tier List Feature Plan

## Current State (from code)
- Route exists: `/tier-list` in `src/App.tsx`.
- Home button navigates to `/tier-list` in `src/pages/Index.tsx`.
- Placeholder page exists: `src/pages/TierListPage.tsx` ("coming soon").
- i18n keys present in `src/lib/i18n.ts` under `home.tier.list`, `tier.list.*`.
- Brawler data present: `brawlers_full.json` (used as a potential source).

## Objectives
- Deliver a readable, responsive Brawler Tier List with clear tiers (e.g., S/A/B/C).
- Keep navigation, i18n, and visual style consistent with existing app.
- MVP: static curated list (no drag-and-drop or voting).
- Post-MVP: interactive features (filtering, drag-and-drop, community votes).

## Scope
- Page UX/UI
- Data sourcing and mapping from local JSON or a lightweight config
- Localization for labels and headings
- Performance and accessibility baselines

## UX Outline
- Header: Back button, page title `tier.list.page.title`.
- Filters (MVP minimal): search by name; later expand to class/rarity/role.
- Tier Board: sections S, A, B, C (and optional D) each with a grid of brawler cards.
- Card: portrait, name, class/rarity chip (if available), hover affordance.
- Footer: link back to Home.

## Data Model
- Source of truth (MVP): `src/data/tierlist.json` (new) maps tier ➜ array of brawler ids.
- Brawler metadata: read from existing `brawlers_full.json` (id, name, image path).
- i18n: labels for tiers and page text in `src/lib/i18n.ts`.

Example `src/data/tierlist.json` (illustrative):
```json
{
  "S": ["shelly", "colt"],
  "A": ["primo"],
  "B": [],
  "C": []
}
```

## Components (new)
- `src/components/tierlist/TierListHeader.tsx`: title, back, optional controls.
- `src/components/tierlist/TierBoard.tsx`: renders tiers in order with rows.
- `src/components/tierlist/TierRow.tsx`: label + grid of `BrawlerCard`s.
- `src/components/tierlist/BrawlerCard.tsx`: portrait + name, a11y labels.
- `src/components/tierlist/FiltersBar.tsx` (MVP: search only; optional initially).

## Page Integration
- Expand `src/pages/TierListPage.tsx` to render:
  - Header
  - Optional FiltersBar (feature-flag for MVP)
  - TierBoard (from `tierlist.json` + `brawlers_full.json`)
  - Keep styling with Tailwind + existing design tokens.

## Accessibility & i18n
- All interactive elements keyboard accessible; proper roles/aria.
- RTL support via existing layout practices.
- Add i18n keys for tier labels: `tier.label.s`, `tier.label.a`, etc.

## Performance
- Lazy-load TierList page (already in place).
- Consider dynamic import of `tierlist.json`.
- Optimize card images via existing `Image` component where possible.

## Post-MVP Ideas (not in first iteration)
- Drag-and-drop ordering (e.g., `@dnd-kit`) with persistence.
- Community voting (Supabase) and aggregated rankings.
- Filters: class/rarity/role, mode-specific tiering.
- Shareable links, deep links to a brawler.
- Animations via Framer Motion consistent with Daily Modes.

## Implementation Steps
1) Create `src/data/tierlist.json` (seed with initial tiers).
2) Build components in `src/components/tierlist/` per above.
3) Wire `TierListPage.tsx` to read `tierlist.json` + `brawlers_full.json`, render `TierBoard`.
4) Add i18n keys for tier labels and page copy if missing.
5) Ensure responsive layouts and a11y (tab order, aria-labels).
6) Light QA across desktop/mobile + RTL.
7) Optional: minimal search filter (client-side) if time permits.

## Acceptance Criteria (MVP)
- `/tier-list` shows tiers S/A/B/C with at least some seeded brawlers.
- Cards display name + image for each brawler.
- Back to Home works; no console errors; layout is responsive.
- Strings localized for supported languages.

## Open Questions
- Who provides the initial ranking? (Design/product input)
- Do we want a D tier in MVP?
- Should filters/search be in the first cut or next?

## Rollout Plan
- Implement behind a simple feature flag if desired (not required).
- Merge once MVP criteria are met; enable home button (already active).
- Gather feedback; iterate on filters and interactivity.
