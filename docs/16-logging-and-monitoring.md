# 16 – Logging & Monitoring

While this project is primarily client-side, observability is still critical.
Errors caught in production can quickly degrade the daily-mode experience. This
file explains what logging is already in place, where to view it, and how to
extend the monitoring stack.

---

## 1. Front-end logging

### 1.1 Console logs

Most helper functions (`lib/daily-challenges.ts`, Zustand actions) already emit
`console.log` / `console.error` statements. These are visible in the browser dev
tools only.

| Log level        | Usage examples                                   |
| ---------------- | ------------------------------------------------ |
| `console.log`    | Informational: store initialisation, brawler selection |
| `console.warn`   | Non-fatal issues (missing challenge data)        |
| `console.error`  | Failed Supabase calls, unexpected exceptions     |

**Guideline:** group related logs with `console.groupCollapsed()` during heavy
loops to keep the console readable.

### 1.2 Production error tracking (future)

We plan to add **Sentry** for uncaught exceptions and performance traces.

Steps to integrate:

1. `bun add @sentry/react @sentry/tracing`.
2. In `src/main.tsx`:
   ```ts
   import * as Sentry from '@sentry/react'
   Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, tracesSampleRate: 1.0 })
   ```
3. Update `05-environment-config.md` with `VITE_SENTRY_DSN` variable.

---

## 2. Supabase logs

Supabase provides dashboards for:

* **Edge Function logs** – Invocations, `console.log` output, and execution
  errors.  View under *Project ➜ Logs ➜ Functions*.
* **Database logs** – Query history.  Useful when debugging slow selects.

### Alerting

Configure log-based triggers in Supabase if you want Slack alerts for Edge
Function failures.

---

## 3. Static host analytics

If you deploy to Vercel / Netlify:

* **Vercel Analytics** – automatically tracks Web Vitals (Core Web Vitals tab).
* **Netlify Analytics** – option to enable server logs & traffic.

Add these dashboards to your monitoring routine after launch.

---

## 4. Browser performance monitoring

Enable **Lighthouse CI** in GitHub Actions (see `14-performance-optimization.md`) to
track LCP, CLS, and TTI over time.  Failing budgets should block deploys.

---

## 5. Logging best practices

1. **No secrets** – never log Supabase JWTs or user PII.
2. **Use structured logs** – output JS objects, not string concatenation:
   ```ts
   console.log('Daily challenge fetched', { mode, date })
   ```
3. **Remove debug noise** before merging (`TODO: remove` comments are not enough).

---

## 6. When something goes wrong

1. Check browser console for stack trace → reproduce locally.
2. Check Supabase *Edge Functions* log tab for 5xx errors.
3. If Sentry is enabled, open the event in Sentry and inspect breadcrumbs.

Document root-cause and fix in `17-key-design-decisions.md` if it affects
architecture.

---

Having clear, centralised logs shortens the time between bug report and fix.
Implement the planned Sentry integration as soon as the project goes live to
catch issues invisible in your local dev console. 