---
phase: 08-admin-booking-management
plan: 01
subsystem: admin-ui
tags: [admin, bookings, dashboard, react-query, optimistic-update]

dependency-graph:
  requires: [07-01]
  provides: [admin-dashboard, booking-management, booking-status-updates]
  affects: [09-01]

tech-stack:
  added: []
  patterns:
    - "Optimistic updates with rollback via useMutation onMutate/onError"
    - "Status filter tabs with badge count from parallel query"
    - "Expandable table rows with Fragment key wrapping"
    - "Modal overlay pattern for confirm actions"
    - "Responsive table-to-card layout switch at md breakpoint"

key-files:
  created:
    - app/src/hooks/useAdminBookings.ts
    - app/src/components/admin/DashboardStats.tsx
    - app/src/components/admin/BookingTable.tsx
    - app/src/components/admin/BookingActionModal.tsx
    - app/src/pages/admin/DashboardPage.tsx
    - app/src/pages/admin/BookingsPage.tsx
  modified:
    - app/src/App.tsx

decisions:
  - id: demo-bookings-mutable-array
    decision: "Demo mode uses mutable module-level BookingWithVehicle array"
    rationale: "Same pattern as useAdminVehicles; persists across remounts within session"
  - id: optimistic-booking-updates
    decision: "Optimistic updates via setQueriesData with rollback on error"
    rationale: "Status changes appear instant; rollback prevents stale UI on network failure"
  - id: parallel-query-for-pending-count
    decision: "BookingsPage fetches all bookings in parallel for pending tab badge"
    rationale: "Tab badge always shows correct count regardless of active filter"
  - id: expandable-rows-not-separate-page
    decision: "Click-to-expand rows for booking details (email, phone, notes)"
    rationale: "Keeps Joey in context; no page navigation needed to see contact info"

metrics:
  duration: "~4 minutes"
  completed: "2026-02-15"
  tasks: 1
  commits: 1
---

# Phase 8 Plan 01: Admin Dashboard & Booking Management Summary

**One-liner:** Admin dashboard with stat cards, booking table with status filter tabs, and approve/decline modal with customer-visible notes

## What Was Built

### useAdminBookings Hook (`app/src/hooks/useAdminBookings.ts`)
- `useAdminBookings(statusFilter?)`: Fetches all bookings with joined vehicle name/slug; optional status filter
- `useAdminStats()`: Returns total bookings, pending count, and active vehicles count
- `useUpdateBookingStatus()`: Mutation with optimistic updates -- patches cached queries immediately, rolls back on error, invalidates booking + stats queries on settle
- Demo mode: 5 mock bookings (3 pending, 1 approved, 1 declined) with realistic Houston-area data
- All hooks check `supabaseConfigured` and fall back to mutable module-level array

### DashboardStats Component (`app/src/components/admin/DashboardStats.tsx`)
- Three stat cards in responsive grid: Total Bookings, Pending Requests, Active Vehicles
- Pending card highlights gold (#D4AF37) when count > 0
- Dark card backgrounds (#1a1a1a) with loading skeleton state

### BookingTable Component (`app/src/components/admin/BookingTable.tsx`)
- Desktop: full table with columns (Code, Guest, Vehicle, Dates, Status, Actions)
- Mobile: card layout with tappable expand
- Click row to expand: reveals email (mailto link), phone (tel link), submitted date, admin notes
- Status badges: pending (yellow/gold), approved (green), declined (red)
- Action buttons: pending shows Approve + Decline; approved shows Decline; declined shows Approve

### BookingActionModal Component (`app/src/components/admin/BookingActionModal.tsx`)
- Modal overlay with booking summary (guest, vehicle, dates, code)
- Textarea for admin notes -- placeholder differs by action type
- Color-coded confirm button (green for approve, red for decline)
- Loading state while mutation processes

### DashboardPage (`app/src/pages/admin/DashboardPage.tsx`)
- Welcome header with Joey's name
- DashboardStats component
- Recent Bookings section: last 5 bookings in compact list format
- Quick links: "Manage Bookings" and "Manage Vehicles" with gold hover accents

### BookingsPage (`app/src/pages/admin/BookingsPage.tsx`)
- Status filter tabs: All, Pending, Approved, Declined
- Pending tab shows badge with count
- BookingTable with action handlers
- BookingActionModal shown on action button click
- useUpdateBookingStatus wired to modal confirm

### App.tsx Updates
- Replaced inline Dashboard placeholder (Phase 7 "--" cards) with DashboardPage
- Replaced inline Bookings placeholder with BookingsPage
- Added DashboardPage and BookingsPage imports

## Decisions Made

1. **Demo bookings use mutable module-level array** -- Same pattern as useAdminVehicles from Phase 7. Data persists across component remounts within a session.

2. **Optimistic updates with rollback** -- `useUpdateBookingStatus` uses `onMutate` to patch all cached booking queries immediately, with `onError` rollback. Status changes feel instant.

3. **Parallel query for pending count** -- BookingsPage fetches unfiltered bookings alongside filtered query so the Pending tab badge always shows correct count.

4. **Expandable rows for details** -- Contact info (email, phone) and admin notes visible on row expand. No separate detail page needed.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] TypeScript compiles with zero errors (`npx tsc --noEmit`)
- [x] Vite production build succeeds
- [x] Dashboard shows stat cards with real data from hooks
- [x] Booking table renders with status badges and action buttons
- [x] Status filter tabs work with pending count badge
- [x] Approve/decline modal shows booking summary and notes textarea
- [x] Optimistic updates patch cached queries immediately
- [x] Demo mode provides 5 realistic mock bookings
- [x] Mobile responsive: table switches to card layout at md breakpoint
- [x] Admin notes visible on customer booking status page (existing BookingStatusPage already renders admin_notes)

## Next Phase Readiness

Phase 8 complete. All admin requirements delivered:
- ADMIN-04: Booking management (view, filter, approve/decline)
- ADMIN-05: Dashboard with stats

Ready for Phase 9 (Production Deploy & Polish).
