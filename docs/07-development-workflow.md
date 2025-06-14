# 07 – Development Workflow

This document lays out the **day-to-day process** for contributing code—whether
you are a human developer or an automated AI agent.

The goal is to keep `main` green, readable, and deploy-ready at all times.

---

## 1. Branch strategy

* The permanent branch is **`main`** (production).  All work happens in feature
  branches then is merged via Pull Request.
* Use the following **naming convention**:
  * `feat/<short-kebab-description>` – new feature
  * `fix/<bug-id-or-short-desc>` – bug fix
  * `chore/<task>` – tooling, refactor, docs, CI, etc.

Examples:

```
feat/daily-mode-leaderboard
fix/audio-mode-stutter
chore/upgrade-react-18-4
```

---

## 2. Coding cycle

1. **Sync** – `git pull --rebase origin main`
2. **Branch** – `git checkout -b feat/awesome-thing`
3. **Work** – run the app locally:

   ```bash
   bun install           # first time only or after dep changes
   bun run dev           # starts Vite at http://localhost:5173
   ```

4. **Test & lint** before every commit:

   ```bash
   bun run lint          # ESLint (see eslint.config.js)
   bun run test          # Vitest suite
   ```

   Tests must pass; ESLint warnings should be fixed or explicitly justified.
5. **Commit** using Conventional Commits (see next section).
6. **Push** to origin and open a PR against `main`.
7. **Review** – at least one approval required (self-review allowed for trusted
   contributors, but another pair of human or AI eyes is encouraged).
8. **Merge** – use **squash merge** to keep history linear and generate a
   meaningful commit message.

---

## 3. Commit message format (Conventional Commits)

```
<type>(optional scope): <subject>

<body>
```

* `type` = `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `build`.
* Capitalise the subject, no trailing period.
* Wrap body lines at 72 chars; explain *why* the change is needed.

Examples:

```
feat: add Survival endless mode
fix(pixels): correct RGB threshold comparison
```

> While we don't run commitlint yet, following this format keeps history tidy
> and makes future automation (release notes, changelog) trivial.

---

## 4. Pull Request checklist

- [ ] All tests pass (`bun run test`)
- [ ] Lint is clean (`bun run lint`)
- [ ] If UI changes, screenshots or screen recording attached
- [ ] Relevant docs updated (e.g., `docs/` or README badges)
- [ ] Added/updated unit or integration tests
- [ ] No sensitive env variables committed

---

## 5. Code review guidelines

* Focus on *clarity, correctness, and consistency.*
* Ask "Could an AI agent unfamiliar with the file understand this?"—if not,
  request clearer naming or comments.
* Prefer suggestions over nit-picks.  The PR author owns final decisions unless
  the change introduces a bug or violates coding standards.

---

## 6. After merge

1. GitHub Actions (see `06-build-and-deployment.md`) builds the front-end and,
   if `supabase/functions/` has changed, deploys Edge Functions.
2. The static host picks up the new bundle; SSR/CDN caches are purged.
3. Tag the release manually if it's a milestone (`vX.Y.Z`), then update the
   changelog (`23-release-notes-template.md`).

---

### Automation hooks (future work)

* **Pre-commit** – add Husky + lint-staged to run ESLint & Vitest.
* **Release notes** – generate from Conventional Commits.

Until those are in place, humans and AI agents must follow this workflow
manually—**this document is the source of truth**. 