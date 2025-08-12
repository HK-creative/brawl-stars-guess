# KPIs & Dashboards

- Engagement: mode completion rate, average guesses per mode, session length.
- Retention: D1/D7, streak distribution, return rate by locale/device.
- Growth: Join Us conversion, share CTR, referral traffic.
- Performance: LCP/CLS/TTI, bundle size per route, API latency p95.
- Quality: error rate, animation jank %, failed submissions, 4xx/5xx ratios.

Dashboard plan: one page per category; weekly/biweekly reviews; annotations for releases.

## Targets (initial) — 2025 Q3–Q4
- Engagement: ≥ 60% daily mode completion; avg guesses 3–5; median session ≥ 2m.
- Retention: D1 ≥ 30%, D7 ≥ 10%; streaks: ≥ 25% with 3+ days.
- Growth: Join Us conversion ≥ 5% of unique views; share CTR ≥ 3%; referrals ≥ 15% of sessions.
- Performance: LCP ≤ 2.5s (p75), CLS ≤ 0.1, TTI ≤ 3.5s, API latency p95 ≤ 250ms.
- Quality: < 1% error rate; animation jank < 5% frames > 16ms; failed submissions < 2%.

## Dashboard Structure
- Engagement Dashboard: completion funnel, guesses distribution, session time by mode/device.
- Retention Dashboard: D1/D7/D30, streak histogram, cohort retention by locale.
- Growth Dashboard: Join Us funnel, share CTR, referral sources, campaign tags.
- Performance Dashboard: Lighthouse scores, route bundle sizes, API latency p50/p95, Web Vitals.
- Quality Dashboard: error rates by page, 4xx/5xx, client exceptions, form failure rates.

Owners: PM + Eng weekly review; perf/quality daily auto-checks.
Cadence: weekly exec snapshot; biweekly deep-dive; annotate releases.

## Event Mapping
- See `Brawldle-Docs/Analytics-and-Telemetry.md` for canonical event names.
- Ensure consistent properties: `mode`, `locale`, `device`, `streak`, `session_id`.

## Data Sources
- Client events (analytics SDK TBD), Supabase tables (`join_applications`, `daily_challenges`), server logs.
- Build artifacts for bundle sizes; browser APIs for Web Vitals.

## Alerting Thresholds
- Performance: alert if LCP p75 > 2.5s for 24h.
- Quality: alert if 5xx > 0.5% or client exceptions > 1% sessions.
- Growth: alert if Join Us success rate drops > 50% WoW.
