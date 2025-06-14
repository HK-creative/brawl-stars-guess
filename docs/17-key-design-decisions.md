# 17 – Key Design Decisions

This file records architectural and tooling choices that shape the project.
Each entry states the decision, rationale, alternatives considered, and date.
Keeping this log prevents future churn and helps new contributors understand
*why* things are the way they are.

> When you make a significant change (swap a library, adjust a data model, etc.)
> **append a new entry** instead of editing history.

---

## 2024-08-**Initial build**

| Decision | Details |
| -------- | ------- |
| **Front-end framework** | **React 18 + Vite** chosen for fast dev experience, built-in HMR, and large ecosystem. Alternatives: Next.js (SSR unnecessary), Svelte (team unfamiliar). |
| **State management** | **Zustand** for client state because it's <1 KB, hook-based, and persists easily. Redux rejected (boilerplate), Context-only rejected (performance). |
| **Server state** | **@tanstack/react-query** adopted for caching Supabase queries. Alternatives: SWR (similar but less configurable). |
| **Backend** | **Supabase** selected to avoid running/maintaining our own server; provides Postgres, Auth, Edge Functions, and RLS. Firebase rejected (NoSQL). Hasura rejected (heavier). |
| **Daily challenge generation** | Implemented as Supabase Edge Function + `pg_cron` for deterministic midnight UTC+2 reset. Simpler than maintaining external CRON service. |
| **Hard-coded Supabase anon key** | Embedded in client to eliminate setup friction for new contributors. Security risk evaluated as acceptable: key has row-level read-only access. |
| **Design tokens** | Custom Tailwind colours (`brawl-yellow`, etc.) added to match Brawl Stars brand. |
| **Testing stack** | Vitest chosen for Jest-compatible API, JSX transform parity, and first-class Vite integration. |

---

*Add new decisions below using the template:*

```md
### YYYY-MM-DD – <Short title>

**Decision**: <one-sentence summary>

**Rationale**: <why we chose this>

**Alternatives considered**: <rejects>

**Consequences**: <impact on code, dev workflow, users>
``` 