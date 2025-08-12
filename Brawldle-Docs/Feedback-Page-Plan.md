# Feedback Page — Functional Spec and Implementation Plan

Last updated: 2025-08-11T18:24:56+03:00
Owner: HK-creative / Brawldle

---

## 1) Context & Current State

- Route exists: `src/App.tsx` registers `"/feedback"` via lazy import of `src/pages/FeedbackPage.tsx`.
- Home entry: `src/pages/Index.tsx` renders a feedback pill that navigates to `"/feedback"`.
- Page stub: `src/pages/FeedbackPage.tsx` present but minimal.
- i18n: `src/lib/i18n.ts` includes `"home.feedback"` and `"feedback.submitted"`. Additional keys needed.
- Supabase: client present in `src/integrations/supabase/client.ts`; types in `src/integrations/supabase/types.ts`; project is live (see docs memory). No feedback table yet.

Constraint: The page must be accessible only from the Home page (product ask). Clarify whether deep-linking should be blocked or simply not advertised.

---

## 2) Goals & Non‑Goals

Goals
- Collect high-quality user feedback with minimal friction.
- Enforce "accessible only from home page" constraint while remaining user-friendly.
- Persist feedback to Supabase with privacy-first defaults and robust validation.
- Fully localized (HE/EN), RTL-aware, mobile-first, and accessible.
- Add analytics for submissions and drop-offs.

Non‑Goals (Phase 1)
- File/screenshot uploads.
- Authenticated feedback or moderation UI.
- Public feedback browsing.

---

## 3) UX & Interaction Design

Entry
- Visible only on Home: pill/button labeled with `t('home.feedback')`.
- Navigation: `navigate('/feedback', { state: { fromHome: true, ts: Date.now() } })`.

Guarding access
- On `FeedbackPage`, if `location.state?.fromHome !== true`, either:
  - Option A (strict): redirect to `/` and toast `t('feedback.redirect.from_home_only')`.
  - Option B (soft): render a friendly prompt with a button back to Home.
- Recommend Option A by default. Add a 10-minute timestamp grace check if we want to prevent stale session reuse.

Layout & Visuals
- Mobile-first single card on dark background (reuse `RotatingBackground` if consistent with site aesthetic).
- Header: top-left home/back button using existing Daily/Survival shared pattern (`/bs_home_icon.png`, `useNavigate` back home). Keep consistent with `DailySharedHeader`/`SurvivalSharedHeader` visuals.
- Animations: respect `useMotionPrefs`; subtle fade/scale on the card, no excessive motion.

Form controls
- Category (required): chips/toggles
  - bug, idea, ui, other
- Message (required): multiline textarea, 20–1000 chars
- Contact (optional): email/WhatsApp/phone; paired with consent checkbox
- Include context (optional, default ON): attaches non-PII telemetry (language, platform, viewport, userAgent, path, appVersion)
- Submit button: primary CTA; disabled when invalid or rate-limited

Feedback & States
- Success: toast `t('feedback.success')` (alias of `feedback.submitted`) + inline success state with "Back to Home" button.
- Error: toast `t('feedback.error.generic')` with retry affordance.
- Rate-limit: toast `t('feedback.rate_limited')` when local throttle trips.

Accessibility
- Focus trap inside dialog/card; clear focus order; labels and aria-describedby on inputs.
- Sufficient contrast; large touch targets; keyboard navigable chips.

Localization & RTL
- All strings via `t()`; Hebrew RTL-aware layout classes.
- Numeric fields force LTR when appropriate.

---

## 4) Data Model & Storage (Supabase)

Table: `feedback`
- Purpose: Store user-submitted feedback with optional contact and context metadata.

Columns
- id: `uuid` PK default `gen_random_uuid()`
- created_at: `timestamptz` default `now()`
- category: `text` CHECK in ('bug','idea','ui','other') NOT NULL
- message: `text` NOT NULL CHECK (char_length(message) BETWEEN 20 AND 1000)
- contact: `text` NULL (sanitized, max len 200)
- consent_contact: `boolean` NOT NULL default false
- lang: `text` NULL (e.g., 'he', 'en')
- app_version: `text` NULL (from package.json/version if available)
- path: `text` NULL (location.pathname at time of submit)
- user_agent: `text` NULL (navigator.userAgent, truncated)
- platform: `text` NULL (OS/browser summary)
- viewport: `text` NULL (e.g., '390x844')
- referrer: `text` NULL (document.referrer, truncated)

Indexes
- idx_feedback_created_at (created_at DESC)
- idx_feedback_category (category)

RLS (Row Level Security)
- Enable RLS on `feedback`.
- Policy: allow `anon` role to INSERT only.
- Policy: disallow SELECT/UPDATE/DELETE for `anon`.
- Service role can SELECT for admin analytics; no PII beyond optional contact string stored.

SQL (migration sketch)
```sql
-- Table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('bug','idea','ui','other')),
  message text not null check (char_length(message) between 20 and 1000),
  contact text check (char_length(contact) <= 200),
  consent_contact boolean not null default false,
  lang text,
  app_version text,
  path text,
  user_agent text,
  platform text,
  viewport text,
  referrer text
);

-- Indexes
create index if not exists idx_feedback_created_at on public.feedback (created_at desc);
create index if not exists idx_feedback_category on public.feedback (category);

-- RLS
alter table public.feedback enable row level security;

create policy feedback_insert_anon on public.feedback
  for insert to anon
  with check (true);

-- Optional: block everything else explicitly (Supabase defaults may already block)
revoke all on public.feedback from anon;
```

