# Edge Functions & Automation

This document summarizes Supabase Edge Functions used for daily content automation and scheduling.

## Functions

- generate-daily-challenges
  - Path: `supabase/functions/generate-daily-challenges/index.ts`
  - Purpose: Generates rows in `daily_challenges` with the correct `date`, `mode`, and `challenge_data` payloads.
  - Auth: Uses `SUPABASE_SERVICE_ROLE_KEY` when executed in Supabase environment.
  - Client: Typed via `Database` schema from `src/integrations/supabase/types.ts`.

- cron-setup
  - Path: `supabase/functions/cron-setup/index.ts`
  - Purpose: Configures Postgres cron (via RPC) to run the daily challenge generation on schedule.
  - Auth: Uses `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` from environment.

## Scheduling

- Supabase cron RPCs invoked: `setup_cron`, `setup_daily_challenge_cron`.
- Ensure the project has the `pg_cron` extension enabled and policies allowing RPC.

## Environment

- Required vars (in Supabase environment):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Frontend uses publishable anon key via `src/integrations/supabase/client.ts` with PKCE and persisted sessions.

## References

- Client: `src/integrations/supabase/client.ts`
- Types: `src/integrations/supabase/types.ts`
- Edge Functions: `supabase/functions/generate-daily-challenges/`, `supabase/functions/cron-setup/`
