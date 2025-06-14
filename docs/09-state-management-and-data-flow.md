# 09 – State Management & Data Flow

This document explains **where data lives** in the Brawl-Stars-Guess app, how it
flows between components, and the libraries used to keep UI, server, and local
storage in sync.

---

## 1. Libraries

| Concern          | Library                     | Why |
| ---------------- | --------------------------- | --- |
| Global client state | **Zustand**               | Tiny footprint, hooks-first, easy persistence |
| Server state / caching | **@tanstack/react-query** | Stale-while-revalidate, retries, devtools |
| Transient component state | React `useState`     | Built-in, obvious |
| Persistence (browser) | `zustand/middleware` `persist` | Saves JSON to `localStorage` automatically |

> Redux, MobX, etc. are **not** used; keep the stack minimal.

---

## 2. Global stores (Zustand)

| Store file                           | Purpose |
| ------------------------------------ | ------- |
| `src/stores/useDailyStore.ts`        | Tracks daily game modes (classic, gadget, audio, etc.): number of guesses, completion flags, fetched daily challenge brawler name, time until next reset. Persists across reloads. |
| `src/stores/useSurvivalStore.ts`     | Manages Survival Mode: game settings, per-round data, cooldown logic for brawler selection, timer, and guesses quota. Persists across sessions so players can refresh without losing progress. |

### Persistence layer

Both stores wrap `create()` with `persist(createJSONStorage(() => localStorage))`;
this serialises the subset of state returned by each action to
`localStorage`.  Versioning is currently implicit—if you change the store shape
make sure to add a migration or clear the store in the relevant action.

---

## 3. React Contexts

| Context file                     | Data provided | Consumer locations |
| -------------------------------- | ------------- | ------------------ |
| `LanguageContext.tsx`            | Current UI language & setter | Top-level `App.tsx` ➜ language dropdowns |
| `StreakContext.tsx`              | Daily streak counter, updater, supabase sync | Score page, Navbar indicator |
| `AuthModalContext.tsx`           | Controls visibility of sign-in/up modal | Buttons in header & protected routes |

Contexts wrap a `useState` plus helper functions; they should remain lightweight
and scoped to UI concerns only.  Heavy persistent state belongs in Zustand.

---

## 4. Server state with React Query

A single `QueryClient` is created in `App.tsx`.  While the current code mostly
uses Supabase calls directly, React Query is ready for:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['daily-challenge', mode],
  queryFn: () => fetchDailyChallenge(mode),
  staleTime: 1000 * 60 * 5, // 5 min
})
```

Guidelines:

* **Always** supply a stable `queryKey` array (`['table', id]`).
* `staleTime` and `cacheTime` should reflect how often the remote data changes.
* Prefer optimistic updates for mutation flows; see React Query docs.

---

## 5. Data fetch helpers (framework-agnostic)

All network calls live under `src/lib/` so they can be shared by stores,
components, and serverless functions.

| Helper file                       | What it does |
| --------------------------------- | ------------ |
| `lib/daily-challenges.ts`         | Fetches daily challenge rows from Supabase; calculates UTC+2 date & time until next reset. |
| `lib/auth.ts`                     | Wraps Supabase auth methods: sign-in, sign-out, session listener. |
| `lib/survival-logic.ts`           | Pure functions for survival quota & mode selection. |

These helpers should **never** import React—keep them testable and usable from
Edge Functions.

---

## 6. Data flow examples

### 6.1 Daily Classic mode

1. `DailyClassicMode.tsx` mounts.
2. `useDailyStore.initializeDailyModes()` runs, which:
   * Calls `fetchDailyChallenge('classic')` (Supabase) if not already fetched
     today.
   * Stores the answer brawler name in the Zustand store, persisted to
     `localStorage`.
3. Component local state (`useState`) tracks current guess input field.
4. On submit:
   * Component compares guess to store's `classic.brawlerName`.
   * Updates store via `incrementGuessCount` and potentially `completeMode`.
5. Store broadcasts via hook subscription → UI re-renders guess table & progress
   bar.

### 6.2 Survival mode round progression

1. Page calls `useSurvivalStore.initializeGame(settings)`.
2. User clicks "Start" → `startNextRound()` selects a random brawler/mode,
   respecting the two-round cooldown list.
3. Store state drives timer countdown component; `decrementGuess` updates
   remaining guesses.
4. When guesses or timer reach 0 → `gameOver()` sets `gameStatus` and modal
   shows summary.

---

## 7. Cross-tab / multi-device considerations

Because we persist to `localStorage`, state is **per-browser**.  Supabase could
persist progress server-side (see `StreakContext` implementation). If you add
cross-device sync:

1. Write mutations in `lib/...` that call Supabase `upsert` endpoints.
2. Invalidate relevant React Query keys so other tabs fetch new data.

Document changes in `10-api-contracts.md` and update this section accordingly.

---

## 8. Debugging tips

* Install the React Query Devtools (`npm i --save-dev @tanstack/react-query-devtools`)
  and add `<ReactQueryDevtools initialIsOpen={false} />` in development.
* Use `zustand` Chrome extension to inspect store snapshots (`yarn global add
  zustand-devtools-extension`).
* Enable verbose logging by patching helper functions (search for
  `console.log` statements in stores – they are already plentiful).

---

Data should have a **single source of truth**: component ➜ context ➜ store ➜
server.  Follow the layers above to avoid duplication and race conditions. 