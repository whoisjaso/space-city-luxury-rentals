# Project State: Space City Luxury Rentals

## Project Reference

**Core Value:** Customers can discover Joey's vehicles and submit a booking request with zero friction -- and Joey can manage his fleet and respond to every request from a single admin panel.

**Current Focus:** Phase 2 complete -- Supabase Foundation (2/2 plans complete). Ready for Phase 3.

## Current Position

**Phase:** 2 of 9 (Supabase Foundation)
**Plan:** 2 of 2 in Phase 2
**Status:** Phase complete
**Last activity:** 2026-02-15 -- Completed 02-02-PLAN.md
**Progress:** [#####.....] ~19% (5 plans of ~27 estimated)

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Routing & Animation Survival | COMPLETE (3/3 plans) |
| 2 | Supabase Foundation | COMPLETE (2/2 plans) |
| 3 | Public Layout & Brand Shell | Not Started |
| 4 | Fleet Catalog Page | Not Started |
| 5 | Vehicle Detail Pages | Not Started |
| 6 | Guest Booking Flow | Not Started |
| 7 | Admin Auth & Vehicle Management | Not Started |
| 8 | Admin Booking Management & Dashboard | Not Started |
| 9 | Production Deploy & Polish | Not Started |

## Performance Metrics

**Plans completed:** 5
**Plans total:** ~27 estimated
**Requirements delivered:** 2/20 (INFRA-01: React Router, INFRA-02: Supabase schema)
**Phases completed:** 2/9

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
| Landing page extracted to pages/LandingPage.tsx | App.tsx is thin router shell; page components own their lifecycle (Lenis, cursor, ScrollTrigger) | Phase 1 |
| Nuclear cleanup on landing page unmount | ScrollTrigger.getAll().forEach(t => t.kill()) catches orphans from child sections | Phase 1 |
| All router imports from 'react-router' not 'react-router-dom' | react-router v7 single-package standard; dom package deprecated | Phase 1 |
| Runtime env var validation in supabase.ts | Fail fast with clear error rather than cryptic network errors | Phase 2 |
| QueryClient defaults: 5min stale, 1 retry, no window refocus | MVP-appropriate, quiet dev experience | Phase 2 |
| QueryProvider > AuthProvider > Routes nesting | Auth doesn't need Query; Query may serve auth-adjacent hooks later | Phase 2 |
| Anon SELECT on all bookings, filter at app level | MVP simplicity: guests look up by confirmation_code, no user accounts needed | Phase 2 |
| DB trigger generates 8-char confirmation codes | Server-side generation ensures uniqueness; client never provides one | Phase 2 |
| 4 numbered SQL migration files | Tables first, then RLS, then storage -- clear dependency order | Phase 2 |

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
- [x] Add React Router with scoped landing page lifecycle (Phase 1) -- DONE in 01-03
- [x] Install Supabase + TanStack Query, create client/types/providers (Phase 2) -- DONE in 02-01
- [x] Create Supabase database schema and seed data (Phase 2) -- DONE in 02-02
- [ ] Decide on image optimization approach for vehicle photos (Phase 7)
- [ ] Upgrade Supabase to Pro tier before production launch (Phase 9)
- [ ] Consider email notifications for booking confirmation (post-MVP)

## Session Continuity

### Last Session

**Date:** 2026-02-15
**Activity:** Execute plan 02-02
**Completed:** Database schema, RLS policies, storage bucket, and 6-vehicle seed data. Phase 2 complete.
**Next Step:** Begin Phase 3 (Public Layout & Brand Shell)

### Context for Next Session

Phase 2 (Supabase Foundation) is fully complete:
- Client infrastructure (02-01): lib/supabase.ts, types/database.ts, AuthProvider, QueryProvider
- Database schema (02-02): 4 SQL migrations + seed data in supabase/migrations/
  - 001: vehicles table (12 columns, updated_at trigger)
  - 002: bookings table (13 columns, confirmation_code auto-generation)
  - 003: RLS policies (anon read vehicles, anon create bookings, admin full CRUD)
  - 004: storage bucket (vehicle-images, public read, admin upload/delete)
  - seed.sql: 6 vehicles matching fleet showcase

User must run these migrations in Supabase SQL Editor and fill in .env with real credentials before data flows. Phase 3 builds the public-facing layout shell and can proceed independently.

---

*State initialized: 2026-02-15*
*Last updated: 2026-02-15*
