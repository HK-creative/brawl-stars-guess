# Release & Operations

- Hosting: Netlify static build with immutable assets and redirects for legacy `/daily/*`.
- CI/CD: Vite build; preview deploys for PRs; production on main.
- Environment: Supabase URL/key via environment variables (no inline secrets).
- Observability: basic logs + analytics dashboards; error tracking (TBD).
- Runbooks:
  - Daily reset verification and content publishing checklist.
  - Incident response: triage, rollback criteria, comms template.
  - On-call: contact list and escalation path.

References: `netlify.toml`, `vite.config.ts`, `src/integrations/supabase/client.ts`. 
