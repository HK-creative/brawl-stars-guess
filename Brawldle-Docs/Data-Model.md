# Data Model (Supabase)

- daily_challenges
  - id (uuid), date (date), mode (text), challenge_data (jsonb), created_at (timestamptz)
  - Usage: source of truth for daily content per mode/date.

- join_applications
  - id (uuid), created_at (timestamptz), role (text), name (text), contact (text), trophies (int), age (int?), locale (text?), user_agent (text?)
  - Usage: intake for community roles; validate and rate-limit.

- profiles
  - id (uuid), current_streak (int), last_completed_date (date)
  - Usage: track streaks when/if linked with auth (anon session persisted).

Reference: `src/integrations/supabase/types.ts`, `src/integrations/supabase/client.ts`. 
