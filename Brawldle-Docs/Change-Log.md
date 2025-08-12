# Change Log — Brawldle Documentation

- 2025-08-11
  - Created folder-based documentation structure at `Brawldle-Docs/`.
  - Added modular PRD/portfolio documents:
    - INDEX.md (hub), Executive-Summary.md, Product-Overview.md, Objectives-and-Success-Criteria.md, Personas.md,
      Feature-Set.md, User-Stories-and-AC.md, UX-and-Motion.md, Information-Architecture.md, System-Architecture.md,
      Data-Model.md, Localization-and-i18n.md, Analytics-and-Telemetry.md, KPIs-and-Dashboards.md,
      Roadmap-and-Milestones.md, QA-Strategy.md, Release-and-Operations.md, Stakeholders-and-RACI.md,
      Risks-and-Mitigations.md, Appendices.md, Glossary.md, Issues-and-Bugs.md (copy), PRD-Portfolio-Outline.md.
  - Root files previously created for context: `Issues & Bugs.md`, `Brawldle-PRD-Portfolio-Outline.md`, `Brawldle-PRD-Portfolio.md`.

- 2025-08-11 (later updates)
  - Added: `Remediation-Plan.md`; linked in INDEX.
  - Added: `Edge-Functions-and-Automation.md`; linked in INDEX.
  - Updated: `System-Architecture.md` evidence to include `supabase/functions/generate-daily-challenges/index.ts` and `supabase/functions/cron-setup/index.ts`.
  - Verified: Supabase client and types live at `src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts`.
  - Decision: Pixels count toward daily completion; total = 5.
  - Updated docs: `User-Stories-and-AC.md`, `Remediation-Plan.md`, `Roadmap-and-Milestones.md` to reflect Pixels decision.

Notes: Future entries should include date, files changed, and a one-line rationale.
