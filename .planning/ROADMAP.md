# Roadmap: Space City Luxury Rentals

**Created:** 2026-02-15
**Depth:** Comprehensive
**Phases:** 9
**Coverage:** 20/20 v1 requirements mapped

## Overview

This roadmap transforms the existing cinematic landing page into a functional luxury car rental platform. The 9 phases progress from infrastructure foundation (routing, backend) through public-facing features (catalog, booking) to operator tools (admin panel) and finally production deployment. Each phase delivers a coherent, verifiable capability. The critical gating risk -- preserving GSAP animations through the React Router migration -- is isolated in Phase 1.

---

## Phase 1: Routing & Animation Survival

**Goal:** The existing cinematic landing page works identically after React Router is introduced -- no broken animations, no scroll issues, no memory leaks.

**Dependencies:** None (first phase)

**Requirements:**
- INFRA-01: React Router integrated without breaking existing GSAP landing page animations

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Dependencies, bug fixes, config, and centralized GSAP registration
- [ ] 01-02-PLAN.md -- Migrate all 6 section components from useEffect to useGSAP
- [ ] 01-03-PLAN.md -- Router integration (LandingPage, App shell, BrowserRouter) and verification

**Success Criteria:**
1. User can visit the root URL and see the full landing page with all 7 sections, GSAP scroll animations, and Lenis smooth scrolling working identically to the pre-routing state
2. User can navigate to a non-root URL (e.g., /fleet) and back to the landing page without animations doubling, breaking, or leaking memory
3. User can refresh the browser on any route without getting a 404 (vercel.json rewrite configured)

---

## Phase 2: Supabase Foundation

**Goal:** The backend infrastructure exists and is secured -- database tables, auth, storage, and Row Level Security are all configured and protecting customer data.

**Dependencies:** Phase 1 (routing must exist so Supabase client can be initialized in the app shell)

**Requirements:**
- INFRA-02: Supabase backend configured (auth, PostgreSQL database, file storage for vehicle images)
- INFRA-03: Supabase Row Level Security (RLS) policies protecting customer data and admin operations

**Success Criteria:**
1. Joey's admin account exists in Supabase Auth and can authenticate with email/password (public signup is disabled)
2. The vehicles and bookings tables exist with the correct schema, and RLS policies enforce that anonymous users can only read active vehicles and insert bookings -- not update, delete, or read other customers' data
3. Supabase Storage bucket for vehicle images exists with appropriate access policies
4. The frontend app initializes TanStack Query and AuthProvider without errors, and environment variables are configured for the Supabase connection

---

## Phase 3: Public Layout & Brand Shell

**Goal:** Every public page (fleet, vehicle detail, booking, status) shares a consistent branded header and footer with the Space City Luxury Rentals logo, and the layout is fully responsive across devices.

**Dependencies:** Phase 1 (routing), Phase 2 (Supabase client for potential auth state in header)

**Requirements:**
- BRAND-01: Space City Luxury Rentals logo displayed in site header/navigation
- BRAND-04: Fully responsive mobile-first design across all pages

**Success Criteria:**
1. User sees the Space City Luxury Rentals logo in the site header on every public page (fleet, vehicle detail, booking, status)
2. User can navigate between pages using header navigation links (Home, Fleet, and any other primary nav items)
3. The header, footer, and page content display correctly on mobile (375px), tablet (768px), and desktop (1440px) viewports with no horizontal overflow or broken layouts

---

## Phase 4: Fleet Catalog Page

**Goal:** Users can browse Joey's full fleet on a dedicated page, with vehicles presented as identity propositions -- not spec sheets -- and can filter by experience to find vehicles that match their occasion.

**Dependencies:** Phase 2 (vehicle data from Supabase), Phase 3 (public layout shell)

**Requirements:**
- CAT-01: User can browse all available vehicles on a fleet page with photos, identity headlines, and starting prices
- CAT-03: User can filter/browse vehicles by experience tags (Date Night, Content Ready, Boss Move, Wedding Day, Weekend Takeover, Statement)
- BRAND-03: Identity headlines used for vehicles instead of spec sheets ("Move in Silence. Let the Car Do the Talking.")

