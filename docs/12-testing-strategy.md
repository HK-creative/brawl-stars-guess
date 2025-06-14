# 12 – Testing Strategy

Automated tests give us confidence that refactors or AI-generated changes don't
break gameplay.  This project uses **Vitest** for unit & integration tests and
**@testing-library/react** for component testing.

---

## 1. Test pyramid

1. **Unit tests** (fast, most numerous) – pure functions in `src/lib/`, Zustand
   store logic.
2. **Component tests** – React Testing Library, no mocking of internal
   implementation.
3. **Integration tests** (light) – high-level component trees with mocked
   Supabase responses.
4. **E2E tests** – *not yet implemented*; Playwright is the preferred tool (see
   roadmap issue #39).

---

## 2. Tooling & configuration

| Tool                       | Config location                      |
| -------------------------- | ------------------------------------ |
| **Vitest**                 | `vite.config.ts` • `src/test/setup.ts` |
| **React Testing Library**  | Imported per test file (`render(...)`) |
| **jsdom** environment      | Enabled via `environment: 'jsdom'` in vite config |
| **Coverage (v8)**          | `bun run coverage` – outputs to `coverage/` |

### 2.1 Setup file

`src/test/setup.ts` runs before each suite.  Use it to:

* Add custom matchers (`@testing-library/jest-dom` if installed).
* Stub browser APIs (e.g. localStorage, Audio).
* Reset mocks with `vi.resetAllMocks()` if needed.

---

## 3. Writing tests

### 3.1 Pure functions

```ts
import { describe, expect, it } from 'vitest'
import { calculateNextGuessesQuota } from '@/lib/survival-logic'

describe('calculateNextGuessesQuota', () => {
  it('scales every 5 rounds', () => {
    expect(calculateNextGuessesQuota(1)).toBe(10)
    expect(calculateNextGuessesQuota(6)).toBe(9)
  })
})
```

### 3.2 React components

```tsx
import { render, screen } from '@testing-library/react'
import GameModeCard from '@/components/GameModeCard'

it('shows mode title', () => {
  render(<GameModeCard mode="classic" />)
  expect(screen.getByText(/classic/i)).toBeInTheDocument()
})
```

### 3.3 Zustand stores

Use the store hook directly:

```ts
import { useDailyStore } from '@/stores/useDailyStore'
import { act } from '@testing-library/react'

it('increments guess count', () => {
  const store = useDailyStore.getState()
  act(() => store.incrementGuessCount('classic'))
  expect(store.classic.guessCount).toBe(1)
})
```

Remember to **reset the store** after each test to avoid bleed-over:

```ts
afterEach(() => {
  useDailyStore.setState(useDailyStore.getInitialState())
})
```

---

## 4. Mocking Supabase

We generally avoid heavy mocks.  For unit tests, import helper functions with
fake data.  When you must stub Supabase:

```ts
vi.spyOn(supabase, 'from').mockReturnValue({
  select: () => ({ eq: () => ({ single: async () => ({ data: { challenge_data: 'Spike' } }) }) })
} as any)
```

Do **not** commit service-role keys in tests.  Use anonymous data.

---

## 5. Running tests

```bash
bun run test      # fast run (no coverage)
bun run coverage  # prints summary & html report in coverage/
```

Vitest runs in threads; expect near-instant feedback.

---

## 6. CI expectations

The future GitHub Actions pipeline will execute `bun run test` on every PR.
Tests must pass; coverage must not drop below 80 % (to be enforced once
coverage is meaningful).

---

### Where to put tests

* Co-locate next to code: `BrawlerGuessRow.test.tsx`.
* Utility libraries can live in `src/test/` if used across many files.

Keep test titles descriptive; favour behaviour over implementation.  Remember
that clear tests serve as living documentation for future AI agents. 