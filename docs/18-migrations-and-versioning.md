# 18 – Migrations & Versioning

Managing change safely is as important as building new features. This document
explains how we version the codebase and database schema, and how to run
migrations in local/dev/prod environments.

---

## 1. Application versioning (semver)

We follow **Semantic Versioning 2.0.0** for tags and release notes.

| Segment | Meaning                                      |
| ------- | -------------------------------------------- |
| MAJOR   | Breaking change in API, DB schema, or UX that requires user adaption |
| MINOR   | Back-compatible feature addition             |
| PATCH   | Bug fix or non-breaking internal improvement |

Tags are created manually after a successful deploy:

```bash
git tag -a v1.3.0 -m "feat: survival mode leaderboards"
git push origin v1.3.0
```

Release notes come from `23-release-notes-template.md`.

---

## 2. Database schema migrations (Supabase)

At the moment the schema was created via the Supabase dashboard and no SQL
migration files exist in the repo. **All future schema changes must be
captured via migration scripts** so that CI and new contributors can spin up an
identical database.

### 2.1 Creating a migration

1. Install CLI: `bunx supabase update` (or `brew install supabase/tap/supabase`).
2. Authenticate: `supabase login`.
3. Start local DB (first time):
   ```bash
   supabase init       # creates supabase/ directory if missing
   supabase start      # runs Postgres in Docker
   ```
4. Make schema changes using the localhost Studio (`http://localhost:54323`).
5. Generate diff:
   ```bash
   supabase db diff --file supabase/migrations/<timestamp>_add_profiles.sql
   ```
6. Commit the SQL file; push PR.

### 2.2 Applying migrations in CI / prod

The CI deploy step should run:

```bash
supabase db push --project-id zkqlqveltfxvelxzyyik --non-interactive
```

Add this command after Edge Function deploy in the GitHub Actions workflow once
migrations exist.

---

## 3. Data migrations

Small data fixes (e.g., updating `daily_challenges` seed rows) can be executed
via a one-off Edge Function or Supabase SQL script. Record the script in
`supabase/migrations/data/` with date prefix and reference it here.

---

## 4. Deprecation policy

1. Mark the feature or API as **Deprecated** in the docs and release notes.
2. Keep backwards compatibility for **one minor** release.
3. Remove code & feature flag in the next **major** version.

---

## 5. Version compatibility matrix

| App version | DB schema version | Note |
| ----------- | ----------------- | ---- |
| ≥ 1.0.0     | `2024-08-01-001`  | initial launch |

Update this table whenever a schema migration is merged.

---

## 6. Checklist for PRs affecting schema

- [ ] SQL migration file added in `supabase/migrations/`.
- [ ] `src/integrations/supabase/types.ts` regenerated.
- [ ] `10-api-contracts.md` updated.
- [ ] Version matrix above updated if needed.

Following these steps ensures anyone—human or AI—can reproduce the exact state
of the application with a single `supabase start`. 