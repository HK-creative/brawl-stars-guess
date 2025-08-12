# System Architecture

- Frontend: React + Vite; lazy routes, Suspense; Tailwind; Sonner.
- State: Zustand persisted store (daily modes, currentDate, timeUntilNext).
- Backend: Supabase anon client (PKCE, persisted session) with typed `Database` schema.
- Security: RLS enforced; only anon keys in client; env vars in build.
- Deployment: Netlify static build; env vars for Supabase URL/key.

Evidence: `src/App.tsx`, `src/stores/useDailyStore.ts`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `supabase/functions/generate-daily-challenges/index.ts`, `supabase/functions/cron-setup/index.ts`.
