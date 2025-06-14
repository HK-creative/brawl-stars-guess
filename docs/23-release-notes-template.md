# 23 – Release Notes Template

Use this Markdown template when publishing a new version.  Copy the structure
below into GitHub Releases or the `CHANGELOG.md` file, replacing placeholders
with real content.

---

## vX.Y.Z – YYYY-MM-DD

### 🚀 Features

- *feat*: Brief description of the new capability.
- *feat*: Another big improvement.

### 🐛 Fixes

- *fix*: What bug was resolved (#issue).
- *fix*: Additional bug description.

### 🛠 Maintenance

- *chore*: Dependency upgrades (`react 18.3 → 18.4`).
- *docs*: Updated docs/ files.

### 💥 Breaking Changes

- Detail what broke and migration steps.  Increment **MAJOR** version.

### Database migrations

| ID | Description |
| -- | ----------- |
| `2024-08-15-001` | Added `difficulty` column to `daily_challenges`. |

### Contributors

Thanks to:

- @github-handle
- 🤖 AI assistant

---

## How to use

1. Replace the version and date.
2. Group commits by type (feat, fix, chore, docs, etc.).
3. Link PR numbers or Issues where meaningful.
4. If there are schema migrations, fill in the table and reference
   `18-migrations-and-versioning.md`.
5. Tag the release: `git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z`. 