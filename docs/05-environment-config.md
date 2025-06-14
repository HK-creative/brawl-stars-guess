# 05 – Environment Configuration

This project is designed to run **out-of-the-box**.  No `.env` file is required
for local development; all critical values are hard-coded where appropriate to
keep onboarding trivial.  That said, you might want to override certain
settings when pointing the app at your own Supabase instance or when deploying
via CI.

The sections below document every environment variable recognised by the code
base and the context in which it is used.

---

## 1. Local Development (React app)

*No env vars needed.*  The Supabase connection details are embedded in
`src/integrations/supabase/client.ts`:

```ts
const SUPABASE_URL = "https://zkqlqveltfxvelxzyyik.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJh...<truncated>...hJhekY";
```

If you want to connect to a different Supabase project:

1. Duplicate `src/integrations/supabase/client.ts` into
   `src/integrations/supabase/client.local.ts` (or similar) and change the
   constants.
2. Update your imports (or set up a path alias) so the app uses the new file.

> We deliberately hard-coded these values so first-time contributors don't have
> to fiddle with secrets just to get "npm start" working.

---

## 2. Supabase Edge Functions

Edge Functions run inside Supabase's Deno environment.  They rely on **admin-
level credentials** injected automatically by Supabase at runtime:

| Variable                    | Used in                                             | Why |
| --------------------------- | --------------------------------------------------- | --- |
| `SUPABASE_URL`              | `supabase/functions/*/index.ts`                     | Creates the Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase/functions/*/index.ts`                     | Grants row-level insert/update permissions |

You never need to set these locally; the Supabase platform wires them up.

---

## 3. Continuous Integration (CI)

If you introduce CI workflows that build or test the front-end you generally
won't need additional secrets.  However, if you want to run **integration
tests** that hit a live database you can export the same pair of variables
shown above in your CI provider's secret vault.

Example (GitHub Actions):

```yaml
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

Note: use the *anon* key for test suites—**never** commit the service-role key
to CI logs.

---

## 4. Customising Environment-Specific Behaviour

Vite recognises variables prefixed with `VITE_`.  The current codebase doesn't
read any `import.meta.env.*` keys, but if you add some later:

1. Define them in a `.env` file at the project root.
2. Access via `import.meta.env.VITE_YOUR_VAR` in code.

Document new variables here and keep this list authoritative.

---

### Recap

* **Local dev** – zero config.
* **Edge Functions** – Supabase injects `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`.
* **CI / Custom envs** – export vars as needed and update this doc.

No other environment variables are recognised by the application. 