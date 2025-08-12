# Analytics & Telemetry

- Core events: app_load, daily_init, mode_switch, guess_submit, guess_duplicate, guess_correct, completion, join_submit, join_success, join_error.
- Funnels: daily engagement (enter → select mode → first guess → completion); Join Us (view → fill → submit → success).
- Tooling: Plausible/PostHog/Segment (TBD) + lightweight custom logs; privacy-aware and consent-based.
- Dashboards: engagement, retention, performance, quality (see KPIs & Dashboards).

References: `src/App.tsx` (preload/analysis hooks), `src/pages/JoinUsPage.tsx` (submission), `src/stores/useDailyStore.ts` (actions).
