# 11 – UI & UX Guidelines

This guide ensures that any new screen or component matches the established
look-and-feel of Brawl-Stars-Guess.  Follow these rules so additions blend
seamlessly with existing pages and players enjoy a consistent experience.

---

## 1. Design language at a glance

* **Theme** – Neon arcade / space-metal aesthetic (inspired by Brawl Stars UI).
* **Primary highlight colour** – *Brawl Yellow* (`#fdce36`).  Use for CTAs,
  borders, progress highlights.
* **Supporting accent colours** – red, green, blue variants declared in Tailwind
  config (`brawl-red`, `brawl-green`, `brawl-blue`).
* **Surface** – Dark navy/black backgrounds with translucent overlays
  (`bg-black/70`, `bg-[#181c3a]`).
* **Typography** – `font-sans` defaults to Inter; `font-abraham` for display
  headings (see custom font loaded in `index.html`).  Headings are bold, tight
  tracking with subtle text-stroke or glow.
* **Motion** – Subtle scale & glow (`card-reveal`, `heartbeat`, custom star
  keyframes).  Durations 0.2–0.6s; easing `cubic-bezier(0.34,1.56,0.64,1)` for
  pop effects.

### 1.1 Fonts import

The display font **Abraham** is loaded globally in `index.html`:

```html
<link rel="preload" href="/fonts/Abraham.woff2" as="font" type="font/woff2" crossorigin>
<style>
  :root { --font-sans: 'Inter', sans-serif; --font-abraham: 'Abraham', sans-serif; }
</style>
```

Ensure any new font files are added under `public/fonts/` and referenced the same way.

---

## 2. Tailwind tokens

```ts
// tailwind.config.ts excerpt
colors: {
  'brawl-yellow': '#fdce36',
  'brawl-red':    '#f64250',
  'brawl-green':  '#47ce56',
  'brawl-blue':   '#2d87f7',
}
```

### Usage

* Prefer semantic utility classes: `text-brawl-yellow`, `bg-brawl-yellow`.
* Opacity tweaks: `bg-brawl-yellow/80` or `text-brawl-yellow/90`.
* Avoid inline hex codes unless unavoidable (e.g. rare gradient).

---

## 3. Component patterns

The project relies on **shadcn-ui** primitives in `src/components/ui` and domain
components in `src/components`.

### 3.1 Buttons

```tsx
import { Button } from '@/components/ui/button'
<Button variant="default">Play</Button>
```

Button variants extend shadcn default options:

| Variant   | Styles (Tailwind)                                        | When to use                   |
| --------- | -------------------------------------------------------- | ----------------------------- |
| `default` | `bg-brawl-yellow text-black shadow-lg`                   | Primary actions (Start, Next) |
| `outline` | `border-2 border-brawl-yellow text-brawl-yellow`         | Secondary / cancel            |

### 3.2 Loading spinners

Use the circular spinner pattern already present:

```html
<div class="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
```

Keep diameter ≤ 64px.

### 3.3 Popups / Modals

* Use `dialog.tsx` (shadcn) or custom `VictoryPopup.tsx` style.
* Background overlay: `bg-black/70` + blur.
* Panel: `rounded-2xl border-4 border-brawl-yellow shadow-xl`.

---

## 4. Layout rules

* **Mobile-first**.  Components must look good at 320 px width.
* Use Flexbox + Tailwind utilities; avoid absolute positioning unless for
  decorative effects.
* Max page width 1400 px (`container` settings in Tailwind config).

---

## 5. Accessibility

* All interactive elements must be keyboard reachable (`tabindex`, `focus:ring`
  classes).
* Provide `aria-label` on non-textual buttons (icon-only).
* Colour contrast: target WCAG AA (example: `#fdce36` on `#181c3a` has 4.5:1).
* Animations should respect reduced-motion: wrap long loops in the
  `motion-safe:` prefix.

---

## 6. Internationalisation

The game uses an i18n helper (`src/lib/i18n.ts`).  Any new user-visible string
must go through the translation file—never hard-code English copy in JSX.

```tsx
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<h1>{t('home.title')}</h1>
```

---

## 7. Adding a new UI component

1. Place the file in `src/components/ui` if it's generic; otherwise in
   `src/components`.
2. Follow naming & export rules from `08-coding-standards.md`.
3. Re-use existing Tailwind classes or extend the theme in `tailwind.config.ts`.
4. Write a unit test in the same folder (`*.test.tsx`) verifying render &
   interaction.
5. Update this guide if you introduce new design tokens.

---

## 8. Design assets

Static images live in `public/` or imported via `@/assets`.  Optimise PNG/SVGs
before committing (use TinyPNG or svgo).  Keep individual asset ≤ 200 KB.

---

A polished, consistent UI builds player trust—stick to these guidelines and any
new feature will feel native to Brawl-Stars-Guess. 