# 24 – AI-Agent Integration

This document is addressed to **any automated coding agent** (ChatGPT, Cursor,
Lovable, etc.) operating on this repository.  It sets the ground rules so AI
contributions are safe, consistent, and fully documented.

---

## 1. Read-first checklist

AI agent **must** load the following docs before making changes:

- `docs/README.md` (table of contents)
- `01-quickstart.md` (setup & scripts)
- `02-folder-structure.md` (where to place files)
- `08-coding-standards.md` (lint rules, exports)
- `11-ui-ux-guidelines.md` (design system)
- `15-security-practices.md` (secret handling)

Use these docs as constraints for code generation.

---

## 2. Allowed actions

1. Add/modify code in `src/` following coding standards.
2. Update or create Markdown docs inside `docs/` to reflect code changes.
3. Add test files ensuring coverage does not drop.
4. Update `package.json` dependencies **only** with rationale in PR body.

Anything outside this scope (e.g., changing GitHub settings) requires maintainer
approval.

---

## 3. Required updates after changes

| Change type | Docs to update |
| ----------- | -------------- |
| New component/page | `02-folder-structure.md`, `11-ui-ux-guidelines.md` if UI token added |
| New dependency | `04-tech-stack-and-dependencies.md` |
| DB schema change | `10-api-contracts.md`, `18-migrations-and-versioning.md` |
| Architectural refactor | `03-architecture-overview.md`, `17-key-design-decisions.md` |
| Build script changes | `01-quickstart.md`, `06-build-and-deployment.md` |

AI must commit doc updates in the **same PR** as code.

---

## 4. Commit standards for AI

Use Conventional Commits plus `[ai]` tag, e.g.:

```
feat(pixels): add high-res preview [ai]
```

Provide a descriptive body explaining reasoning and which docs were updated.

---

## 5. Testing and linting

AI must run:

```bash
bun run lint && bun run test && bun run build
```

before opening PRs (simulate via static analysis if runtime not available).

---

## 6. Safeguards

1. **No secrets** – Do not output or commit environment variables unless they are
   public (Supabase anon key).
2. **No large binary blobs** – Link to assets instead of embedding.
3. **No placeholder text** – All generated code must be functional; docs must be
   complete.

---

## 7. Self-healing loop

If CI fails, AI should:

1. Fetch the failure logs.
2. Fix the root cause.
3. Amend commits and push.
4. Post a PR comment summarising the fix.

---

## 8. Forbidden actions

- Force-pushing to `main`.
- Rewriting Git history.
- Removing docs without justification.
- Downgrading dependency versions without approval.

---

By following these rules, AI agents become first-class citizens of the
codebase—able to ship features autonomously while keeping human teammates
informed and confident. 