# Daily Challenge Modes Single Page Migration Plan

## 0 · Reconnaissance Summary

### Current Architecture
- **5 separate daily mode pages**: `DailyClassicMode.tsx`, `DailyGadgetMode.tsx`, `DailyStarPowerMode.tsx`, `DailyAudioMode.tsx`, `DailyPixelsMode.tsx`
- **5 separate routes**: `/daily/classic`, `/daily/gadget`, `/daily/starpower`, `/daily/audio`, `/daily/pixels`
- **Shared components**: `DailyModeProgress.tsx` (navigation), `ModeTitle.tsx` (animated titles), `PageTransition.tsx` (page transitions)
- **State management**: `useDailyStore.ts` (Zustand with persistence) - already unified across all modes
- **Navigation**: React Router `useNavigate()` calls to switch between routes
- **Browser titles**: Each mode sets its own page title via `usePageTitle` hook
- **Animations**: Framer Motion for page transitions, mode icon scaling, title cross-fades

### Key Dependencies
- React Router for navigation between `/daily/*` routes
- Zustand store already unified (no per-page state isolation)
- Shared styling via CSS classes (`.daily-mode-container`, `.daily-mode-title`, etc.)
- i18n translations consistent across modes
- All modes use same background (`RotatingBackground`), navigation (`DailyModeProgress`), and UI components

### Critical Constraints
- **Zero UX regression**: User experience must be 100% identical
- **Cross-device compatibility**: Mobile, tablet, desktop layouts preserved
- **Multi-language support**: All translations and RTL support maintained
- **State preservation**: Game progress, guesses, completion status unchanged
- **Animation continuity**: All existing transitions and effects preserved

---

## 1 · Migration Strategy

### Core Approach: Single Page with Conditional Rendering
Replace 5 separate routes with 1 unified `/daily` route that conditionally renders the appropriate mode component based on URL parameter or internal state.

### State Management Pattern
- **URL-based mode selection**: `/daily?mode=classic` or `/daily/classic` (maintain backward compatibility)
- **Internal mode state**: Track current mode in component state (not Zustand to avoid persistence conflicts)
- **Seamless transitions**: Replace `navigate()` calls with state updates + animations

---

## 2 · Implementation Checklist

### Phase 1: Foundation Setup
- [ ] Create new `DailyModesPage.tsx` as the unified daily modes container
- [ ] Extract common layout/structure from existing daily mode pages
- [ ] Create mode-specific sub-components from existing page logic
- [ ] Implement URL parameter parsing for mode selection (`useSearchParams` or route params)
- [ ] Set up conditional rendering logic for each mode

### Phase 2: Component Extraction & Refactoring
- [ ] Extract `DailyClassicModeContent.tsx` from `DailyClassicMode.tsx` (remove navigation/routing logic)
- [ ] Extract `DailyGadgetModeContent.tsx` from `DailyGadgetMode.tsx`
- [ ] Extract `DailyStarPowerModeContent.tsx` from `DailyStarPowerMode.tsx`
- [ ] Extract `DailyAudioModeContent.tsx` from `DailyAudioMode.tsx`
- [ ] Extract `DailyPixelsModeContent.tsx` from `DailyPixelsMode.tsx`
- [ ] Ensure each content component receives necessary props (mode state, handlers, etc.)

### Phase 3: Navigation & State Updates
- [ ] Update `DailyModeProgress.tsx` to use state updates instead of `navigate()`
- [ ] Replace all `navigate('/daily/mode')` calls with mode state changes
- [ ] Implement smooth transitions between modes (preserve existing animations)
- [ ] Update `usePageTitle` to dynamically change based on current mode
- [ ] Ensure browser back/forward buttons work correctly with URL updates

### Phase 4: Routing Integration
- [ ] Update `App.tsx` to replace 5 daily routes with single `/daily` route
- [ ] Add route parameter support: `/daily/:mode?` with default to 'classic'
- [ ] Implement backward compatibility redirects for old URLs
- [ ] Update any external links pointing to old daily routes

### Phase 5: Animation & Transition Preservation
- [ ] Ensure `PageTransition` wrapper works with mode switching (not just route changes)
- [ ] Preserve `ModeTitle` cross-fade animations between mode switches
- [ ] Maintain mode icon scaling/lifting animations in `DailyModeProgress`
- [ ] Test all existing Framer Motion animations work seamlessly

### Phase 6: State & Data Integrity
- [ ] Verify `useDailyStore` continues to work identically
- [ ] Ensure game progress, guesses, and completion status preserved
- [ ] Test localStorage persistence across mode switches
- [ ] Validate all API calls and data loading work as before

