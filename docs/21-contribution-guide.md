# 21 – Contribution Guide

We welcome pull requests from humans and AI agents alike!  Follow this guide to
get your changes reviewed and merged smoothly.

---

## 1. Getting started

1. **Fork** the repo (if external) or pull latest `main` if you're a collaborator.
2. Run through `01-quickstart.md` to ensure the project builds locally.
3. Create your feature branch:
   ```bash
   git checkout -b feat/<my-awesome-change>
   ```

---

## 2. Making changes

* Follow code conventions in `08-coding-standards.md`.
* Update or add tests; run `bun run test` – tests must pass.
* If adding UI, confirm design matches `11-ui-ux-guidelines.md`.
* If updating DB schema, create a migration (`18-migrations-and-versioning.md`).
* Keep logs clean; remove debug `console.log` before committing.

### Commit messages

Use Conventional Commits:

```
feat(audio): add pitch-shifting hint
fix(gadget): correct Sandy gadget name
```

---

## 3. Running linters & formatters

```bash
bun run lint      # ESLint
bun run test      # Vitest suite
bun run build     # Ensure production build succeeds
```

CI will enforce these checks.

---

## 4. Opening a Pull Request

When ready, push and open a PR against `main`:

* Fill in the pull-request template:
  * **What** changed and **why**.
  * Link to relevant Issue or Decision log entry.
  * Screenshots/GIFs for UI changes.
* **Draft** PRs are fine; mark Ready for Review when tests pass.

---

## 5. During code review

* Address review feedback promptly and squash fixup commits before merge.

---

## 6. Merge & release

* Reviewer clicks **Squash and merge** → `main`.
* CI deploys automatically (see `13-ci-cd-pipeline.md`).
* Maintainer tags a release and publishes notes (`23-release-notes-template.md`).

---

## 7. Contributor conduct

* Keep PRs focused—avoid mixing unrelated fixes.
* Document decisions in `17-key-design-decisions.md`