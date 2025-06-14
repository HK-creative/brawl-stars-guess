# 06 – Build & Deployment

This document describes how to produce a production-ready build of the
Brawl-Stars-Guess web app and deploy both the **front-end** and **Supabase Edge
Functions**.

Everything here is tested against the current repository. No placeholders. 🚀

---

## 1. Front-end (static site)

### 1.1 Build locally

```bash
# From the repo root
bun run build
```

This triggers `vite build` (via `bunx`) and outputs an optimised bundle to
`dist/`.

Key facts:

* **Modern build** – targets ES2020+; legacy browsers not officially supported.
* **Asset hashing** – file names include content hashes for cache busting.
* **Size** – ~2 MB gzip (check `dist/report.html` if you add rollup-analyzer).

### 1.2 Preview the bundle

```bash
bun run preview
# → http://localhost:4173
```

### 1.3 Deploy options

Because the app is purely static it can be hosted on any CDN. Common choices:

| Provider     | How-to                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| **Vercel**   | `vercel --prod` – Vercel auto-detects Vite and runs `bun run build`      |
| **Netlify**  | Connect repo → Build command `bun run build` → Publish directory `dist/` |
| **Cloudflare Pages** | `npx wrangler pages deploy dist`                                 |
| **GitHub Pages** | Push `dist/` to the `gh-pages` branch (see script below)             |

Example GitHub Pages workflow (`.github/workflows/pages.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
    paths: [ 'src/**', 'index.html', 'vite.config.ts', 'tailwind.config.ts' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Bun
        uses: oven-sh/setup-bun@v1
      - name: Install deps & build
        run: |
          bun install
          bun run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

> Tip: static hosts add their own caching headers.  If you change Supabase keys
> in the JS bundle you may need to bust caches or bump `vite` hash salt.

---

## 2. Supabase Edge Functions

The repo contains two Deno-based functions:

* `generate-daily-challenges` – creates the daily entries.
* `cron-setup` – one-time function that schedules the above via `pg_cron`.

### 2.1 Prerequisites

```bash
brew install supabase/tap/supabase
supabase --version   # confirm CLI installed
supabase login       # opens browser for access token
```

The Supabase project ID is stored in `supabase/config.toml`:

```
project_id = "zkqlqveltfxvelxzyyik"
```

### 2.2 Deploying functions

From the repo root:

```bash
# Build & upload
supabase functions deploy generate-daily-challenges --project-id zkqlqveltfxvelxzyyik
supabase functions deploy cron-setup --project-id zkqlqveltfxvelxzyyik

# (Optional) verify
supabase functions list --project-id zkqlqveltfxvelxzyyik
```

### 2.3 Running the cron setup (once)

```bash
supabase functions invoke cron-setup --project-id zkqlqveltfxvelxzyyik
```

After this, Supabase will automatically trigger
`generate-daily-challenges` every night at **00:00 UTC+2** (10 PM UTC).

---

## 3. End-to-end deployment pipeline (suggested)

1. **Push to `main`** → GitHub Actions runs unit tests (`bun run test`).
2. **Build** front-end bundle and Edge Functions.
3. **Deploy**:
   * Upload `dist/` to the chosen static host.
   * Call `supabase functions deploy` for any modified functions.
4. **Smoke test** via Playwright (future enhancement).

---

### Troubleshooting

| Symptom                               | Likely cause / fix                                 |
| ------------------------------------- | --------------------------------------------------- |
| Blank page after deploy               | Wrong `base` in `vite.config.ts`; use `/`           |
| 404s for page refresh on Vercel       | Add SPA rewrite: `/* → /index.html`                |
| Edge function returns 401             | Check `SUPABASE_SERVICE_ROLE_KEY` in project       |
| Cron job not firing                   | Make sure `pg_cron` extension enabled (`cron-setup`) |

For more issues see `19-troubleshooting-guide.md`.

---

**Deployment = reproducible build + repeatable release steps.**  Keep this
file updated whenever the pipeline changes. 