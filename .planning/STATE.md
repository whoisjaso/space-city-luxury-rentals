# Project State: Space City Luxury Rentals

## Project Reference

**Core Value:** Customers can discover Joey's vehicles and submit a booking request with zero friction -- and Joey can manage his fleet and respond to every request from a single admin panel.

**Current Focus:** Phase 6 complete -- Guest Booking Flow (1/1 plans complete). Ready for Phase 7.

## Current Position

**Phase:** 6 of 9 (Guest Booking Flow)
**Plan:** 1 of 1 in Phase 6
**Status:** Phase complete
**Last activity:** 2026-02-15 -- Completed 06-01-PLAN.md
**Progress:** [#########.] ~33% (9 plans of ~27 estimated)

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Routing & Animation Survival | COMPLETE (3/3 plans) |
| 2 | Supabase Foundation | COMPLETE (2/2 plans) |
| 3 | Public Layout & Brand Shell | COMPLETE (1/1 plans) |
| 4 | Fleet Catalog Page | COMPLETE (1/1 plans) |
| 5 | Vehicle Detail Pages | COMPLETE (1/1 plans) |
| 6 | Guest Booking Flow | COMPLETE (1/1 plans) |
| 7 | Admin Auth & Vehicle Management | Not Started |
| 8 | Admin Booking Management & Dashboard | Not Started |
| 9 | Production Deploy & Polish | Not Started |

## Performance Metrics

**Plans completed:** 9
**Plans total:** ~27 estimated
**Requirements delivered:** 6/20 (INFRA-01: React Router, INFRA-02: Supabase schema, FLEET-01: Fleet catalog page, FLEET-02: Vehicle detail pages, BOOK-01: Booking form, BOOK-02: Booking status)
**Phases completed:** 6/9

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
| Conditional Supabase client (nullable) | supabase.ts exports null when env vars missing/placeholder; enables demo mode with seed data | Phase 4 |
| QueryClient defaults: 5min stale, 1 retry, no window refocus | MVP-appropriate, quiet dev experience | Phase 2 |
| QueryProvider > AuthProvider > Routes nesting | Auth doesn't need Query; Query may serve auth-adjacent hooks later | Phase 2 |
| Anon SELECT on all bookings, filter at app level | MVP simplicity: guests look up by confirmation_code, no user accounts needed | Phase 2 |
| DB trigger generates 8-char confirmation codes | Server-side generation ensures uniqueness; client never provides one | Phase 2 |
| 4 numbered SQL migration files | Tables first, then RLS, then storage -- clear dependency order | Phase 2 |
| React Router Outlet layout routes | PublicLayout wraps child routes via Outlet; cleaner than wrapper HOC | Phase 3 |
| Hash links use <a> tags, route links use <Link> | Hash links need native behavior for Lenis smooth scroll on landing page | Phase 3 |
| Slide-out mobile menu panel | Right-side panel instead of full-screen overlay; more refined UX with backdrop close | Phase 3 |
| Seed data fallback in useVehicles | 6 hardcoded vehicles returned when Supabase not configured; matches config fleet | Phase 4 |
| Identity headline as primary card text | Vehicle headline (tagline) is dominant; vehicle name is secondary museo-label style | Phase 4 |
| Exported SEED_VEHICLES for cross-hook reuse | useVehicle.ts imports same seed array from useVehicles.ts; avoids duplication | Phase 5 |
| PGRST116 treated as null not error | Supabase "no rows found" on .single() returns null for clean not-found UX | Phase 5 |
| Sticky pricing card (top-24) | Pricing stays visible on scroll for long descriptions; standard e-commerce pattern | Phase 5 |
| Demo mode mutation with fake confirmation codes | useMutation fallback generates 8-char alphanumeric code with 800ms simulated delay | Phase 6 |
| Single-page booking form (no multi-step) | Under 60 seconds to complete; fewer clicks = less friction for luxury experience | Phase 6 |
| Validation on blur with touched tracking | Errors only appear after user interacts with field; no red text on initial render | Phase 6 |
| Status page auto-detects code vs email | Unified search input with @ symbol detection reduces UI complexity | Phase 6 |

### Known Issues

- ~~`useLenis.ts` ticker cleanup bug: creates new anonymous function that never matches the one added (memory leak)~~ FIXED in 01-01
- ~~`useScrollTrigger.ts` dependency bug: config object as useEffect dependency changes every render (infinite ScrollTrigger recreation)~~ FIXED in 01-01 (file deleted)
- ~~Three `cursor: none` declarations with no accessibility media queries~~ FIXED in 01-01
- ~~Runtime env var validation in supabase.ts throws on missing vars~~ CHANGED in 04-01 to conditional null export
- Supabase free tier auto-pauses after 7 days inactivity (must upgrade to Pro before production)

### Blockers

None currently.

### TODOs (Cross-Phase)

- [x] Fix existing GSAP/Lenis bugs before building on top of them (Phase 1) -- DONE in 01-01
- [x] Migrate all section components from useEffect to useGSAP (Phase 1) -- DONE in 01-02
- [x] Add React Router with scoped landing page lifecycle (Phase 1) -- DONE in 01-03
- [x] Install Supabase + TanStack Query, create client/types/providers (Phase 2) -- DONE in 02-01
- [x] Create Supabase database schema and seed data (Phase 2) -- DONE in 02-02
- [x] Create public layout shell with header, mobile menu, routing (Phase 3) -- DONE in 03-01
- [x] Build fleet catalog page with vehicle cards and experience filtering (Phase 4) -- DONE in 04-01
- [x] Build vehicle detail pages with gallery, social proof, and booking CTA (Phase 5) -- DONE in 05-01
- [x] Build guest booking flow with form, validation, confirmation, and status lookup (Phase 6) -- DONE in 06-01
- [ ] Decide on image optimization approach for vehicle photos (Phase 7)
- [ ] Upgrade Supabase to Pro tier before production launch (Phase 9)
- [ ] Consider email notifications for booking confirmation (post-MVP)

## Session Continuity

### Last Session

**Date:** 2026-02-15
**Activity:** Execute plan 06-01
**Completed:** Guest booking flow with BookingForm, BookingPage, BookingStatusPage, useBooking hooks, and TermsModal. Phase 6 complete.
**Next Step:** Begin Phase 7 (Admin Auth & Vehicle Management)

### Context for Next Session

Phase 6 (Guest Booking Flow) is fully complete:
- BookingPage (06-01): Guest booking form at /book with ?vehicle=slug pre-selection, real-time validation, terms checkbox, confirmation panel with code copy
- BookingStatusPage (06-01): Status lookup at /book/:code with code/email auto-detection, status badges (pending/approved/declined), admin notes display
- useBooking (06-01): useCreateBooking mutation, useBookingStatus by code, useBookingsByEmail -- all with demo mode fallback
- BookingForm (06-01): Single-page form with vehicle selector, date pickers, guest info, inline validation on blur, estimated total
- TermsModal (06-01): Rental terms overlay with period, deposit, damage, mileage, cancellation, and driver requirement sections

Phase 7 builds admin authentication and vehicle management. The admin will need to log in, view/add/edit vehicles, and eventually manage bookings (Phase 8). The /admin route exists as a placeholder in App.tsx.

---

*State initialized: 2026-02-15*
*Last updated: 2026-02-15*
