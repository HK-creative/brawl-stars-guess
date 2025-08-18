# Daily Modes Motion System & Transition Playbook

A comprehensive, mobile-first motion plan to replace the generic transition with Apple-level polish and Duolingo-like delight across all Daily modes.

---

## Objectives
- Deliver smooth, personality-rich transitions for Daily modes: Classic, Gadget, Star Power, Audio, Pixels.
- Remove the current single in/out transition and replace with orchestrated, element-specific motion.
- Preserve UX constraints and performance on mobile (90–95% traffic).

## Do/Do-Not During Mode Switch
- Do NOT animate: home button, streak counter & icon, non-active nav icons, search bar, the literal text `Guesses`, the literal text `Yesterday:`, the `Next in` label and its countdown.
- DO animate: previous and new nav icons, mode title, main content square, outline color of the square, guesses number (not the `#`), guesses history, yesterday’s brawler name.

## Motion Principles (Apple polish × Duolingo playfulness)
- Physics-inspired, short and crisp. Primary timings: Fast 120ms, Base 180ms, Gentle 240ms, Emphatic 320ms.
- Curves: `easeOutQuad` (UI exits), `easeInOutQuart` (position/scale), `spring(260, 24)` for hero elements.
- Stagger: 40–70ms between sibling elements. Never all-at-once.
- Depth: light parallax for the content square and soft drop-shadows to ground motion.
- Restraint: keep most motions under 320ms; reduce clutter.
- Respect `prefers-reduced-motion`: swap to fades/opacities only, zero parallax.

## System Architecture (Implementation-facing)
- Orchestrator: `src/components/motion/MotionOrchestrator.tsx` (new) centralizes variants, tokens, and sequencing.
- Tokens: `src/styles/motion-tokens.ts` (new) exporting durations, easings, radii, z-indices.
- Replace generic transition in `src/components/layout/PageTransition.tsx` with route-aware or mode-aware orchestration.
- Use `Framer Motion` features already present: `AnimatePresence`, `LayoutGroup`, variants, shared layout IDs.
- A11y helpers: `useMotionPrefs()` (new) to read browser preference; ARIA live region for mode announcements.

## Between-Mode Transition Blueprint (Global Sequence ~650–900ms total)
1) __Freeze constants__: lock layout of non-animating items to prevent reflow.
2) __Nav icons (previous→next)__: progress dot slides along the track; outgoing icon scales to 0.92 and desaturates; incoming icon scales 1.08→1.0 with a soft glow pop. 180–220ms.
3) __Title__: letter-level upward lift and fade out (outgoing), then new title drops in with slight overshoot and color pulse aligned to mode color. 160–220ms.
4) __Main content square (hero)__: outgoing content does a 3° tilt and 0.96 scale while the outline performs a liquid color wipe from previous mode color to next; content cross-zooms and blurs. Incoming content appears with a spring 0.96→1.0 and a soft shadow catch. 240–320ms.
5) __Outline color swap__: gradient ring wipe L→R (or RTL aware) matched to nav direction. 180ms.
6) __Guesses number (#N only)__: odometer roll: outgoing number slides up and fades; incoming slides from below, using `sliding-number.tsx`. 140–180ms.
7) __Guesses history__: outgoing list collapses with a blur-down; incoming cards cascade bottom-up with 50ms stagger and slight elevation. 220–280ms.
8) __Yesterday’s brawler name__: smart text replace: crossfade+blur 4px; keep `Yesterday:` static. 120–160ms.
9) __Micro polish__: subtle haptic (where available), confetti-lite sparkles only on milestones (e.g., first visit of the day, streak increments), never on each switch.

Note: For RTL, invert directional moves; for low-end devices, disable shadows and reduce blur radius.

## In-Mode Micro-Interactions (Per Mode)
- __Classic__: filter chips glide, metrics cards pop on reveal, row insertions animate height/opacity with stagger.
- __Gadget__: icon gets a quick dice-roll spin (12° swing) on hover/tap; green outline pulses subtly on correct guess.
- __Star Power__: radial flare burst (opacity-only for reduced motion); subtle rotation of star emblem (8°) on entry.
- __Audio__: waveform shimmer in sync with playback; play button morphs to pause with liquid corner rounding.
- __Pixels__: pixel-scramble on entry (8×8 to full res) then settle; slight CRT-like glow pulse on hover/tap.

## Element-specific Specs
- __Nav (active + previous only)__: spring scale, glow ring, dot slide. Inactives remain static.
- __Title__: character-level motion with `key`ed spans; avoids layout shift by reserving block height.
- __Content square__: shared layout ID across modes; crossfade + perspective tilt (2–4°), soft drop-shadow catch.
- __Outline color__: gradient wipe aligned to nav direction; supports RTL inversion.
- __Guesses number__: reuse `src/components/ui/sliding-number.tsx`; animate numeric glyphs only.
- __Guesses history__: `LayoutGroup` list with item variants; entrance stagger; exit blur-down.
- __Yesterday’s brawler name__: text crossfade; preserve baseline and width with `min-width` for smoothness.

## Performance & Safety
- Aim 60 FPS on mid-tier Android; cap blur radius; avoid heavy box-shadow on large surfaces.
- Throttle parallax based on `deviceMemory` if available; provide `reduced` mode.
- Preload next mode’s assets (hero images/audio) on hover/near-edge of carousel.

## Accessibility
- Respect `prefers-reduced-motion`.
- Provide ARIA live region announcing: "Mode changed to <name>".
- Maintain focus order; never trap focus during transitions.
- Sufficient color contrast for outline and title across themes.

## QA Checklist (per mode)
- Frame pacing under network throttling.
- RTL directionality validated.
- Reduced-motion parity verified.
- iOS Safari, Chrome Android, Firefox Android spot checks.
- No layout shift for non-animating items.

---

# Kanban Tracker

## Remaining
- Orchestrator component and motion tokens scaffolding.
- Replace generic `PageTransition` with orchestrated flow.
- Implement nav icon previous/new animation.
- Implement title letter-level transitions.
- Implement content square hero transition and outline color liquid wipe.
- Hook odometer-style guesses number using `sliding-number.tsx`.
- Implement list cascade for guesses history.
- Implement yesterday’s brawler crossfade swap.
- Add `useMotionPrefs()` and ARIA live region.
- Performance guardrails for low-end devices; reduced-motion variants.
- Mode-specific micro-interactions (Classic/Gadget/Star Power/Audio/Pixels).
- RTL and mobile QA sweep; finalize polish.

## In Progress
- Comprehensive motion spec (this document).

## Finished
- Recon of codebase motion touchpoints (`PageTransition`, `ModeTitle`, `sliding-number`).
- Inventory of elements to animate vs keep static.
 - Implement and QA Audio mode animations.
 - Implement and QA Classic mode animations.
 - Implement and QA Star Power mode animations.
 - Implement and QA Pixels mode animations.

---

## Implementation Notes (for engineers)
- Stage variants in `MotionOrchestrator`; export named variants per element.
- Use `LayoutGroup` and `AnimatePresence` around the content square and title.
- Gate motion by `reducedMotion` and `devicePerformance` heuristics.
- Keep durations in tokens; avoid magic numbers inside components.
- Add unit tests for variant presence and `prefers-reduced-motion` behavior where feasible.