Client insert shape (example)
```ts
{
  category: 'bug' | 'idea' | 'ui' | 'other',
  message: string,
  contact?: string,
  consent_contact: boolean,
  lang?: string,
  app_version?: string,
  path?: string,
  user_agent?: string,
  platform?: string,
  viewport?: string,
  referrer?: string,
}
```

---

## 5) Validation, Anti‑Spam & Privacy

Client-side validation
- Category required.
- Message length 20–1000; trim whitespace; collapse repeated newlines.
- Contact optional; if present, must match simple email or international phone pattern.
- Consent checkbox required only if contact present.

Rate limiting & abuse prevention
- Local throttle: e.g., max 3 submissions / 10 minutes using `localStorage` key namespace `feedback:rl:v1`.
- Honeypot hidden field; if filled, silently drop with success toast (spam sink).
- Optional Phase 2: Turnstile/ReCAPTCHA if abuse is observed.

Privacy
- Only optional contact collected; consent gated.
- Context metadata (UA, viewport, etc.) is opt-in and considered non-PII in aggregate; truncate strings to safe lengths.
- No read access for anon via RLS; data visible only to service role/admin.

---

## 6) Analytics & Observability

Events
- `feedback_open` (source: home)
- `feedback_submit` { category, has_contact, lang, included_context }
- `feedback_error` { code }
- `feedback_rate_limited`

Logging
- Capture Supabase insert errors; include code and message.
- Supabase project logs can be queried for API insert failures.

---

## 7) i18n Keys (proposed)

Existing
- `home.feedback`
- `feedback.submitted` (alias `feedback.success`)

New
- `page.feedback.title`: "Feedback"
- `page.feedback.subtitle`: short helper copy
- `feedback.category.title`: "Type"
- `feedback.category.bug` | `.idea` | `.ui` | `.other`
- `feedback.message.label` / `.placeholder`
- `feedback.contact.label` / `.placeholder`
- `feedback.consent.label`: permission to contact back
- `feedback.include_context.label`: include technical details
- `feedback.submit`: CTA
- `feedback.success`: success toast/body (can reuse `feedback.submitted`)
- `feedback.error.generic`: generic error toast
- `feedback.rate_limited`: rate-limit message
- `feedback.redirect.from_home_only`: gate message when accessed directly

Localization
- Provide HE translations and ensure RTL classes on layout and chips.

---

## 8) Implementation Plan (Checklist)

Routing & Guard
- [ ] Update Home pill: pass `{ state: { fromHome: true, ts: Date.now() } }` to navigate
- [ ] Add guard in `FeedbackPage`: redirect or soft-block if not fromHome

UI & Accessibility
- [ ] Build page scaffold with header/back-to-home and animated card
- [ ] Implement chips (category), textarea (message), optional contact + consent, include-context toggle
- [ ] Wire `useMotionPrefs`; ensure reduced-motion fallback
- [ ] Add aria labels, proper focus management, keyboard navigation

Validation & Rate Limit
- [ ] Client validation (category/message/contact/consent)
- [ ] Honeypot hidden field + local throttle store

Storage
- [ ] Supabase migration: create `feedback` table, indexes, RLS
- [ ] Add TypeScript type to `src/integrations/supabase/types.ts`
- [ ] Implement insert via `supabase.from('feedback').insert(...)`
- [ ] Truncate long strings (UA/referrer) client-side

i18n
- [ ] Add proposed keys to `src/lib/i18n.ts` (EN/HE)

Analytics
- [ ] Fire events on open/submit/error/rate-limited

QA & Testing
- [ ] Unit: validation helpers
- [ ] Integration: happy path submit, error path, rate limit, guard behavior
- [ ] Manual: RTL layout, mobile breakpoints, screen reader pass

Docs
- [ ] Update `Brawldle-Docs/Change-Log.md` and `System-Architecture.md` (data flow, table)

---

## 9) Acceptance Criteria

- Guard: Direct navigation to `/feedback` from outside Home redirects back with toast (strict) or shows soft prompt (soft), per chosen option.
- Form validates and provides clear error messages; submit disabled when invalid.
- Successful submit shows success toast and resets form; data lands in Supabase.
- RLS prevents anonymous reading of feedback.
- Full HE/EN localization; RTL verified on HE.
- Accessibility: tabbable controls, aria labels, visible focus, screen-reader friendly.
- Rate limit prevents more than 3 submits in 10 minutes on a device.

---

## 10) Risks & Mitigations

- Abuse/spam: start with honeypot + local throttle; escalate to CAPTCHA if needed.
- Over-guarding: blocking legitimate deep links; mitigate with soft mode or a short grace window.
- PII handling: optional contact only; add clear consent language; restrict data access via RLS.
- Supabase insert failures: show friendly error with retry; log event; consider Edge Function fallback if needed.

---

## 11) Future Enhancements

- Screenshot/attachment upload with Storage + signed URLs.
- In-app feedback widget (floating) with session metadata.
- Admin dashboard to view/triage feedback.
- Category-specific follow-ups (e.g., bug template with steps and device info).

---

## 12) Appendices

A) Guard options text (HE/EN)
- EN: "Feedback is available from the Home page. Please go back and tap the Feedback button."
- HE: "משוב זמין מדף הבית בלבד. חזרו לדף הבית ולחצו על כפתור המשוב."

B) Example Analytics Payloads
```json
{
  "event": "feedback_submit",
  "props": {
    "category": "bug",
    "has_contact": true,
    "lang": "he",
    "included_context": true
  }
}
```
