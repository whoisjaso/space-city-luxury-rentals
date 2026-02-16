---
phase: 01-routing-and-animation-survival
plan: 02
subsystem: animation-lifecycle
tags: [gsap, useGSAP, react-hooks, scroll-trigger, animation-cleanup]

dependency_graph:
  requires:
    - 01-01 (centralized lib/gsap.ts with useGSAP export)
  provides:
    - useGSAP-managed-animations
    - automatic-scrolltrigger-cleanup
    - rules-of-hooks-compliant-sections
  affects:
    - 01-03-PLAN (router navigation depends on clean animation teardown/re-init)

tech_stack:
  added: []
  removed: []
  patterns:
    - "useGSAP with scope parameter for all section animation lifecycle"
    - "Conditional returns after all hook calls (Rules of Hooks)"
    - "ScrollTrigger.refresh() after batch pin trigger creation"

key_files:
  created: []
  modified:
    - app/src/sections/Hero.tsx
    - app/src/sections/About.tsx
    - app/src/sections/Exhibitions.tsx
    - app/src/sections/Collections.tsx
    - app/src/sections/Testimonials.tsx
    - app/src/sections/Visit.tsx
  deleted: []

decisions:
  - id: useGSAP-scope-pattern
    description: "All section components use useGSAP with { scope: sectionRef } instead of useEffect"
    rationale: "useGSAP wraps animations in gsap.context() for automatic revert on unmount -- essential for React Router navigation and StrictMode"
  - id: conditional-return-after-hooks
    description: "Moved all conditional returns (if (!config...) return null) to after useGSAP calls"
    rationale: "React Rules of Hooks requires hooks to be called unconditionally; early returns before hooks cause runtime errors"
  - id: scrolltrigger-refresh-collections
    description: "Added ScrollTrigger.refresh() at end of Collections useGSAP callback"
    rationale: "Multiple pin triggers with pinSpacing:false need a refresh after creation to recalculate positions correctly"

metrics:
  duration: "3m"
  tasks_completed: 2
  tasks_total: 2
  completed: "2026-02-15"
---

# Phase 1 Plan 2: useGSAP Migration Summary

**One-liner:** Migrated all 6 section components from useEffect to useGSAP hook with scope, removing manual ScrollTrigger cleanup and fixing Rules of Hooks violations.

## What Was Done

### Task 1: Migrate Hero, About, and Exhibitions to useGSAP
**Commit:** `439d9cd`

- **Hero.tsx**: Replaced useEffect with useGSAP({ scope: sectionRef }). Removed triggersRef, manual tl.kill(), and cleanup return. Moved conditional return after useGSAP. Entrance timeline and scroll parallax logic preserved unchanged.
- **About.tsx**: Replaced useEffect with useGSAP({ scope: sectionRef }). Removed triggersRef and 4 groups of triggersRef.current.push() calls. Removed cleanup return. Moved conditional return after useGSAP. Text reveal, gallery parallax, image reveal, and stat reveal logic preserved unchanged.
- **Exhibitions.tsx**: Replaced useEffect with useGSAP({ scope: sectionRef }). Removed triggersRef and 3 push() calls. Removed cleanup return. Moved conditional return after useGSAP. Header reveal, card reveal, and CTA reveal logic preserved unchanged.

### Task 2: Migrate Collections, Testimonials, and Visit to useGSAP
**Commit:** `954a2ee`

- **Collections.tsx** (most complex): Replaced useEffect with useGSAP({ scope: sectionRef }). Removed triggersRef and ~6 push() calls across header reveals, pin triggers, dim triggers, and text reveals. Removed cleanup return. Moved conditional return after useGSAP. Added ScrollTrigger.refresh() at end of callback to ensure pin spacing calculations are correct after batch creation. All stacking card pin logic (pin:true, pinSpacing:false, endTrigger cross-references) preserved unchanged.
- **Testimonials.tsx**: Replaced useEffect with useGSAP({ scope: sectionRef }). Removed triggersRef. Removed cleanup return. Moved conditional return after useGSAP. Reveal-item animation logic preserved unchanged.
- **Visit.tsx**: Replaced useEffect with useGSAP({ scope: sectionRef }). Removed triggersRef. Removed cleanup return. Moved conditional return after useGSAP. Info-card reveal animation logic preserved unchanged.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| useGSAP with scope:sectionRef for all 6 sections | gsap.context() auto-reverts all property changes on unmount; essential for router navigation |
| Conditional returns moved after all hooks | Rules of Hooks: hooks must be called unconditionally in every render |
| ScrollTrigger.refresh() in Collections | Batch pin triggers with pinSpacing:false need recalculation after creation |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | PASS -- builds in 5.48s, no errors |
| Zero `useEffect` in section files | PASS -- 0 occurrences |
| Zero `triggersRef` in section files | PASS -- 0 occurrences |
| Zero `gsap.registerPlugin` in section files | PASS -- 0 occurrences |
| All 6 files import from `'../lib/gsap'` | PASS -- 6/6 |
| All 6 files use `useGSAP` with `{ scope: sectionRef }` | PASS -- 6/6 |
| All conditional returns after hook calls | PASS -- verified line numbers |

## What Changed (Net Effect)

Across all 6 files: **-95 lines removed, +47 lines added** (net -48 lines). Every section lost its triggersRef declaration, push() calls, and cleanup return function. Every section gained a useGSAP wrapper with scope. Animation logic itself is 100% unchanged -- only the lifecycle management around it changed.

## Next Phase Readiness

Plan 01-03 (React Router integration) can proceed immediately. All section components now properly tear down and re-initialize via gsap.context(), which means navigating away from the landing page and back will not leak ScrollTriggers or leave stale CSS transforms.

No blockers. No new concerns discovered.
