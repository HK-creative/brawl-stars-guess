# Survival Mode Frontend Remake Plan

## Overview
Complete frontend redesign of Survival Mode to align with Daily Mode's aesthetic while introducing unique game-like elements and a seamless victory flow.

## Current State Analysis

### Existing Survival Mode Structure
- **Main Component**: `src/pages/SurvivalMode.tsx`
- **Header**: `src/components/layout/SurvivalSharedHeader.tsx` 
- **Victory Flow**: Popup-based (`SurvivalVictoryPopup.tsx`)
- **Loss Flow**: Popup-based (`SurvivalLossPopup.tsx`)
- **Setup**: Popup-based (`SurvivalSetupPopup.tsx`)
- **Game Modes**: Classic, Gadget, StarPower, Audio, Pixels (all rendered conditionally)
- **Background**: Currently uses `RotatingBackground`
- **Orchestrator**: Uses `DailyModeTransitionOrchestrator`

### Daily Mode Elements to Copy Exactly
1. **Headers (h1)**: `ModeTitle` component with daily-mode-title class
2. **Search Bar (input)**: From `BrawlerAutocomplete` component  
3. **Page Background (div)**: `RotatingBackground` component
4. **Home Button (button)**: From `DailySharedHeader` (rounded button with bs_home_icon.png)

## Implementation Phases

### Phase 1: Header Removal & Replacement
**Goal**: Remove current survival header and replace with Daily-style elements

**Steps**:
1. Delete/comment out `SurvivalSharedHeader` component usage in `SurvivalMode.tsx`
2. Import and integrate `DailySharedHeader` pattern
3. Copy home button implementation exactly from `DailySharedHeader`:
   ```tsx
   <button
     onClick={() => navigate('/')}
     className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
   >
     <img src="/bs_home_icon.png" alt={t('button.go.home')} className="w-11 h-11" />
   </button>
   ```
4. Integrate `ModeTitle` component for h1 headers
5. Ensure `RotatingBackground` is properly implemented (already exists)

### Phase 2: Game Elements Redesign
**Goal**: Create new game-like UI for all non-copied elements

**Design Direction**:
- **Visual Style**: Modern gaming aesthetic with neon accents, particle effects, and dynamic animations
- **Color Palette**: Dark base with vibrant accent colors (yellows, greens, purples)
- **Typography**: Bold, impactful fonts with glow effects for important elements
- **Layout**: Card-based with depth, shadows, and glass-morphism effects

**Elements to Redesign**:
1. **Score Display**: 
   - Large, animated counter with particle effects on increase
   - Neon glow effect
   - Comic Sans or similar playful font

2. **Round Counter**:
   - Circular progress indicator with animated fill
   - Pulsing animation on round change
   
3. **Timer Display**:
   - Digital clock style with countdown animation
   - Red pulsing when < 30 seconds
   
4. **Guess Counter**:
   - Heart/life system visualization
   - Animated loss of "hearts" on wrong guess
   
5. **Game Cards**:
   - 3D transform on hover
   - Glassmorphism effect
   - Subtle particle background

6. **Buttons**:
   - Neon border with glow effect
   - Scale animation on hover
   - Ripple effect on click

### Phase 3: Victory Flow Transformation
**Goal**: Replace popup with inline animated victory section

**Technical Implementation**:
1. **State Management**:
   - Add `showingVictory` state to track victory display
   - Add `victoryTimer` state for 3-second countdown
   - Keep existing game state for seamless transitions

2. **Animation Sequence**:
   ```
   WIN → Fade out game elements (0.5s) → Fade in victory section (0.5s) → 
   Display for 3s with timer → Fade out victory (0.5s) → Fade in next round (0.5s)
   ```

3. **Victory Section Components**:
   - **8-bit Victory GIF**: Center, large display
   - **Victory Headline**: Bold, animated text with glow effect
   - **Score Section**: Points earned + total score with sliding numbers
   - **Timer Text**: "Next round in: 3... 2... 1..." with countdown animation

4. **Implementation Details**:
   ```tsx
   // When round is won
   const handleVictory = () => {
     setShowingVictory(true);
     setVictoryTimer(3);
     
     // Start countdown
     const interval = setInterval(() => {
       setVictoryTimer(prev => {
         if (prev <= 1) {
           clearInterval(interval);
           transitionToNextRound();
           return 0;
         }
         return prev - 1;
       });
     }, 1000);
   };
   ```

