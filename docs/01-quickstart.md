# 01 – Quickstart

Get the app running locally in **five minutes** with Bun.

> If you hit any snags, jump to `../19-troubleshooting-guide.md`.

---

## Prerequisites

1. **Git** – any recent version.
2. **Bun ≥ 1.0** – install or upgrade with:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   # then restart your terminal
   bun --version
   ```
3. (Optional) **Node ≥ 18** if you plan to run auxiliary scripts outside Bun.
4. A modern web browser (Chromium, Firefox, Safari).

---

## 1. Clone the repository

```bash
git clone https://github.com/HK-creative/brawl-stars-guess.git
cd brawl-stars-guess
```

---

## 2. Install dependencies

```bash
bun install
```

Bun will read `package.json` & `bun.lockb`, fetching everything blazingly fast.

---

## 3. Start the development server

```bash
bun run dev
```

This executes the `dev` script (`bunx vite`). Vite starts a dev server at
`http://localhost:5173` (or the next free port). The browser should open
automatically; if not, visit the URL manually.

### Hot-reload
Changes in `src/` trigger instant hot-module reload (HMR). CSS & React state
updates appear in-page without a full refresh.

---

## 4. Run the test suite (optional but recommended)

```bash
bun run test      # vitest run
bun run coverage  # generates coverage report in coverage/
```

---

## 5. Build for production

```bash
bun run build
```

Output files land in `dist/` and are ready for any static host or the production
pipeline described in `06-build-and-deployment.md`.

---

## Useful scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `bun run dev`       | Start Vite dev server with HMR            |
| `bun run build`     | Build optimized production bundle         |
| `bun run preview`   | Preview the production build locally      |
| `bun run lint`      | Run ESLint with project rules             |
| `bun run test`      | Execute Vitest unit/integration tests     |
| `bun run coverage`  | Run tests with coverage output            |

---

## Environment variables

No environment variables are required for local development: the Supabase URL
and anon key are embedded in `src/integrations/supabase/client.ts`.

If you are configuring **your own Supabase project**, see
`05-environment-config.md` for instructions on overriding these values.

---

## Next steps

* Explore the code via [`02-folder-structure.md`](02-folder-structure.md).
* Review architecture & data flow docs before implementing features.
* Happy hacking! 🎉 