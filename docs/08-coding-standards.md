# 08 – Coding Standards

Consistent code reduces cognitive load for both humans and AI agents.  The
following conventions are enforced (or strongly recommended) across the entire
codebase.

---

## 1. Language & Syntax

* **TypeScript first** – All files under `src/` should be `.ts` or `.tsx`.
* **ES2020** features are allowed; avoid stage-3 proposals until shipped in
  Node LTS & browsers.
* Prefer **`const`** and **`let`**—`var` is banned.
* Use **optional chaining** `?.` and **nullish coalescing** `??` where
  appropriate to avoid verbose checks.

---

## 2. Project structure

Refer to `02-folder-structure.md` for directory layout. Key points here:

* React components live in `src/components` or `src/pages`.
* Custom hooks sit in `src/hooks` and start with `use` (ESLint will warn
  otherwise).
* Global stores go in `src/stores` and are implemented with Zustand.
* Avoid deep nesting (>3 levels); create a new top-level folder if needed.

---

## 3. File & Identifier naming

| Kind              | Convention                   | Example |
| ----------------- | ---------------------------- | ------- |
| React component   | `PascalCase`                 | `GameModeCard.tsx` |
| Hook              | `camelCase`, starts with `use`| `useBrawlerStats.ts` |
| Zustand store     | `camelCase` file exporting hook| `useAudioStore.ts` |
| Static asset      | `kebab-case`                 | `cup-icon.svg` |
| JSON fixture      | `snake_case`                 | `brawlers_full.json` |

No default exports; always use **named exports** so tree-shaking and refactors
are safer.

---

## 4. Formatting (Prettier defaults)

While we don't commit Prettier as a dependency, the repository follows its
**default settings**:

* 2-space indentation.
* Semicolons.
* Single quotes; JSX uses double quotes.
* Trailing commas where valid (ES2017+).

Most IDEs have Prettier built-in—enable "Format on Save".

---

## 5. Linting rules (ESLint)

Configuration: `eslint.config.js` (flat config).

Highlights:

* Extends `@eslint/js` recommended and `@typescript-eslint` recommended.
* React specific:
  * `react-hooks/rules-of-hooks` & `react-hooks/exhaustive-deps` enforced.
  * `react-refresh/only-export-components` warns if HMR would break.
* Disabled rules:
  * `@typescript-eslint/no-unused-vars` is off because TypeScript already
    catches this and some generics trigger false positives.

Run `bun run lint` to execute ESLint; CI will fail if `--max-warnings 0` is
breached (see future pipeline).

---

## 6. Import style

* Use the alias **`@/`** to reference the `src` root (configured in
  `vite.config.ts`).
* Group imports:
  1. Node built-ins
  2. External packages
  3. Internal modules (`@/...`)
  4. Relative (`./`, `../`)
* Sort alphabetically within each group. No enforced tooling yet—apply manually
  or use VSCode's Organise Imports.

---

## 7. Comments & documentation

* Use **JSDoc** style for exported functions/types when behaviour isn't obvious.
* Prefer *why* over *what*—the code already shows *what*.
* TODOs must include an owner or issue number, e.g.
  `// TODO(gh-123): replace hard-coded key with env var.`

---

## 8. React component guidelines

* Function components only; no `class` components.
* Top-level hooks first (`useState`, `useEffect`, etc.), then helpers, then
  render return.
* Keep components under ~200 lines; extract sub-components when needed.
* Side effects belong in `useEffect` with correct dependency arrays.
* Accessibility: use semantic HTML, `aria-*` props, and labels.

---

## 9. Test conventions

* Test files live next to the unit under test as `*.test.ts[x]` **or** inside
  `src/test/`.
* Use `describe`/`it` blocks from Vitest.
* Prefer **React Testing Library**; test behaviour, not implementation.
* Avoid mocking unless absolutely necessary; leverage Supabase local
  development or test doubles.

---

## 10. Style updates

Changes to these standards require a PR updating this file and—where
appropriate—the ESLint or formatter configuration. Consistency beats
individual preference. 