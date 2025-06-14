# 22 – Onboarding Checklist

Welcome aboard! Follow this checklist to become productive in less than one
hour.  Check items off as you complete them.

---

## First 30 minutes

- [ ] **Clone the repo** – `git clone https://github.com/HK-creative/brawl-stars-guess.git`
- [ ] **Install Bun** – `curl -fsSL https://bun.sh/install | bash`
- [ ] **Install deps** – `bun install`
- [ ] **Run dev server** – `bun run dev` → <http://localhost:5173>
- [ ] Browse the app; play a round of Classic mode.

## First 1 hour

- [ ] Read `02-folder-structure.md` to map the code.
- [ ] Skim `03-architecture-overview.md` and `09-state-management-and-data-flow.md`.
- [ ] Run tests: `bun run test` (expect all green).
- [ ] Create a GitHub branch: `git checkout -b chore/readme-typo-fix` and push a trivial PR to verify CI.

## First day

- [ ] Set up your IDE ESLint + Prettier integration.
- [ ] Install React DevTools & Zustand DevTools in browser.
- [ ] Read open Issues and assign yourself your first task.

## First week

- [ ] Deploy a personal preview: fork → connect to Vercel (free tier).
- [ ] Walk through Supabase Studio tables; understand `daily_challenges`.
- [ ] Review `15-security-practices.md` and run `bun audit`.
- [ ] Add at least one entry to `17-key-design-decisions.md` (even minor).

## For AI agents

- [ ] Load `docs/README.md` links into context window.
- [ ] Verify ability to call Supabase with anon key (read-only).
- [ ] After code edits, update relevant docs automatically.

---

When everything above is checked, you're fully onboarded.  Welcome to the team! 🎉 