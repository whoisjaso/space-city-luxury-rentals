---
phase: 04-fleet-catalog-page
plan: 01
subsystem: ui
tags: [react, tanstack-query, gsap, supabase, tailwind, vehicle-catalog]

# Dependency graph
requires:
  - phase: 02-supabase-foundation
    provides: Supabase client, Database types (Vehicle), TanStack Query provider
  - phase: 03-public-layout-brand-shell
    provides: PublicLayout with Outlet routing, FleetPage placeholder, PublicHeader
provides:
  - Fleet catalog page with responsive vehicle grid
  - VehicleCard component for vehicle display
  - ExperienceFilter component for tag-based filtering
  - useVehicles hook with Supabase fetch and seed data fallback
  - Conditional Supabase client (demo mode when env vars missing)
affects: [05-vehicle-detail-pages, 06-guest-booking-flow, 07-admin-auth-vehicle-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed data fallback: useVehicles returns hardcoded vehicles when Supabase not configured"
    - "Conditional Supabase client: supabase export is null when env vars are placeholder values"
    - "Experience tag filtering: client-side filter on experience_tags array field"
    - "GSAP useGSAP with scope for scroll-triggered card animations"

key-files:
  created:
    - app/src/hooks/useVehicles.ts
    - app/src/components/VehicleCard.tsx
    - app/src/components/ExperienceFilter.tsx
  modified:
    - app/src/pages/FleetPage.tsx
    - app/src/lib/supabase.ts
    - app/src/providers/AuthProvider.tsx

key-decisions:
  - "Conditional Supabase client instead of throwing on missing env vars -- enables demo mode"
  - "Seed data includes all 6 vehicles with realistic experience_tags for filtering"
  - "Price badge overlaid on image (top-right) rather than in card body for visual hierarchy"
  - "Identity headline is primary card text; vehicle name is secondary label style"

patterns-established:
  - "useVehicles pattern: TanStack Query hook with Supabase fetch + seed fallback"
  - "VehicleCard: Link-wrapped card with data-cursor hover for custom cursor"
  - "ExperienceFilter: controlled component with tags/activeTag/onTagChange props"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 4 Plan 1: Fleet Catalog Page Summary

**Fleet catalog page with 6 vehicle cards, experience tag filtering, GSAP scroll animations, and Supabase data hooks with seed data fallback**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T03:56:48Z
- **Completed:** 2026-02-16T03:59:33Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments

- Full fleet catalog page replacing placeholder, with responsive 1/2/3-col grid layout
- VehicleCard component with cinematic identity headlines, hero images, price badges, and experience tag pills
- ExperienceFilter with horizontal scrollable chips (7 tags including "All"), gold active state
- useVehicles TanStack Query hook with Supabase fetch and 6-vehicle seed data fallback
- Skeleton loading state (6 animated placeholder cards) during data fetch
- GSAP scroll animations: header fade-in and staggered card reveal

## Task Commits

Each task was committed atomically:

1. **Task 1: Create vehicle hooks, components, and fleet page** - `07a93b4` (feat)

**Plan metadata:** [pending]

## Files Created/Modified

- `app/src/hooks/useVehicles.ts` - TanStack Query hook fetching vehicles from Supabase with seed data fallback for 6 vehicles
- `app/src/components/VehicleCard.tsx` - Vehicle card with image, identity headline, name label, price badge, experience tag pills
- `app/src/components/ExperienceFilter.tsx` - Horizontal scrollable filter chips for experience tags
- `app/src/pages/FleetPage.tsx` - Full fleet catalog page with grid, filtering, animations, loading/error states
- `app/src/lib/supabase.ts` - Modified to export nullable client and `supabaseConfigured` flag
- `app/src/providers/AuthProvider.tsx` - Updated to handle null supabase client in demo mode

## Decisions Made

- **Conditional Supabase client:** Changed supabase.ts from throwing on missing env vars to exporting `null` when not configured. This enables the app to run in demo mode with seed data, which is essential for local development without a Supabase project.
- **Seed data with 6 vehicles:** All 6 vehicles from the plan spec (Rolls-Royce Ghost, Lamborghini Huracan, Dodge Hellcat Widebody, Mercedes-Maybach S-Class, Range Rover Sport, Chevrolet Corvette C8) with realistic headlines, prices, and experience tags.
- **Price badge on image overlay:** Daily price displayed as a floating badge on top-right of the vehicle image for immediate visibility, using gold text on dark backdrop-blur background.
- **Identity headline as primary text:** Vehicle headline is the dominant card text (larger, white, hover-to-gold transition); vehicle name is secondary in museo-label style (uppercase, small, dimmed).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Conditional Supabase client for demo mode**
- **Found during:** Task 1 (useVehicles hook creation)
- **Issue:** supabase.ts threw an error at import time when env vars contained placeholder values ("your-project-url"), which would crash the app before the seed data fallback could ever execute
- **Fix:** Changed supabase.ts to export `null` when env vars are missing or contain placeholders; exported `supabaseConfigured` boolean flag; updated AuthProvider to handle null client
- **Files modified:** app/src/lib/supabase.ts, app/src/providers/AuthProvider.tsx
- **Verification:** TypeScript type check passes, Vite build succeeds
- **Committed in:** 07a93b4 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix -- without it, the seed data fallback would never work because the app would crash on import. No scope creep.

## Issues Encountered

None -- plan executed cleanly after resolving the Supabase client blocking issue.

## User Setup Required

None -- no external service configuration required. The fleet page works in demo mode with seed data out of the box.

## Next Phase Readiness

- Fleet catalog page is fully functional with seed data
- VehicleCard links to `/fleet/:slug` which currently shows the VehicleDetailPage placeholder
- Phase 5 (Vehicle Detail Pages) can build on the useVehicles hook pattern and Vehicle type
- ExperienceFilter is a reusable component that could be used elsewhere

---
*Phase: 04-fleet-catalog-page*
*Completed: 2026-02-15*