5. **Animation Classes**:
   - Use Framer Motion for smooth transitions
   - Stagger animations for visual interest
   - Respect reduced motion preferences

### Phase 4: Game Mode Element Animations (DEFERRED)
**Note**: Create reminder file for future implementation

**File**: `SURVIVAL-GAME-ELEMENTS-ANIMATION-TODO.md`

Content:
- Animate guess submissions
- Add particle effects on correct/wrong answers  
- Implement card flip animations
- Add celebration animations
- Create smooth transitions between modes

## File Structure Changes

### Files to Modify:
1. `src/pages/SurvivalMode.tsx` - Main refactor
2. `src/components/SurvivalVictoryPopup.tsx` - Transform to inline component
3. `src/components/SurvivalLossPopup.tsx` - Update styling

### Files to Create:
1. `src/components/SurvivalVictoryFlow.tsx` - New inline victory component
2. `src/components/ui/CircularTimer.tsx` - Countdown timer component
3. `src/components/ui/LivesCounter.tsx` - Visual guess counter
4. `SURVIVAL-GAME-ELEMENTS-ANIMATION-TODO.md` - Future animation tasks

### Files to Remove/Deprecate:
1. `src/components/layout/SurvivalSharedHeader.tsx` - No longer needed

## Mobile UI Audit (iPhone 12)

### Cross-Mode Findings
- __[Missing i18n]__ Title and labels show raw keys: `mode.title.survival`, `survival.round`, `survival.pts`, `survival.click.play.sound`.
- __[Duplicate search bars]__ A top search (visual-only) plus an in-card search appear together; confusing on mobile. Only one search should exist and be wired to gameplay.
- __[Vertical rhythm]__ Inconsistent spacing between header → search → stats → game card; large gaps on some modes.
- __[Glass card inconsistency]__ Stats card and game cards use different radii, borders, and blur intensity.
- __[Alignment]__ Chips in the stats row don’t perfectly center-align; label-weight balance feels off.
- __[Tap targets]__ Some controls may be near the 44×44 Apple minimum; verify icons and pills.
- __[Global header clutter]__ `Sign up`/`Log in` chips + home button crowd the top-left on mobile; review safe‑area and stacking.

### Classic Mode
- __[Results table cramped]__ Column headers collide: “RangeWallbreakRelease Year”. Needs horizontal scroll with min-width columns, or a compact mobile layout.
- __[Duplicate search]__ Two search inputs visible; keep one.

### Gadget Mode
- __[Heading hierarchy]__ “Guess the Brawler with this Gadget” style diverges from the new aesthetic; apply consistent card title styling.
- __[Spacing]__ Large gap between stats and gadget card; ensure consistent top/bottom paddings.
- __[Duplicate search]__ Two inputs; keep one.

### Star Power Mode
- __[Placeholder truncation]__ Input shows “Search Brawl…” cut off; adjust input padding, font-size, or container width.
- __[Spacing]__ Extra whitespace below stats; tighten.

### Pixels Mode
- __[Instruction block]__ Long instruction wraps oddly; ensure centered text with controlled max-width and consistent margins.
- __[Image card sizing]__ Pixel portrait needs fixed size and centering consistent with other modes.

### Audio Mode
- __[Missing i18n]__ “survival.click.play.sound” appears raw.
- __[Play control sizing]__ Ensure play button is ≥44×44 and visually centered with adequate contrast.
- __[Duplicate search]__ Two inputs; keep one.

### Navigation/HUD
- __[Home button position]__ Left-aligned home button sits close to global auth chips; consider moving into the header row or increasing top spacing with safe‑area insets.

### Action Items
- __[Unify search]__ Replace in-card searches with the single top `BrawlerAutocomplete` wired to gameplay; remove duplicates in modes:
  - `src/pages/ClassicMode.tsx`, `GadgetMode.tsx`, `StarPowerMode.tsx`, `AudioMode.tsx`, `PixelsMode.tsx`.
- __[i18n pass]__ Add missing keys and verify translations:
  - `mode.title.survival`, `survival.round`, `survival.pts`, `survival.click.play.sound`.
