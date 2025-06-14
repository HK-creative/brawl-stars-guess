# 19 – Troubleshooting Guide

When something breaks, start here. Below are common symptoms, root‐causes, and
quick fixes specific to this codebase.

> Tip: keep this list updated—if you hit a new edge-case, document it so future
> devs (human or AI) can solve it in seconds.

---

## 1. Local development

| Symptom | Console/Error | Fix |
| ------- | ------------- | --- |
| `bun install` hangs or fails | "Unsupported engine" | Upgrade Bun to latest (`bun upgrade`) |
| Visiting `localhost:5173` shows blank page | Browser dev-tools: `Failed to fetch supabase...` | Make sure you're online; Supabase is remote.  If on corporate VPN, allow outbound HTTPS. |
| Port 5173 already in use | Vite error | `bun run dev --port 5174` or kill the other process (`lsof -i :5173`). |
| ESLint can't find plugin | `Failed to load plugin @typescript-eslint` | Delete `node_modules`, run `bun install` again (Bun dedupes). |
| Audio doesn't play in Audio mode | Browser: `Autoplay prevented` | User must interact first.  Click anywhere before hitting play. |

---

## 2. Build & deploy

| Symptom | Build step | Fix |
| ------- | ---------- | --- |
| `bun run build` fails with "Cannot resolve '@/…'" | Vite alias not resolving | Confirm path exists; run from repo root; check `vite.config.ts` alias. |
| Deployed site 404s on refresh | Static host missing SPA rewrite | For Vercel add "src/routes": "/*" → `/index.html` or `vercel.json` rewrite rule. |
| Cron edge function not executing | Supabase logs: schedule not found | Rerun `supabase functions invoke cron-setup`.  Ensure `pg_cron` extension enabled. |
| Edge function 401 | Response: `Invalid API key or JWT` | Deploy with **service-role** key or set `verify_jwt` false for internal cron. |

---

## 3. Tests

| Symptom | Output | Fix |
| ------- | ------ | --- |
| Vitest fails `ReferenceError: window is not defined` | Test imports browser-only code | Wrap component in `describeIfDom` or move pure logic to `lib/`. |
| Coverage report empty | `No coverage found` | Ensure tests import TS/TSX files; add `all: true` in Vite config (already set). |

---

## 4. Supabase

| Symptom | Logs / Error | Fix |
| ------- | ------------ | --- |
| `Failed to fetch daily_challenges` | Supabase table empty | Manually invoke `generate-daily-challenges` from dashboard or wait until cron hits. |
| `postgres permission denied` | RLS policy blocking | Verify policy in Studio allows `select` for `anon` role. |
| Local `supabase start` fails | Docker error "port already allocated" | Stop existing Postgres container, or change `ports` in `docker-compose`. |

---

## 5. Common coding pitfalls

1. **Dynamic Tailwind classes not purged** – Wrap variables in
   `clsx` with full class names, e.g., `text-${color}` ➜ not purge‐safe.  Prefer
   conditional arrays: `clsx(color === 'yellow' && 'text-brawl-yellow')`.
2. **Zustand persist versioning** – Changing store shape without resetting will
   break saved state. Call `localStorage.clear()` or bump state version.
3. **Date drift** – UTC+2 logic in `lib/daily-challenges.ts` relies on system
   clock. Ensure local dev box is set correctly.

---

## 6. Ask for help

Still stuck?  Provide:

* Exact error message and stack trace.
* Browser/OS/Bun version.
* Steps to reproduce.

Then tag `@HK-creative` in GitHub Issues.

---

_Add new issues + fixes below as they arise._ 