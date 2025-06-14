# 14 – Performance Optimisation

Fast load times and snappy reactions keep players engaged.  This document lists
current performance characteristics of Brawl-Stars-Guess and actionable
techniques for preserving or improving them when new features land.

---

## 1. Baseline metrics

Run `bun run build` then analyse `dist/` with `npx vite-bundle-visualizer`.
At the time of writing (commit d4d5838):

| Metric                     | Value |
| -------------------------- | ----- |
| First load JS (gzip)       | **~2.1 MB** |
| Largest chunk              | 480 KB (`react-dom`) |
| CSS                        | 115 KB |
| Time-to-Interactive (local Lighthouse) | 1.9 s on desktop 3G sim |

These numbers are acceptable for a casual web game but leave room for
improvement.

---

## 2. Client-side optimisation techniques

1. **Code splitting**
   * Use `React.lazy` + `Suspense` for heavy pages (`AudioMode`, `PixelsMode`).
   * Example:
     ```tsx
     const AudioMode = lazy(() => import('@/pages/AudioMode'))
     ```
2. **Tree-shaking**
   * Avoid wildcard imports from libraries (`import * as dayjs`).
   * Prefer direct sub-path imports when possible.
3. **Image & audio assets**
   * Store in `public/` and reference with hashed filenames so Vite can add
     cache-busting query strings.
   * Optimise images with `squoosh-cli` and run `audiosprite` for large audio
     sets.
4. **Tailwind purge**
   * Vite + Tailwind already purge unused classes in production, but ensure
     dynamic classnames are whitelisted or use fixed strings.
5. **Memoisation**
   * Wrap expensive selectors or derived state with `useMemo`.
   * Zustand selectors should be used instead of reading whole store.
6. **Avoid unnecessary re-renders**
   * Use `React.memo` for static list rows (`BrawlerGuessRow`).
   * Never inline arrow functions into large lists; extract to `useCallback`.
7. **React Query caching**
   * Set `staleTime` generously (5–10 minutes) for daily challenge queries to
     prevent refetch spam.

---

## 3. Backend / network optimisation

* **Public CDN cache** – Static site host (Vercel) should enable immutable cache
  headers for `/assets/*`.  Confirm with `curl -I`.
* **Supabase Row Level Security (RLS)** – Use `select ... .single()` to avoid
  downloading lists when you need one row.
* **Edge Functions cold starts** – Currently only used by cron, so not
time-critical.

---

## 4. Performance budget

| Asset                   | Budget (gzip) |
| ----------------------- | ------------- |
| Initial JS payload      | ≤ 300 KB per chunk, ≤ 1.5 MB total |
| LargestContentfulPaint  | ≤ 2.5 s on cable desktop Throttling |
| Interaction delay (HMR) | < 100 ms for local dev |

If a PR exceeds these budgets, it must:

1. Justify the increase (e.g. new game mode with unavoidable assets).
2. Add lazy-loading, progressive download, or remove dead code.

---

## 5. Tooling

| Tool                  | Command                                        | When to run |
| --------------------- | ---------------------------------------------- | ----------- |
| Bundle visualiser     | `npx vite-bundle-visualizer`                   | Before merging heavy PRs |
| Lighthouse CI         | `npx lhci autorun --collect.url=http://localhost:4173` | Optional in CI |
| Source-map explorer   | `bunx source-map-explorer "dist/assets/*.js"`  | Debug large chunks |

---

## 6. Server-side Rendering? (discussion)

The game is fully client-side; SSR would add complexity and cold starts for
little benefit.  Keep monitoring; if first load JS grows beyond 3 MB consider
migrating to Astro + islands or React Server Components.

---

## 7. Checklist for performance reviews

- [ ] Added/updated `React.lazy` for new routes.
- [ ] Images/audio optimised.
- [ ] Lighthouse score ≥ 90 on Performance.
- [ ] Bundle visualiser shows no duplicated libs.
- [ ] React Profiler shows no wasted re-renders.

Maintaining these standards keeps gameplay smooth for all devices, including
mobile players on 3G. 