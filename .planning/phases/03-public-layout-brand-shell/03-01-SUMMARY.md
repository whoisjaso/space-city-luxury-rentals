---
phase: 03-public-layout-brand-shell
plan: 01
subsystem: navigation-layout
tags: [react-router, layout, header, mobile-menu, navigation, responsive, brand]
completed: 2026-02-15
duration: ~3 min

dependency-graph:
  requires: [01-03]
  provides: [public-layout-shell, public-header, mobile-menu, route-structure]
  affects: [04-01, 05-01, 06-01, 07-01]

tech-stack:
  added: []
  patterns:
    - "React Router layout routes with Outlet for shared header/footer"
    - "Scroll-reactive sticky header with backdrop blur"
    - "Slide-out mobile menu with body scroll lock and escape key close"
    - "Hash links for landing page sections, route links for public pages"

key-files:
  created:
    - app/src/components/PublicHeader.tsx
    - app/src/components/MobileMenu.tsx
    - app/src/layouts/PublicLayout.tsx
    - app/src/pages/FleetPage.tsx
    - app/src/pages/VehicleDetailPage.tsx
    - app/src/pages/BookingPage.tsx
    - app/src/pages/BookingStatusPage.tsx
  modified:
    - app/src/App.tsx

decisions:
  - id: layout-route-pattern
    choice: "React Router layout route with Outlet instead of wrapper component"
    rationale: "Cleaner nested route structure; each public page is a child route of PublicLayout"
  - id: hash-vs-route-links
    choice: "Hash links (/#experiences, /#contact) use <a> tags; route links use react-router <Link>"
    rationale: "Hash links need native behavior for Lenis smooth scroll on landing page"
  - id: mobile-menu-slide-panel
    choice: "Right-side slide-out panel instead of full-screen overlay"
    rationale: "More refined UX; shows backdrop click-to-close and maintains spatial orientation"
---

# Phase 3 Plan 1: Public Layout Shell with Header, Mobile Menu, and Routing Summary

**One-liner:** Sticky header with gold-accent navigation, slide-out mobile menu with body scroll lock, and PublicLayout wrapping all non-landing routes via React Router Outlet pattern.

## What Was Done

### Task 1: Public layout shell with header, mobile menu, and routing

Created the complete public-facing navigation architecture.

**PublicHeader.tsx:**
- Fixed header at z-50 with scroll-reactive background transition (transparent -> dark with backdrop-blur)
- Left: Logo image (h-10 w-10) + "SPACE CITY" museo-label text, linked to home
- Right (desktop): Four nav links -- Home (/), Fleet (/fleet), Experiences (/#experiences), Contact (/#contact)
- Right (mobile): Hamburger button with three lines, triggers MobileMenu
- Active route detection with gold highlight color (var(--space-gold))
- Hash links use `<a>` tags for Lenis compatibility on landing page; route links use react-router `<Link>`
- Auto-closes mobile menu on route change via location.pathname effect

**MobileMenu.tsx:**
- Slide-out panel from right (max-w-sm) with dark background and border
- Semi-transparent backdrop with click-to-close
- Header with logo and X close button (lucide-react)
- Stacked nav links with gold hover/active states and bottom border separators
- "View Fleet" CTA button at bottom with gold background
- Body scroll lock when open (overflow: hidden on body)
- Escape key listener for keyboard accessibility
- Cleanup on unmount restores body overflow

**PublicLayout.tsx:**
- Uses React Router Outlet pattern for nested route rendering
- Renders PublicHeader at top, main content with pt-[72px] for fixed header offset, Footer at bottom
- Dark background (#050505) as base
- Reuses existing Footer from sections/Footer

**App.tsx routing updates:**
- "/" -> LandingPage (standalone, no PublicLayout -- keeps its cinematic Hero nav)
- PublicLayout wraps: /fleet, /fleet/:slug, /book, /book/:code
- /admin -> inline placeholder (Phase 7)
- "*" -> Navigate to "/" (catch-all redirect)

**Placeholder pages:**
- FleetPage, VehicleDetailPage, BookingPage, BookingStatusPage -- minimal content with museo typography
- VehicleDetailPage reads :slug param, BookingStatusPage reads :code param

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout route pattern | React Router Outlet instead of wrapper HOC | Cleaner nested route structure; pages are child routes of layout |
| Hash vs route links | `<a>` for hash links, `<Link>` for route links | Hash links need native behavior for Lenis smooth scroll on landing page |
| Mobile menu style | Right-side slide-out panel | More refined than full-screen; backdrop click-to-close maintains orientation |
| Header scroll behavior | Transparent -> dark with backdrop-blur at 20px scroll | Matches cinematic feel; transparent lets hero images breathe at top |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] PublicHeader displays logo and navigation links
- [x] PublicHeader is fixed at top with backdrop blur on scroll
- [x] MobileMenu provides hamburger menu for mobile with smooth open/close
- [x] PublicLayout wraps content with PublicHeader and Footer
- [x] App.tsx uses PublicLayout for fleet, vehicle detail, booking, and status routes
- [x] Landing page does NOT use PublicLayout (standalone route)
- [x] Responsive: hamburger at mobile (md breakpoint), full nav at desktop
- [x] TypeScript compiles with zero errors
- [x] Vite production build succeeds

## Commits

| Hash | Message |
|------|---------|
| 610a629 | feat(03-01): public layout shell with header, mobile menu, and routing |

## Next Phase Readiness

Phase 3 Plan 1 establishes the navigation shell for all public pages:
- PublicLayout is ready to wrap real page content in Phases 4-6
- Fleet route (/fleet) is wired and ready for FleetPage implementation (Phase 4)
- Vehicle detail route (/fleet/:slug) is wired and ready (Phase 5)
- Booking routes (/book, /book/:code) are wired and ready (Phase 6)
- Header gold accent and brand styling set the visual tone for all subsequent public pages
