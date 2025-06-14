# 02 – Folder Structure

A bird's-eye view of the repository, so you always know where to look (or place
new files).

```
.
├── src/                # Front-end application source (React + TS)
│   ├── app/            # React Router v6 entry & route loaders (if any)
│   ├── pages/          # Top-level page components (game modes, auth, etc.)
│   ├── components/     # Re-usable UI & domain components
│   │   └── ui/         # Generic primitives (shadcn-ui variants)
│   ├── contexts/       # React Context providers (e.g., auth, streak)
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Global state – Zustand stores
│   ├── lib/            # Framework-agnostic helpers (daily challenges, auth)
│   ├── data/           # Static JSON payloads & seed data
│   ├── styles/         # Tailwind & global CSS
│   └── test/           # Vitest test utilities & mocks
│
├── public/             # Static assets copied as-is to the build
├── supabase/           # Edge Functions & project config
│   └── functions/      # ├─ cron-setup/        – schedules cron jobs
│                       # └─ generate-daily-challenges/ – serverless logic
├── dist/               # Production build output (auto-generated, git-ignored)
├── docs/               # This knowledge base 📚
├── .git/               # Git history & hooks
├── bun.lockb           # Bun dependency lockfile (⇢ deterministic installs)
├── package.json        # Scripts & npm-style dependency manifest
├── tailwind.config.ts  # Tailwind theme & plugin config
├── vite.config.ts      # Vite bundler config
├── tsconfig*.json      # TypeScript compiler settings
└── README.md           # Generic Lovable README (legacy)
```

---

## Naming conventions

* **PascalCase** for React components & files exporting components, e.g.
  `GameModeCard.tsx`.
* **kebab-case** for folders that hold multiple components or utilities,
  e.g. `supabase/functions/generate-daily-challenges`.
* **snake_case** only for static JSON or non-TS assets (`brawlers_full.json`).

---

## Where should I put…?

| I built…                       | Drop it in…                          | Notes |
| ------------------------------- | ------------------------------------- | ----- |
| A new reusable button variant   | `src/components/ui`                   | Keep API consistent with shadcn-ui |
| A game-mode page               | `src/pages`                           | Route config lives in `src/app` if applicable |
| A global state slice           | `src/stores`                          | Prefer Zustand & persist as needed |
| A fetch/query helper           | `src/lib`                             | Keep it framework-agnostic |
| A .png/.svg asset              | `public/` (or import in code)         | Small icons can live beside component |
| A serverless function          | `supabase/functions/<name>/`          | Use Deno runtime guidelines |

---

If your addition doesn't fit these categories, open a PR and propose a new
folder or pattern in `17-key-design-decisions.md`. 