### Phase 7: Browser & URL Behavior
- [ ] Implement proper URL updates when switching modes (`history.pushState` or React Router)
- [ ] Ensure browser back/forward navigation works correctly
- [ ] Test bookmarking specific modes (e.g., `/daily?mode=gadget`)
- [ ] Verify page refresh maintains current mode state

### Phase 8: Cross-Device & Accessibility Testing
- [ ] Test mobile layout and touch interactions
- [ ] Verify tablet and desktop responsive behavior
- [ ] Test RTL language support (Hebrew)
- [ ] Validate keyboard navigation and screen reader compatibility
- [ ] Ensure all hover states and focus indicators work

### Phase 9: Performance & Loading
- [ ] Verify lazy loading still works for mode-specific components
- [ ] Test initial page load performance
- [ ] Ensure smooth mode switching without loading delays
- [ ] Validate memory usage doesn't increase with single-page approach

### Phase 10: Validation & Cleanup
- [ ] Manual testing: Play through all 5 modes end-to-end
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Multi-language testing (English, Hebrew, other supported languages)
- [ ] Performance regression testing
- [ ] Remove old daily mode page files after successful migration
- [ ] Update any documentation or comments referencing old structure

---

## 3 · Technical Implementation Details

### URL Structure Options
**Option A: Query Parameter** (Recommended)
- `/daily?mode=classic` (default)
- `/daily?mode=gadget`
- `/daily?mode=starpower`
- `/daily?mode=audio`
- `/daily?mode=pixels`

**Option B: Route Parameter**
- `/daily/classic` (default)
- `/daily/gadget`
- `/daily/starpower`
- `/daily/audio`
- `/daily/pixels`

### Component Architecture
```
DailyModesPage.tsx (new unified container)
├── RotatingBackground
├── DailyModeProgress (updated to use state instead of navigate)
├── Conditional Mode Rendering:
│   ├── DailyClassicModeContent.tsx (extracted from DailyClassicMode.tsx)
│   ├── DailyGadgetModeContent.tsx (extracted from DailyGadgetMode.tsx)
│   ├── DailyStarPowerModeContent.tsx (extracted from DailyStarPowerMode.tsx)
│   ├── DailyAudioModeContent.tsx (extracted from DailyAudioMode.tsx)
│   └── DailyPixelsModeContent.tsx (extracted from DailyPixelsMode.tsx)
└── PageTransition wrapper (adapted for mode switches)
```

### State Management
- **Current mode**: Component state (not persisted)
- **Game state**: Existing `useDailyStore` (unchanged)
- **URL sync**: React Router or manual history management
- **Page title**: Dynamic based on current mode

---

## 4 · Risk Mitigation

### High-Risk Areas
1. **Animation continuity**: Ensure Framer Motion transitions work with state changes vs route changes
2. **Browser navigation**: Back/forward buttons must work intuitively
3. **State persistence**: Game progress must survive mode switches
4. **Performance**: Single page shouldn't be slower than separate pages

### Rollback Plan
- Keep original daily mode files as backup until full validation
- Use feature flags or environment variables to toggle between old/new systems
- Implement gradual rollout (percentage of users) if possible

---

## 5 · Success Criteria

### Functional Requirements
- [ ] All 5 daily modes work identically to current implementation
- [ ] Mode switching is seamless and fast
- [ ] Browser navigation (back/forward/refresh) works correctly
- [ ] All existing animations and transitions preserved
- [ ] Game state and progress maintained across mode switches

### Performance Requirements
- [ ] Initial page load time ≤ current performance
- [ ] Mode switching time < 100ms
- [ ] Memory usage doesn't increase significantly
- [ ] No visual glitches or layout shifts

### Compatibility Requirements
- [ ] Works on all supported devices (mobile, tablet, desktop)
- [ ] Functions correctly in all supported languages
- [ ] Maintains accessibility standards
- [ ] Compatible with all supported browsers

---

## 6 · Implementation Timeline

### Phase 1-3: Foundation (Day 1)
- Set up unified page structure
- Extract mode content components
- Implement basic conditional rendering

### Phase 4-6: Integration (Day 2)
- Update routing and navigation
- Preserve animations and state
- Test core functionality

### Phase 7-10: Validation (Day 3)
- Cross-device testing
- Performance validation
- Final cleanup and deployment

---

## 7 · Post-Migration Benefits

### User Experience
- Faster mode switching (no page reloads)
- Smoother animations between modes
- Better browser history management
- Improved perceived performance

### Developer Experience
- Simplified routing structure
- Easier maintenance of shared components
- Reduced code duplication
- Better state management clarity

### Technical Benefits
- Single entry point for daily challenges
- Simplified URL structure
- Better SEO potential
- Easier analytics tracking
