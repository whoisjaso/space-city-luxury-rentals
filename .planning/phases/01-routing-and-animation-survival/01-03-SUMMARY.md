---
phase: 01-routing-and-animation-survival
plan: 03
subsystem: routing-integration
tags: [react-router, browser-router, landing-page, gsap-cleanup, scroll-trigger, lenis-scope]

dependency_graph:
  requires:
    - 01-01 (centralized lib/gsap.ts, bug-free Lenis, react-router installed)
    - 01-02 (useGSAP-managed animations with automatic cleanup in all sections)
  provides:
    - react-router-integration
    - landing-page-component
    - nuclear-scrolltrigger-cleanup
    - scoped-lenis-and-cursor
    - three-layout-architecture-ready
  affects:
    - 03-PLAN (Public layout will add routes to the router shell)
    - 07-PLAN (Admin layout will add routes to the router shell)

tech_stack:
  added: []
  removed: []
  patterns:
    - "BrowserRouter wrapping App in main.tsx entry point"
    - "Thin router shell in App.tsx (Routes/Route/Navigate only)"
    - "Page-level components in pages/ directory own their hooks and lifecycle"
    - "Nuclear ScrollTrigger.getAll().forEach(t => t.kill()) on landing page unmount"
    - "useGSAP with scope for background color transitions"
    - "Catch-all Route with Navigate replace for unknown URLs"

key_files:
  created:
    - app/src/pages/LandingPage.tsx
  modified:
    - app/src/App.tsx
    - app/src/main.tsx
  deleted: []

decisions:
  - id: landing-page-extraction
    description: "All landing content (sections, hooks, background transitions) extracted from App.tsx into pages/LandingPage.tsx"
    rationale: "App.tsx must be a thin router shell; page-level components own their lifecycle so Lenis/cursor/ScrollTrigger are scoped per-route"
  - id: nuclear-cleanup-on-unmount
    description: "LandingPage runs ScrollTrigger.getAll().forEach(t => t.kill()) and clearMatchMedia() on unmount"
    rationale: "Belt-and-suspenders with useGSAP context cleanup -- catches any orphaned triggers from child sections to guarantee zero leaks after navigation"
  - id: react-router-v7-imports
    description: "All router imports from 'react-router' not 'react-router-dom'"
    rationale: "react-router v7 consolidates into single package; react-router-dom is deprecated"

metrics:
  duration: "4m"
  tasks_completed: 2
  tasks_total: 2
  completed: "2026-02-15"
---

# Phase 1 Plan 3: React Router Integration Summary

**One-liner:** Extracted landing page into pages/LandingPage.tsx with scoped Lenis/cursor/ScrollTrigger lifecycle, rewrote App.tsx as thin router shell with BrowserRouter in main.tsx.

## What Was Done

### Task 1: Create LandingPage.tsx and restructure App.tsx and main.tsx for routing
**Commit:** `a140ae0`

- **Created `app/src/pages/LandingPage.tsx`** (109 lines): New page component containing all 7 section imports (Hero, About, Exhibitions, Collections, Testimonials, Visit, Footer), useLenis() and useCustomCursor() hooks scoped to this page only, useGSAP background color transitions with scope:mainRef, document metadata setup, and nuclear ScrollTrigger cleanup on unmount.
- **Rewrote `app/src/App.tsx`** (15 lines): Stripped from 116 lines to 15. Now imports only Routes/Route/Navigate from react-router, App.css, and LandingPage. Renders a Routes block with "/" mapping to LandingPage and "*" catch-all redirecting to "/".
- **Updated `app/src/main.tsx`** (13 lines): Added BrowserRouter import from react-router, wrapping App inside BrowserRouter inside StrictMode. Entry point is now router-aware.

### Task 2: Human verification of complete React Router integration
**Status:** Approved by user

User verified:
- All 7 sections render at root URL with full GSAP scroll animations
- Background color transitions work through all sections
- Lenis smooth scrolling active on landing page
- Custom cursor follows mouse correctly
- Navigation to unknown routes redirects back to landing
- Animations work correctly after navigation cycles
- No ScrollTrigger memory leaks observed

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| All landing content extracted to pages/LandingPage.tsx | App.tsx must be thin router shell; page components own their lifecycle |
| Nuclear cleanup (ScrollTrigger.getAll + clearMatchMedia) on unmount | Belt-and-suspenders with useGSAP context -- catches any orphans from child sections |
| All router imports from 'react-router' not 'react-router-dom' | react-router v7 single-package standard; dom package deprecated |
| Catch-all Route with Navigate replace | Unknown URLs redirect to landing; no 404 page needed for MVP |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| LandingPage.tsx exists with all section imports | PASS -- 7 sections, useLenis, useCustomCursor, useGSAP, nuclear cleanup |
| App.tsx is thin router shell | PASS -- 15 lines, no gsap/hooks/section imports |
| main.tsx wraps App in BrowserRouter | PASS -- BrowserRouter from 'react-router' |
| All imports from 'react-router' (not react-router-dom) | PASS -- 0 occurrences of react-router-dom |
| `npm run build` | PASS -- builds without errors |
| Human verification of animations and routing | PASS -- user approved |

## What Changed (Net Effect)

**App.tsx:** 116 lines -> 15 lines (-101 lines). All content, hooks, and animation logic moved out. Only routing shell remains.

**main.tsx:** 11 lines -> 13 lines (+2 lines). Added BrowserRouter import and wrapper.

**LandingPage.tsx:** New file, 109 lines. Contains everything that was in App.tsx plus nuclear cleanup.

**Architecture:** The app now has a clear separation between routing (App.tsx) and page content (pages/LandingPage.tsx). Future routes (e.g., /fleet, /vehicles/:id, /admin) will be added as Route entries in App.tsx pointing to new page components, without touching the landing page at all.

## Phase 1 Completion

This was the final plan (3 of 3) in Phase 1: Routing & Animation Survival. The phase is now complete.

**Phase 1 delivered:**
- Plan 01-01: Dependencies installed, bugs fixed, GSAP centralized
- Plan 01-02: All 6 section components migrated from useEffect to useGSAP
- Plan 01-03: React Router integrated with scoped landing page lifecycle

**INFRA-01 requirement satisfied:** React Router is integrated with BrowserRouter, Routes, and catch-all redirect. The three-layout architecture (Landing, Public, Admin) is ready for Phase 3+ route additions.

## Next Phase Readiness

Phase 2 (Supabase Foundation) can proceed. The routing infrastructure is in place and the animation lifecycle is fully managed. No blockers or concerns discovered.
