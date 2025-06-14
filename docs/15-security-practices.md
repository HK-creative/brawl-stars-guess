# 15 – Security Practices

Although Brawl-Stars-Guess is "just a game," it still handles user accounts and
runs privileged serverless functions.  The guidelines below protect player data
and prevent accidental leaks or abuse.

---

## 1. Authentication & Authorisation

| Factor                | Implementation |
| --------------------- | -------------- |
| **Auth provider**     | Supabase Auth (OAuth & email) |
| **Client flow**       | PKCE with `supabase-js` 2.x (`AuthPage.tsx`, `AuthCallback.tsx`) |
| **Session storage**   | `localStorage` key `brawldle-auth-token` |
| **Row-level security**| Enabled on all tables; `profiles` table policies restrict `select`, `update`, `insert` to `auth.uid()` |

### Checklist when adding new tables

1. Enable RLS (`alter table <name> enable row level security;`).
2. Create policies scoped to `auth.uid()` or appropriate role.
3. Regenerate `src/integrations/supabase/types.ts` and update `10-api-contracts.md`.

---

## 2. Secret management

| Secret                           | Where stored            | Visibility |
| -------------------------------- | ----------------------- | ---------- |
| Supabase **Anon** key            | Embedded in client (public) |
| Supabase **Service Role** key    | Never committed; injected into Edge Function runtime |
| Vercel / Netlify tokens          | GitHub Actions secrets   | Maintainers only |
| Supabase Personal Access Token   | GitHub Actions secrets   | Maintainers only |

Never commit the Service Role key or personal tokens.

---

## 3. Cross-Site Scripting (XSS)

* Only one occurrence of `dangerouslySetInnerHTML` exists (`ui/chart.tsx`) and
  injects **static** CSS, not user content—risk accepted.
* When adding new HTML injections ensure the content is **static** or sanitised.
* Use React's default escaping; never set raw HTML for user-generated data.

---

## 4. Content Security Policy (CSP)

Static hosts should send:

```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://zkqlqveltfxvelxzyyik.supabase.co; img-src 'self' data:; media-src 'self' https://cdn.brawlstars.com;
```

Adjust `media-src` as you add external assets.

---

## 5. Dependency security

* Use `bun audit` monthly (schedule in GitHub Actions) to detect vulnerable
  packages.
* Accept patch updates promptly; semver minor/major need manual review.
* Remove unused packages to minimise surface area.

---

## 6. Edge Function hardening

* Validate incoming payloads—even though functions are invoked internally—using
  Zod or TypeBox if you add request bodies.
* Log errors but **do not** return stack traces to the client.
* Use `const` for env vars (`Deno.env.get`) outside the handler to prevent
  accidental re-reads.

---

## 7. Rate-limiting & abuse prevention

Current version has no public write endpoints.  If you expose new functions:

1. Enable Supabase **Edge Function JWT verification** (`verify_jwt` flag).
2. Consider Cloudflare proxy with rate-limit rule.

---

## 8. Secure headers

Ensure your static host adds:

* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Referrer-Policy: strict-origin-when-cross-origin`

Vercel, Netlify, and Cloudflare all support header config files.

---

## 9. Local development safety

* Dev server runs on `localhost`; Supabase keys are test-level only.
* Do **not** test with production keys locally.

---

## 10. Security review checklist for PRs

- [ ] No secrets committed.
- [ ] New tables have RLS enabled.
- [ ] Edge Functions validate input.
- [ ] Static HTML injections audited for XSS.
- [ ] Dependency diff free of known CVEs (`bun audit`).

Maintaining these practices keeps the game fun **and** safe. 