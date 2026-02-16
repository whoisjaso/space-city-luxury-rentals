# Project State: Space City Luxury Rentals

## Project Reference

**Core Value:** Customers can discover Joey's vehicles and submit a booking request with zero friction -- and Joey can manage his fleet and respond to every request from a single admin panel.

**Current Focus:** Phase 1 -- Routing & Animation Survival

## Current Position

**Phase:** 1 of 9
**Plan:** Not yet planned
**Status:** Not Started
**Progress:** [..........] 0%

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Routing & Animation Survival | Not Started |
| 2 | Supabase Foundation | Not Started |
| 3 | Public Layout & Brand Shell | Not Started |
| 4 | Fleet Catalog Page | Not Started |
| 5 | Vehicle Detail Pages | Not Started |
| 6 | Guest Booking Flow | Not Started |
| 7 | Admin Auth & Vehicle Management | Not Started |
| 8 | Admin Booking Management & Dashboard | Not Started |
| 9 | Production Deploy & Polish | Not Started |

## Performance Metrics

**Plans completed:** 0
**Plans total:** 0 (not yet planned)
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

### Known Issues

- `useLenis.ts` ticker cleanup bug: creates new anonymous function that never matches the one added (memory leak)
- `useScrollTrigger.ts` dependency bug: config object as useEffect dependency changes every render (infinite ScrollTrigger recreation)
- Three `cursor: none` declarations with no accessibility media queries
- Supabase free tier auto-pauses after 7 days inactivity (must upgrade to Pro before production)

### Blockers

None currently.

### TODOs (Cross-Phase)

- [ ] Fix existing GSAP/Lenis bugs before building on top of them (Phase 1)
- [ ] Decide on image optimization approach for vehicle photos (Phase 7)
- [ ] Upgrade Supabase to Pro tier before production launch (Phase 9)
- [ ] Consider email notifications for booking confirmation (post-MVP)

## Session Continuity

### Last Session

**Date:** 2026-02-15
**Activity:** Roadmap creation
**Completed:** ROADMAP.md, STATE.md, REQUIREMENTS.md traceability
**Next Step:** Plan Phase 1 with `/gsd:plan-phase 1`

### Context for Next Session

Phase 1 is the highest-risk phase. The gating concern is introducing React Router into an app with 30+ GSAP ScrollTrigger instances and Lenis smooth scroll. Research flagged this phase as needing `/gsd:research-phase` before planning. Key pitfalls to address: P1 (ScrollTrigger memory leaks), P2 (Lenis scroll corruption), P5 (Vercel SPA 404s), P6 (StrictMode double-mount). Three existing bugs in hooks must be fixed as part of this phase.

---

*State initialized: 2026-02-15*
*Last updated: 2026-02-15*
