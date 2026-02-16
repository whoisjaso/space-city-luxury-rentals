# Project State: Space City Luxury Rentals

## Project Reference

**Core Value:** Customers can discover Joey's vehicles and submit a booking request with zero friction -- and Joey can manage his fleet and respond to every request from a single admin panel.

**Current Focus:** Phase 1 -- Routing & Animation Survival

## Current Position

**Phase:** 1 of 9 (Routing & Animation Survival)
**Plan:** 2 of 3 in Phase 1
**Status:** In progress
**Last activity:** 2026-02-15 -- Completed 01-02-PLAN.md
**Progress:** [##........] ~7% (2 plans of ~27 estimated)

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Routing & Animation Survival | In Progress (2/3 plans) |
| 2 | Supabase Foundation | Not Started |
| 3 | Public Layout & Brand Shell | Not Started |
| 4 | Fleet Catalog Page | Not Started |
| 5 | Vehicle Detail Pages | Not Started |
| 6 | Guest Booking Flow | Not Started |
| 7 | Admin Auth & Vehicle Management | Not Started |
| 8 | Admin Booking Management & Dashboard | Not Started |
| 9 | Production Deploy & Polish | Not Started |

## Performance Metrics

**Plans completed:** 2
**Plans total:** 3 (Phase 1 planned)
**Requirements delivered:** 0/20
**Phases completed:** 0/9

## Accumulated Context

### Key Decisions

| Decision | Rationale | Phase |
|----------|-----------|-------|
| 3 new dependencies only | @supabase/supabase-js, react-router v7, @tanstack/react-query v5 -- minimize footprint | Phase 1-2 |
| Three-layout pattern | Landing page (GSAP), Public (standard), Admin (sidebar) -- each self-contained | Phase 1-3 |
| Prices in cents | Integer storage avoids floating-point rounding | Phase 2 |
| Array for vehicle images | text[] column simpler than separate table for MVP | Phase 2 |
| Lenis scoped to landing only | Prevents scroll position corruption on route changes | Phase 1 |
| Centralized GSAP imports via lib/gsap.ts | Single registerPlugin call; all components import from lib/gsap.ts, never directly from 'gsap' | Phase 1 |
| cursor:none behind @media (any-hover: hover) and (pointer: fine) | Touch devices need system cursor; custom cursor JS only works with mouse | Phase 1 |
| Deleted useScrollTrigger.ts entirely | No component imports it; useGSAP from @gsap/react is the replacement | Phase 1 |
| useGSAP with scope:sectionRef for all 6 sections | gsap.context() auto-reverts all property changes on unmount; essential for router navigation | Phase 1 |
| Conditional returns after all hooks in sections | Rules of Hooks: hooks must be called unconditionally in every render | Phase 1 |
| ScrollTrigger.refresh() in Collections | Batch pin triggers with pinSpacing:false need recalculation after creation | Phase 1 |

### Known Issues

- ~~`useLenis.ts` ticker cleanup bug: creates new anonymous function that never matches the one added (memory leak)~~ FIXED in 01-01
- ~~`useScrollTrigger.ts` dependency bug: config object as useEffect dependency changes every render (infinite ScrollTrigger recreation)~~ FIXED in 01-01 (file deleted)
- ~~Three `cursor: none` declarations with no accessibility media queries~~ FIXED in 01-01
- Supabase free tier auto-pauses after 7 days inactivity (must upgrade to Pro before production)

### Blockers

None currently.

### TODOs (Cross-Phase)

- [x] Fix existing GSAP/Lenis bugs before building on top of them (Phase 1) -- DONE in 01-01
- [x] Migrate all section components from useEffect to useGSAP (Phase 1) -- DONE in 01-02
- [ ] Decide on image optimization approach for vehicle photos (Phase 7)
- [ ] Upgrade Supabase to Pro tier before production launch (Phase 9)
- [ ] Consider email notifications for booking confirmation (post-MVP)

## Session Continuity

### Last Session

**Date:** 2026-02-15
**Activity:** Execute plan 01-02
**Completed:** All 6 section components migrated from useEffect to useGSAP with scope, manual cleanup removed, Rules of Hooks violations fixed
**Next Step:** Execute plan 01-03 (add React Router with three-layout pattern)

### Context for Next Session

Plans 01-01 and 01-02 are complete. All 6 section components (Hero, About, Exhibitions, Collections, Testimonials, Visit) now use the useGSAP hook with `{ scope: sectionRef }` instead of raw useEffect. Manual ScrollTrigger cleanup arrays (triggersRef) are eliminated -- gsap.context() handles teardown automatically. Conditional returns are after all hooks. Build passes cleanly. Plan 01-03 should add React Router with the three-layout pattern (Landing, Public, Admin).

---

*State initialized: 2026-02-15*
*Last updated: 2026-02-15*