- __[Stats row polish]__ Center-align chips, normalize fonts, and ensure consistent glass style.
- __[Glass tokens]__ Extract shared card styles (radius, border, blur, shadow) into utilities/classes and apply to stats/game cards.
- __[Table mobile layout]__ Classic: wrap results in a horizontally scrollable container with sticky header and min-width columns; or switch to a stacked two-line layout on small screens.
- __[Spacing scale]__ Standardize vertical spacing (e.g., 16–20px between major blocks) across all modes.
- __[Safe‑area]__ Apply top/bottom safe-area insets to avoid notch overlap and crowding with global chips.
- __[Tap targets]__ Audit and bump any controls below 44×44.

### Mobile Fix Plan (iPhone 12)

#### P0 (Must-fix before release)
- __[i18n visible keys]__ Ensure all titles/labels render localized strings.
  - Files: `src/pages/SurvivalMode.tsx`, per-mode pages, any hardcoded labels.
  - Acceptance: No raw i18n keys visible anywhere; language toggle updates text instantly.
- __[Unify search]__ Keep only the top `BrawlerAutocomplete`; remove in-card inputs across modes and wire gameplay to the top one.
  - Files: `ClassicMode.tsx`, `GadgetMode.tsx`, `StarPowerMode.tsx`, `AudioMode.tsx`, `PixelsMode.tsx`.
  - Acceptance: Exactly one search field on the screen, fully functional for all modes.
- __[Classic table mobile layout]__ Provide horizontal scroll or stacked mobile layout with sticky header/min-width columns.
  - Acceptance: Headers readable (no collisions), smooth horizontal scroll, no layout shift.
- __[Spacing & alignment]__ Normalize vertical rhythm and center-align stats chips.
  - Acceptance: Consistent spacing between header → search → stats → card; chips visually centered with balanced label/number weight.
- __[Glass tokens unify]__ Apply a shared glassmorphism token set to stats/game cards.
  - Acceptance: Matching radius, border, blur, and shadow across cards.
- __[Safe-area top inset]__ Prevent crowding of auth chips and home button on notch devices.
  - Acceptance: No overlap with status bar/notch; 12–16px breathing space.

#### P1 (High priority polish)
- __[Input truncation]__ Fix placeholder clipping in Star Power; verify all modes.
- __[Instruction blocks]__ Constrain width and center text (Pixels); ensure consistent margins.
- __[Asset sizing]__ Normalize gadget/star/pixel image sizes and centering.
- __[Tap target audit]__ Ensure all interactive elements meet ≥44×44.

#### P2 (Nice-to-have)
- __[Header composition]__ Reconsider global chips/Home layout on mobile; potential single row or collapsible menu.
- __[Micro-animations]__ Subtle, reduced-motion-aware feedback for chips and counters.

#### QA Checklist (Mobile)
- iPhone 12 portrait/landscape, Android mid-range, small-width devices (<360px) smoke test.
- RTL pass (if supported) for header, chips, table scroll, and cards.
- Performance budget: 60fps during transitions; no layout thrash on scroll.

## Testing Checklist

- [ ] Victory flow transitions smoothly without popups
- [ ] 3-second timer works correctly
- [ ] All Daily elements copied exactly
- [ ] New game elements have consistent design
- [ ] Animations respect reduced motion preferences
- [ ] Mobile responsive design maintained
- [ ] RTL support maintained
- [ ] No gameplay logic changes
- [ ] Performance optimized (no lag in transitions)

## Risk Mitigation

1. **Backup Current Implementation**: Keep old components commented for rollback
2. **Incremental Testing**: Test each phase before moving to next
3. **Performance Monitoring**: Check for animation lag on lower-end devices
4. **Accessibility**: Ensure all animations have reduced-motion alternatives

## Success Criteria

1. ✅ Header elements match Daily Mode exactly
2. ✅ Victory flow is inline with 3-second timer
3. ✅ All game elements have new gaming aesthetic
4. ✅ Smooth animations throughout
5. ✅ No UX friction in round transitions
6. ✅ Maintains all existing functionality

## Next Steps

1. Create `SURVIVAL-GAME-ELEMENTS-ANIMATION-TODO.md`
2. Begin Phase 1 implementation
3. Test and iterate on each phase
4. Document any design decisions made during implementation