**Success Criteria:**
1. User visits /fleet and sees all active vehicles displayed as cards with a hero photo, identity headline (not make/model/year), and starting daily price
2. User can filter vehicles by experience tag (Date Night, Content Ready, Boss Move, Wedding Day, Weekend Takeover, Statement) and see only matching vehicles
3. Each vehicle card links to its detail page, giving users a clear path to learn more
4. The fleet page loads vehicle data from Supabase (not hardcoded config) and displays a loading state while fetching

---

## Phase 5: Vehicle Detail Pages

**Goal:** Each vehicle has its own cinematic detail page that sells the identity experience -- with hero imagery, social proof, and a clear path to book.

**Dependencies:** Phase 4 (fleet page links to detail pages; shared vehicle data patterns)

**Requirements:**
- CAT-02: User can view individual vehicle detail pages with image gallery, full description, pricing, and booking CTA
- CAT-04: Each vehicle displays social proof metrics (rental count, popularity indicators)
- BRAND-02: Vehicles presented with cinematic imagery (hero-style photos, moody lighting, lifestyle context)

**Success Criteria:**
1. User clicks a vehicle card on the fleet page and arrives at a detail page (e.g., /fleet/rolls-royce-ghost) with a hero image gallery, full description, identity headline, experience tags, and daily pricing
2. User sees social proof on the vehicle detail page -- rental count and/or popularity indicators that signal demand
3. User sees a prominent "Book This Vehicle" CTA button that navigates to the booking flow with the vehicle pre-selected
4. Vehicle images are presented cinematically (hero-scale, atmospheric) consistent with the brand's moody, aspirational design language

---

## Phase 6: Guest Booking Flow

**Goal:** A user who wants a vehicle can go from "I want this" to "booking submitted" in under 60 seconds -- with confirmation code in hand and the ability to check status later.

**Dependencies:** Phase 5 (booking CTA on vehicle detail page), Phase 2 (bookings table in Supabase)

**Requirements:**
- BOOK-01: User can submit a booking request as a guest (name, phone, email, dates, vehicle) in under 60 seconds
- BOOK-02: User sees a confirmation page with confirmation code and booking status after submitting
- BOOK-03: User can check booking status by entering confirmation code or email
- BOOK-04: User acknowledges rental terms/agreement before submitting a booking request

**Success Criteria:**
1. User can complete the entire booking flow (select dates, enter name/phone/email, acknowledge terms, submit) in under 60 seconds without creating an account
2. After submitting, user sees a confirmation page displaying their unique confirmation code and current booking status (pending)
3. User can visit a status-check page, enter their confirmation code or email, and see the current status of their booking (pending, approved, or declined) along with any notes from Joey
4. User must acknowledge rental terms before the booking form can be submitted (checkbox or modal acceptance)
5. The booking form validates input in real time (valid email, valid phone, dates in the future, required fields) and shows clear error messages

---

## Phase 7: Admin Authentication & Vehicle Management

**Goal:** Joey can log in to a private admin panel and fully manage his fleet -- adding new vehicles with photos, editing details and pricing, and removing vehicles from the catalog.

**Dependencies:** Phase 2 (Supabase auth + storage), Phase 4 (vehicles displayed publicly -- admin manages what guests see)

**Requirements:**
- ADMIN-01: Joey can log in to the admin panel with email/password (single admin account)
- ADMIN-02: Joey can add, edit, and delete vehicles with photo upload, pricing, descriptions, and experience tags

**Success Criteria:**
1. Joey can navigate to /admin, enter his email and password, and access the admin panel -- no other user can log in
2. Joey can add a new vehicle with photos (uploaded to Supabase Storage), daily price, identity headline, description, and experience tags -- and the vehicle appears on the public fleet page
3. Joey can edit any existing vehicle's details (photos, price, description, tags) and see changes reflected on the public site
4. Joey can delete or deactivate a vehicle, removing it from the public fleet page
5. Unauthenticated users who visit /admin are redirected to the login page

