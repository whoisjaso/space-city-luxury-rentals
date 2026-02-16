---
phase: 01-routing-and-animation-survival
plan: 01
subsystem: animation-infrastructure
tags: [gsap, lenis, react-router, vite, vercel, accessibility]

dependency_graph:
  requires: []
  provides:
    - centralized-gsap-registration
    - clean-dependency-tree
    - spa-deployment-config
    - bug-free-lenis-hook
  affects:
    - 01-02-PLAN (useGSAP migration depends on lib/gsap.ts exports)
    - 01-03-PLAN (router integration depends on clean animation state)

tech_stack:
  added:
    - react-router@7.13.0
    - "@gsap/react@2.1.2"
    - lenis@1.3.17
  removed:
    - "@studio-freight/lenis@1.0.42"
  patterns:
    - "Centralized GSAP plugin registration via lib/gsap.ts"
    - "Media-queried cursor:none for pointer device accessibility"

key_files:
  created:
    - app/src/lib/gsap.ts
    - vercel.json
  modified:
    - app/package.json
    - app/vite.config.ts
    - app/src/hooks/useLenis.ts
    - app/src/App.css
    - app/src/index.css
    - app/src/App.tsx
    - app/src/sections/About.tsx
    - app/src/sections/Collections.tsx
    - app/src/sections/Exhibitions.tsx
    - app/src/sections/Hero.tsx
    - app/src/sections/Testimonials.tsx
    - app/src/sections/Visit.tsx
  deleted:
    - app/src/hooks/useScrollTrigger.ts

decisions:
  - id: centralized-gsap-imports
    description: "All components import gsap/ScrollTrigger from lib/gsap.ts, never directly from 'gsap' package"
    rationale: "Single registerPlugin call prevents duplicate registration and ensures useGSAP is always available"
  - id: lenis-package-migration
    description: "Replaced @studio-freight/lenis with lenis (official rename)"
    rationale: "Old package is deprecated, new package has TypeScript types built in"
  - id: cursor-none-media-query
    description: "cursor:none wrapped in @media (any-hover: hover) and (pointer: fine)"
    rationale: "Touch devices need the system cursor; hiding it only makes sense with a precise pointer where the custom cursor JS element can follow"

metrics:
  duration: "7m"
  tasks_completed: 2
  tasks_total: 2
  completed: "2026-02-15"
---

# Phase 1 Plan 1: Dependencies, Bug Fixes, and GSAP Centralization Summary

**One-liner:** Installed react-router/gsap-react/lenis, fixed three bugs (ticker leak, unused hook, cursor accessibility), centralized GSAP registration in lib/gsap.ts, added Vercel SPA config.

## What Was Done

### Task 1: Install dependencies, fix vite config, create vercel.json
**Commit:** `bce8660`

- Installed `react-router@7.13.0`, `@gsap/react@2.1.2`, `lenis@1.3.17`
- Uninstalled deprecated `@studio-freight/lenis`
- Removed `base: './'` from `vite.config.ts` (default `'/'` is correct for SPA routing with clean URLs)
- Created `vercel.json` at project root with SPA rewrite rule: all routes serve `index.html`

### Task 2: Fix bugs and centralize GSAP registration
**Commit:** `9961baa`

- **Created `app/src/lib/gsap.ts`**: Single-source GSAP module that registers `ScrollTrigger` and `useGSAP` once, re-exports `gsap`, `ScrollTrigger`, and `useGSAP`
- **Fixed useLenis.ts ticker leak (Bug 1)**: Stored the `rafCallback` function reference in a variable so `gsap.ticker.remove()` receives the same reference as `gsap.ticker.add()`. Added `document.documentElement.classList.remove('lenis', 'lenis-smooth')` to cleanup. Updated import to `lenis` package.
- **Deleted useScrollTrigger.ts (Bug 2)**: Removed the entire file. It was unused (no imports in any component) and had a dependency array bug (`config` object as useEffect dependency causes infinite ScrollTrigger recreation). The `useGSAP` hook from `@gsap/react` replaces its purpose.
- **Fixed cursor:none accessibility (Bug 3)**: Removed bare `cursor: none` from `a` and `button` in App.css and `body` in index.css. Wrapped all three in `@media (any-hover: hover) and (pointer: fine)` so touch-only devices keep the system cursor.
- **Centralized all GSAP imports**: Updated App.tsx and all 6 section components (Hero, About, Exhibitions, Collections, Testimonials, Visit) to import from `lib/gsap` instead of directly from `gsap` package. Removed 7 duplicate `gsap.registerPlugin(ScrollTrigger)` calls.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| All components import from lib/gsap.ts, not directly from gsap | Single registerPlugin call; useGSAP always available for Phase 1 Plan 2 migration |
| Replaced @studio-freight/lenis with lenis | Official package rename; old package deprecated |
| cursor:none behind @media (any-hover: hover) and (pointer: fine) | Touch devices need system cursor; custom cursor JS only works with mouse |
| Deleted useScrollTrigger.ts entirely instead of fixing it | No component imports it; useGSAP from @gsap/react is the replacement |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Centralized GSAP imports across all components**

- **Found during:** Task 2 verification
- **Issue:** Plan only specified creating lib/gsap.ts and fixing useLenis.ts imports, but 7 other files (App.tsx + 6 sections) still had direct `import { gsap } from 'gsap'` and `gsap.registerPlugin(ScrollTrigger)` calls. Verification criterion #4 requires no registerPlugin calls outside lib/gsap.ts.
- **Fix:** Updated all 7 files to import from lib/gsap and removed their registerPlugin calls
- **Files modified:** App.tsx, Hero.tsx, About.tsx, Exhibitions.tsx, Collections.tsx, Testimonials.tsx, Visit.tsx
- **Commit:** 9961baa

**2. [Rule 3 - Blocking] Added .gitignore and baseline app commit**

- **Found during:** Pre-execution setup
- **Issue:** The app/ directory was entirely untracked with no .gitignore file. Without this, node_modules and dist would be committed, and atomic task commits would be impossible.
- **Fix:** Created .gitignore (node_modules, dist, .env, etc.) and committed the existing app codebase as a baseline before task execution
- **Files created:** .gitignore
- **Commit:** afb2ec1

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | PASS -- builds in 5.65s, no errors |
| `npm ls react-router @gsap/react lenis` | PASS -- all three installed |
| `npm ls @studio-freight/lenis` | PASS -- empty (removed) |
| No registerPlugin outside lib/gsap.ts | PASS -- only in lib/gsap.ts |
| No @studio-freight/lenis imports | PASS -- zero results |
| No bare cursor:none outside media queries | PASS -- all inside @media |
| vercel.json at project root | PASS -- contains rewrite rule |

## Next Phase Readiness

Plan 01-02 (useGSAP migration) can proceed immediately. The centralized `lib/gsap.ts` now exports `useGSAP` alongside `gsap` and `ScrollTrigger`, which is exactly what the section component migration needs.

No blockers. No new concerns discovered.
