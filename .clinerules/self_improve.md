---
description: Guidelines for continuously improving Cline rules based on emerging code patterns and best practices.
globs: **/*
alwaysApply: true
---

- **Rule Improvement Triggers:**
  - New code patterns not covered by existing rules
  - Repeated similar implementations across files
  - Common error patterns that could be prevented
  - New libraries or tools being used consistently
  - Emerging best practices in the codebase

- **Analysis Process:**
  - Compare new code with existing rules
  - Identify patterns that should be standardized
  - Look for references to external documentation
  - Check for consistent error handling patterns
  - Monitor test patterns and coverage

- **Rule Updates:**
  - **Add New Rules When:**
    - A new technology/pattern is used in 3+ files
    - Common bugs could be prevented by a rule
    - Code reviews repeatedly mention the same feedback
    - New security or performance patterns emerge

  - **Modify Existing Rules When:**
    - Better examples exist in the codebase
    - Additional edge cases are discovered
    - Related rules have been updated
    - Implementation details have changed

- **Example Pattern Recognition:**
  ```typescript
  // If you see repeated patterns like:
  const data = await prisma.user.findMany({
    select: { id: true, email: true },
    where: { status: 'ACTIVE' }
  });
  
  // Consider adding to [prisma.md](.clinerules/prisma.md):
  // - Standard select fields
  // - Common where conditions
  // - Performance optimization patterns
  ```

- **Rule Quality Checks:**
  - Rules should be actionable and specific
  - Examples should come from actual code
  - References should be up to date
  - Patterns should be consistently enforced

- **Continuous Improvement:**
  - Monitor code review comments
  - Track common development questions
  - Update rules after major refactors
  - Add links to relevant documentation
  - Cross-reference related rules

- **Rule Deprecation:**
  - Mark outdated patterns as deprecated
  - Remove rules that no longer apply
  - Update references to deprecated rules
  - Document migration paths for old patterns

- **Documentation Updates:**
  - Keep examples synchronized with code
  - Update references to external docs
  - Maintain links between related rules
  - Document breaking changes

## Cross-cutting Implementation Lessons (Generic)

- **List Order Changes (append → prepend or reverse)**
  - After changing data order, audit render logic for index-based assumptions (`index === 0`, `length - 1`, `reverse()`/`slice().reverse()`).
  - Update any "newest" markers to reflect the new order; avoid brittle index checks when possible.
  - Prefer stable React keys (IDs, names) over array indices to prevent remounting/flicker when prepending.

- **Media UI Lifecycle (Audio/Video)**
  - Always wire `onEnded` to reset UI state (e.g., return to Play icon) and clear any playing flags.
  - Keep a single source of truth for playback state; sync state on `onPlay`, `onPause`, `onEnded`, and on `src` changes.
  - Handle error states with `onError` and provide a graceful fallback or retry.

- **Motion Accessibility & Directionality**
  - Respect `prefers-reduced-motion`; provide non-animated fallbacks.
  - Make entrance/exit offsets RTL-aware where direction matters.
  - Use low-coupling orchestration (container-layout + child stagger) to avoid layout thrash.

- **Read-Before-Write Discipline**
  - Search and review all affected modules before mutating code; re-read after changes to verify integrity.

Follow [cline_rules.md](.clinerules/cline_rules.md) for proper rule formatting and structure.