---

## Phase 8: Admin Booking Management & Dashboard

**Goal:** Joey can see every booking request in one place, approve or decline with notes the customer can see, and get a quick overview of his business health from a dashboard.

**Dependencies:** Phase 6 (bookings exist in database), Phase 7 (admin auth and layout)

**Requirements:**
- ADMIN-03: Joey can view all booking requests and approve or decline them with notes visible to the customer
- ADMIN-04: Joey sees a dashboard with quick stats (total bookings, pending requests, active vehicles)

**Success Criteria:**
1. Joey sees a dashboard on admin login showing total bookings, pending requests count, and number of active vehicles
2. Joey can view a list of all booking requests, filterable by status (pending, approved, declined)
3. Joey can approve or decline a booking request and add notes that the customer will see when checking their booking status
4. When Joey approves or declines a booking, the status change appears immediately (optimistic update) and persists on page refresh

---

## Phase 9: Production Deploy & Polish

**Goal:** The complete platform is deployed to Vercel, accessible at the production URL, and performs well across browsers and devices.

**Dependencies:** All previous phases (full platform must be functional before production deployment)

**Requirements:**
- INFRA-04: Deployed to Vercel with proper routing configuration

**Success Criteria:**
1. The full platform (landing page, fleet catalog, vehicle details, booking flow, booking status, admin panel) is accessible at the production Vercel URL
2. All routes work correctly on direct access and browser refresh (no 404s) in the production deployment
3. The landing page GSAP animations and smooth scroll work correctly in production builds (no animation breakage from minification or tree-shaking)
4. The site loads and functions correctly on Chrome, Safari, and Firefox on both desktop and mobile

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|-------------|--------|
| 1 | Routing & Animation Survival | INFRA-01 | ✓ Complete |
| 2 | Supabase Foundation | INFRA-02, INFRA-03 | ✓ Complete |
| 3 | Public Layout & Brand Shell | BRAND-01, BRAND-04 | ✓ Complete |
| 4 | Fleet Catalog Page | CAT-01, CAT-03, BRAND-03 | ✓ Complete |
| 5 | Vehicle Detail Pages | CAT-02, CAT-04, BRAND-02 | ✓ Complete |
| 6 | Guest Booking Flow | BOOK-01, BOOK-02, BOOK-03, BOOK-04 | ✓ Complete |
| 7 | Admin Auth & Vehicle Management | ADMIN-01, ADMIN-02 | ✓ Complete |
| 8 | Admin Booking Management & Dashboard | ADMIN-03, ADMIN-04 | ✓ Complete |
| 9 | Production Deploy & Polish | INFRA-04 | ✓ Complete |

## Coverage

| Requirement | Phase | Mapped |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Yes |
| INFRA-02 | Phase 2 | Yes |
| INFRA-03 | Phase 2 | Yes |
| BRAND-01 | Phase 3 | Yes |
| BRAND-04 | Phase 3 | Yes |
| CAT-01 | Phase 4 | Yes |
| CAT-03 | Phase 4 | Yes |
| BRAND-03 | Phase 4 | Yes |
| CAT-02 | Phase 5 | Yes |
| CAT-04 | Phase 5 | Yes |
| BRAND-02 | Phase 5 | Yes |
| BOOK-01 | Phase 6 | Yes |
| BOOK-02 | Phase 6 | Yes |
| BOOK-03 | Phase 6 | Yes |
| BOOK-04 | Phase 6 | Yes |
| ADMIN-01 | Phase 7 | Yes |
| ADMIN-02 | Phase 7 | Yes |
| ADMIN-03 | Phase 8 | Yes |
| ADMIN-04 | Phase 8 | Yes |
| INFRA-04 | Phase 9 | Yes |

**Total:** 20/20 v1 requirements mapped. No orphans. No duplicates.

---

*Roadmap created: 2026-02-15*
