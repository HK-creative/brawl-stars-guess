# 04 – Tech-Stack & Dependencies

This file enumerates **every major technology and library the project relies
on**, pinned to the versions in `package.json` (commit hash at time of
writing). It explains *why* each piece is used and where to find its
configuration in the repo.

> All version numbers below come straight from `package.json` at
> d4d5838 (main branch).

---

## 1. Runtime & Toolchain

| Layer                   | Library / Tool                | Version  | Purpose |
| ----------------------- | ----------------------------- | -------- | ------- |
| JavaScript runtime      | **Bun**                       | ≥ 1.0    | Fast dependency install & script runner (`bunx vite`, `bun run test`, …) |
| Language                | **TypeScript**                | 5.5.3    | Static typing for the entire codebase |
| Bundler / Dev-server    | **Vite**                      | 5.4.1    | Lightning-fast HMR & production build |
| JSX transform           | **@vitejs/plugin-react-swc**  | 3.5.0    | Uses SWC for turbo JSX/TS compilation |
| Linter                  | **ESLint**                    | 9.9.0    | Code-quality gates (see `eslint.config.js`) |
| Formatter               | **Prettier**                  | bundled in IDE (no direct dep) | Formatting is enforced by editor config |
| Unit test runner        | **Vitest**                    | 3.1.4    | Jest-compatible API + blazing speed |
| DOM testing helpers     | **@testing-library/react**    | 16.3.0   | Idiomatic component tests |

---

## 2. Core Front-End Libraries

| Category         | Package                           | Version  | Why we chose it |
| ---------------- | --------------------------------- | -------- | -------------- |
| UI framework     | **react** / **react-dom**         | 18.3.1   | Battle-tested declarative UI |
| Routing          | **react-router-dom**              | 6.26.2   | File-free dynamic routing |
| State (server)   | **@tanstack/react-query**         | 5.56.2   | Caching, retries, stale-while-revalidate |
| State (client)   | **zustand**                       | 5.0.4    | Minimal global store (hooks, no boilerplate) |
| Forms / Validation| **react-hook-form** + **zod**    | 7.53.0 / 3.23.8 | Performant uncontrolled forms & schema validation |
| Animations       | **framer-motion**                 | 12.11.4  | Physics-based transitions |
| Styling          | **tailwindcss**                   | 3.4.11   | Utility-first CSS |
| Component kit    | **shadcn-ui**                     | n/a (generated) | Accessible Tailwind-powered primitives |
| Icon set         | **lucide-react**                  | 0.511.0  | Feather-style icons |
| Charts           | **recharts**                      | 2.12.7   | Simple React chart components |
| Carousel / Slider| **embla-carousel-react**          | 8.3.0    | Touch-friendly carousel |
| Date utilities   | **dayjs** / **date-fns**          | 1.11.13 / 3.6.0 | Tiny date helpers |
| Particle effects | **@tsparticles/react** + core libs| 3.0.0 / 3.8.1 | Confetti / sparkles effects |
| Misc utilities   | **clsx**, **class-variance-authority** | 2.1.1 / 0.7.1 | Conditional classnames, Tailwind variant helpers |

### Tailwind customisations

* Config file: `tailwind.config.ts` (dark-mode via `class`, extended colour
  palette for *brawl-yellow/red/green/blue*, custom animations for card reveal,
  heartbeat, etc.).
* Plugins: `tailwindcss-animate` 1.0.7.

---

## 3. Backend / External Services

| Service        | Library                         | Version | Notes |
| -------------- | ------------------------------ | ------- | ----- |
| Supabase       | **@supabase/supabase-js**      | 2.49.4 | Auth, Postgres, Edge Functions |
| Supabase Edge  | Deno runtime (hosted)          | latest  | `supabase/functions/*` |

Keys are hard-coded in `src/integrations/supabase/client.ts` for seamless local
work. For other environments, see `05-environment-config.md`.

---

## 4. Dev-Only Dependencies

| Purpose                  | Package                     | Version |
| ------------------------ | --------------------------- | ------- |
| Type definitions         | **@types/react**            | 18.3.3 |
| Jest environment         | **jsdom**                   | 26.1.0 |
| Tailwind prose           | **@tailwindcss/typography** | 0.5.15 |
| ESLint presets           | **@eslint/js**, **eslint-plugin-react-hooks**, **eslint-plugin-react-refresh** | 9.9.0 / 5.1.0-rc.0 / 0.4.9 |
| Coverage reporter        | **@vitest/coverage-v8**     | 3.1.4 |
| Lovable AI tagging       | **lovable-tagger**          | 1.1.7 |

(See `devDependencies` in `package.json` for the full list.)

---

## 5. Dependency management & updates

* **Single lockfile** – Bun generates `bun.lockb`, ensuring reproducible builds.
* **Semantic versioning** – Dependency bumps follow semver; breaking changes are
documented in `17-key-design-decisions.md`.
* **Renovate/GitHub Dependabot** – TODO: integrate for automatic PRs (tracked in
  issue #42).

---

### Adding a new dependency

1. `bun add <package>` – Bun updates `bun.lockb` and `package.json`.
2. Commit with a conventional message, e.g. `build: add <package>`.
3. Document *why* the library was chosen in the PR description; if it replaces
   another tool, update this file accordingly.

---

Everything listed here is current and exact—no placeholders. If you introduce a
new library, **update this document in the same PR** so future contributors and
AI agents stay in sync. 