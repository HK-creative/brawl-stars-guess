# 20 – Glossary

A shared vocabulary prevents misunderstandings.  This glossary defines domain
terms, abbreviations, and internal nicknames used throughout the codebase and
documentation.

| Term | Definition |
| ---- | ---------- |
| **Brawler** | Playable character in Brawl Stars; core entity guessed in all game modes. |
| **Daily Mode** | Time-limited challenge that resets every day at midnight UTC+2. Includes Classic, Gadget, Star Power, Audio, Pixels. |
| **Classic Mode** | Guess the brawler's name based on textual hints. |
| **Gadget Mode** | Identify the brawler from one of their gadgets. |
| **Star Power Mode** | Identify the brawler from a star power ability. |
| **Audio Mode** | Guess the brawler from an attack sound file. |
| **Pixels Mode** | Guess the brawler from a heavily pixelated sprite. |
| **Endless Mode** | Unlimited guessing until streak is broken. |
| **Survival Mode** | Round-based mode with decreasing guess quota; ends when quota exhausted. |
| **Guess Count / Attempts** | Number of guesses the player has made in the current mode. |
| **Streak** | Consecutive days the player completed at least one daily mode. |
| **UTC+2** | Timezone used for daily resets (aligns with central European summer time). |
| **Challenge Data** | JSON blob stored in `daily_challenges.challenge_data` containing mode-specific info. |
| **Edge Function** | Supabase serverless function written in Deno. Used for cron generation of challenges. |
| **RLS** | Row Level Security—Postgres feature enforced by Supabase to secure tables. |
| **Supabase Anon Key** | Public API key granting read-only access to tables with permissive RLS. |
| **Service Role Key** | Secret Supabase key with full privileges—only in Edge Function runtime. |
| **PKCE** | Proof Key for Code Exchange—OAuth flow used in Supabase Auth. |
| **shadcn-ui** | Tailwind-based component collection used for UI primitives. |
| **Zustand** | Lightweight React state-management library used for game stores. |
| **React Query** | Library managing server state & caching. |
| **Vitest** | Fast unit-test runner compatible with Jest API. |
| **Bun** | JS runtime and package manager powering local scripts and builds. |

_Add new terms as they appear._ 