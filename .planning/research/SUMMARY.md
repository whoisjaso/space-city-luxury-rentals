# Research Summary

**Project:** Space City Luxury Rentals
**Synthesized:** 2026-02-15
**Overall Confidence:** HIGH

---

## Executive Summary

Space City Luxury Rentals is a Houston-market luxury/exotic car rental platform built as a single-operator business (Joey). The platform differentiates itself by selling *identity and aspiration* rather than vehicle specifications -- a psychological framework that no Houston competitor currently employs. The existing codebase is a polished, animation-heavy React 19 SPA (Vite 7, GSAP, Lenis smooth scroll, Tailwind CSS, 50+ shadcn/ui components) that serves as an animated landing page. The MVP transforms this into a functional platform with a vehicle catalog, guest booking flow, and single-admin panel, backed by Supabase (PostgreSQL, Auth, Storage) and deployed on Vercel.

The recommended approach is lean and deliberate: add only 3 new production dependencies (@supabase/supabase-js, react-router v7, @tanstack/react-query v5) to the existing stack, which already has form handling (react-hook-form + zod), date picking, toasts, carousels, and charts installed but unused. The architecture follows a three-layout pattern -- the cinematic landing page remains self-contained with its GSAP animations, public functional pages (fleet, booking) get a standard layout, and the admin panel is completely separate behind auth. The database is minimal: two core tables (vehicles, bookings) with Row Level Security enforcing public-read/admin-write on vehicles and guest-insert/admin-manage on bookings.

The highest-risk area is the brownfield migration: introducing React Router into a page with 30+ GSAP ScrollTrigger instances and Lenis smooth scroll. If ScrollTrigger cleanup is not handled correctly during the routing introduction phase, memory leaks and broken animations will cascade through every subsequent phase. The second critical risk is Supabase RLS misconfiguration -- 83% of exposed Supabase databases stem from RLS mistakes, and this project handles customer PII (names, phones, emails). Both risks have well-documented prevention strategies and must be addressed in the first implementation phase.

---

## Key Findings

### From STACK.md

| Decision | Rationale |
|----------|-----------|
| **@supabase/supabase-js (not @supabase/ssr)** | Pure client-side SPA -- no SSR, no cookie-based sessions needed |
| **react-router v7 Data Mode (not Framework Mode)** | Integrates into existing Vite app without restructuring; provides loaders, error boundaries, pending states |
| **@tanstack/react-query v5** | Caching, background refetch, optimistic updates for admin panel; works alongside route loaders |
| **Keep Tailwind v3.4.19** | Upgrading to v4 is a non-trivial migration with zero benefit for this project |
| **No ORM (no Prisma, no Drizzle)** | Supabase PostgREST + generated TypeScript types provide type-safe access without a second schema source of truth |
| **No Redux/Zustand** | Auth in React Context, server state in TanStack Query, form state in react-hook-form -- nothing left to manage |
| **Prices in cents (integers)** | Universal standard for money in databases; avoids floating-point rounding errors |
| **Supabase free tier auto-pause** | CRITICAL: upgrade to Pro ($25/mo) before production launch; free tier pauses after 7 days inactivity |

Only 3 new production packages to install. 12 packages already installed and waiting to be activated (react-hook-form, zod, date-fns, react-day-picker, sonner, recharts, embla-carousel, cmdk, input-otp, react-resizable-panels, vaul, next-themes).

### From FEATURES.md

**Table Stakes (must ship or site feels broken):**
1. Vehicle catalog with high-quality photos (T1)
2. Individual vehicle detail pages (T2)
3. Visible pricing -- daily rates on cards (T3)
4. Guest booking request form -- under 60 seconds (T4)
5. Contact info: phone (tap-to-call), email, Instagram (T5)
6. Mobile-responsive design (T6 -- already exists)
7. Vehicle categorization/filtering (T7)
8. Business legitimacy signals: address, hours, social links (T8)
9. Booking confirmation with status check (T9)
10. Terms/policies page (T10)

**Differentiators (competitive advantage):**
- Identity headlines instead of spec sheets (D1) -- no competitor does this
- Experience tags: Date Night, Content Ready, Boss Move, Wedding Day (D2)
- Cinematic vehicle presentation extending existing design language (D5)
- Sub-60-second booking flow with zero account creation (D6)
- Single-owner admin dashboard purpose-built for one person (D11)
- Booking approval with contextual notes (D12)

**Anti-Features (deliberately NOT building):**
- Online payment / checkout (A1) -- Joey handles offline via cash/Zelle/CashApp
- Customer accounts / login (A2) -- friction kills impulse conversion
- Public availability calendar (A3) -- exposes fleet utilization to competitors
- Star ratings / review system (A5) -- one bad review on a small fleet is catastrophic
- Live chat / chatbot (A7) -- feels corporate, undermines boutique positioning
- Membership program (A10) -- premature before proving demand

### From ARCHITECTURE.md

**Three-Layout Pattern:**
- **LandingPage** -- no shared layout, self-contained GSAP/Lenis experience
- **PublicLayout** -- shared header/footer for fleet, booking, status pages; standard scroll
- **AdminLayout** -- sidebar + header, protected by auth guard; standard scroll

**Core Data Model:**
- `vehicles` table: UUID PK, slug, name, tagline, category, daily_rate (cents), images (text array), experience_tags, specs (JSONB), is_active, display_order
- `bookings` table: UUID PK, confirmation_code (auto-generated 8-char), vehicle_id FK, customer info, dates, status (pending/approved/declined/cancelled), admin_notes, internal_notes
- Confirmation code generated via database trigger (unique 8-char alphanumeric)

**Key Patterns:**
- Query hook per entity (useVehicles, useVehicle, useBookings, useCreateBooking)
- Form + Mutation + Redirect pattern (react-hook-form -> zod -> TanStack Query mutation -> navigate)
- Optimistic admin updates (approve/decline shows instantly, rolls back on failure)
- Auth context with useAuth() hook; ProtectedRoute component with Outlet pattern
- Route loaders prime TanStack Query cache; components use useQuery for reactive updates

**Anti-Patterns Identified:**
- Global GSAP registration in App shell (must stay in LandingPage only)
- Storing Supabase data in useState/useEffect (use TanStack Query)
- Service role key in frontend code (use anon key + RLS)
- Sharing layout between landing and functional pages (breaks cinematic flow)
- Supabase Realtime for everything (overkill; polling/caching is sufficient)

### From PITFALLS.md

**Top 5 Critical Pitfalls:**

| # | Pitfall | Risk | Prevention |
|---|---------|------|------------|
| P1 | **ScrollTrigger memory leaks on route change** | 30+ triggers become zombies, animations double, memory grows | Migrate to useGSAP() hook; add nuclear ScrollTrigger.killAll() cleanup |
| P2 | **Lenis scroll position corruption on navigation** | New pages render partway down; scroll history breaks | Scope Lenis to landing page ONLY; lenis.scrollTo(0, {immediate: true}) on route change |
| P3 | **Supabase RLS misconfiguration** | Customer PII exposed; 83% of exposed Supabase DBs are RLS mistakes | Enable RLS on EVERY table; test from client, not SQL Editor |
| P4 | **Service role key in client bundle** | God-mode database access exposed to every visitor | NEVER use service_role in VITE_ env vars; admin ops via Auth + RLS |
| P5 | **Vercel SPA routing 404s** | Every direct link and page refresh returns 404 | Create vercel.json with rewrite rule in same commit as React Router |

**Moderate Pitfalls:**
- P6: React 19 StrictMode double-mounting breaks GSAP (fix with useGSAP)
- P7: Config-to-database migration breaks synchronous rendering (add loading states, keep config as fallback)
- P8: Unoptimized vehicle photos destroy load times and blow through egress limits (resize on upload, serve optimized)
- P9: Custom cursor breaks accessibility (scope cursor:none to hover+fine pointer media query)
- P10: dangerouslySetInnerHTML with DB content creates XSS (replace with React components or sanitize with DOMPurify)
- P11: Supabase free tier auto-pause kills production site (upgrade to Pro or set up keep-alive cron)

**Existing Codebase Bugs Found During Research:**
- `useLenis.ts`: ticker cleanup creates a new anonymous function that never matches the one added -- ticker callback leaks
- `useScrollTrigger.ts`: config object as useEffect dependency changes every render -- infinite ScrollTrigger recreation
- Three separate `cursor: none` declarations with no accessibility media queries

---

## Implications for Roadmap

### Suggested Phase Structure

**Phase 1: Foundation and Routing Migration**

- Rationale: Everything depends on routing and Supabase. The landing page animation survival is the gating risk -- if animations break, nothing else matters.
- Delivers: React Router installed, existing landing page preserved as a route, Supabase project configured with schema/RLS/auth, Vercel rewrite configured, existing GSAP bugs fixed
- Features: None user-facing (infrastructure only)
- Must avoid: P1 (ScrollTrigger leaks), P2 (Lenis conflicts), P3 (RLS misconfiguration), P4 (service role exposure), P5 (Vercel 404s), P6 (StrictMode double-mount)
- Key tasks:
  - Install 3 production dependencies + Supabase CLI
  - Extract App.tsx content into LandingPage.tsx
  - Migrate useEffect GSAP patterns to useGSAP() hook
  - Fix useLenis ticker cleanup bug
  - Fix useScrollTrigger dependency bug
  - Set up React Router with BrowserRouter/Routes
  - Verify landing page animations survive routing
  - Create Supabase project, run schema migration (vehicles + bookings + RLS + triggers)
  - Set up auth (create Joey's account, disable public signup)
  - Create vercel.json with SPA rewrite
  - Set up TanStack Query client
  - Set up AuthProvider and Supabase client singleton
  - Generate TypeScript database types
  - Add .env.example and .env.local

**Phase 2: Vehicle Catalog (Public-Facing)**

- Rationale: Vehicle data is the foundation that booking depends on. Admin needs to populate vehicles before guests can browse and book.
- Delivers: Fleet page, vehicle detail pages, public layout with header/footer, identity-first vehicle presentation
- Features: T1 (catalog), T2 (detail pages), T3 (pricing), T7 (categorization), D1 (identity headlines), D2 (experience tags), D5 (cinematic presentation), D7 (delivery indication), D10 (multi-day pricing)
- Must avoid: P7 (config-to-DB migration breaks rendering), P8 (unoptimized photos), P14 (ScrollTrigger refresh after dynamic content)
- Key tasks:
  - Build PublicLayout (header + footer)
  - Seed vehicles table with current config.ts vehicle data
  - Build useVehicles and useVehicle query hooks
  - Build FleetPage with VehicleGrid and VehicleCard
  - Build VehicleDetailPage with hero image, identity headline, experience tags, pricing, booking CTA
  - Implement category filtering (Exotic, Luxury, SUV, Muscle)
  - Add image lazy loading and aspect-ratio constraints

**Phase 3: Guest Booking Flow**

- Rationale: Booking is the core conversion action. Requires vehicle catalog to exist so guests can select a vehicle.
- Delivers: Complete guest booking journey from vehicle selection through confirmation and status checking
- Features: T4 (booking form), T9 (confirmation + status check), D6 (sub-60-second flow), T5 (contact info), T8 (legitimacy signals), T10 (terms/policies)
- Must avoid: P13 (over-engineered form), P15 (missing error boundaries), P10 (XSS in content)
- Key tasks:
  - Build BookingPage with react-hook-form + zod validation
  - Minimal fields: vehicle (pre-selected), dates (react-day-picker), name, phone, email, optional occasion/notes
  - Build useCreateBooking mutation
  - Build BookingConfirmation view showing confirmation code
  - Build BookingStatusPage with lookup by confirmation code + email
  - Add error boundaries around data-dependent sections
  - Add contact info section (phone tap-to-call, email, Instagram)
  - Add static terms/policies page
  - Replace dangerouslySetInnerHTML instances with safe alternatives

**Phase 4: Admin Panel**

- Rationale: Most complex phase, least customer-facing. Joey needs this to manage vehicles and bookings, but guests need the catalog and booking flow first.
- Delivers: Complete admin dashboard for vehicle CRUD, image management, and booking approval/decline
- Features: D11 (admin dashboard), D12 (booking approval with notes), D13 (vehicle availability toggle), D14 (photo management)
- Must avoid: P4 (service role key), P8 (unoptimized image uploads)
- Key tasks:
  - Build AdminLoginPage
  - Build AdminLayout with sidebar navigation
  - Build AdminVehiclesPage with table (shadcn Table component)
  - Build AdminVehicleFormPage (add/edit) with react-hook-form
  - Build ImageUploader component (Supabase Storage, client-side resize before upload)
  - Build AdminBookingsPage with status filtering (pending/approved/declined)
  - Build AdminBookingDetailPage with approve/decline actions and notes
  - Add sonner toast notifications for all admin actions
  - Wire up optimistic updates for booking status changes

**Phase 5: Polish and Production Launch**

- Rationale: Pre-launch hardening. Accessibility, performance, and operational readiness.
- Delivers: Production-ready platform
- Must avoid: P9 (cursor accessibility), P11 (auto-pause)
- Key tasks:
  - Fix custom cursor accessibility (media queries, prefers-reduced-motion, aria-hidden)
  - Run Lighthouse audit and address LCP/CLS issues
  - Optimize image delivery pipeline
  - Upgrade Supabase to Pro tier ($25/mo)
  - Set up error monitoring (basic window.onerror or Sentry)
  - Cross-browser testing (Chrome, Safari, Firefox, mobile)
  - Final content review with Joey (vehicle copy, identity headlines, terms)

### Research Flags

| Phase | Needs `/gsd:research-phase`? | Rationale |
|-------|------------------------------|-----------|
| Phase 1: Foundation | YES | GSAP-to-useGSAP migration has codebase-specific complexity; Supabase RLS policies need validation against actual schema |
| Phase 2: Vehicle Catalog | NO | Standard patterns; TanStack Query hooks are well-documented; shadcn Table and Card components are straightforward |
| Phase 3: Booking Flow | NO | react-hook-form + zod + TanStack mutation is a well-documented pattern; booking UX is simple (minimal fields by design) |
| Phase 4: Admin Panel | MAYBE | Image upload with client-side resize may need research; Supabase Storage patterns are documented but resize-before-upload varies |
| Phase 5: Polish | NO | Standard audit and optimization work |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package choices verified against official docs; versions confirmed against existing package.json |
| Features | MEDIUM-HIGH | Competitive analysis verified across 7+ Houston competitors; anti-features well-reasoned against project's psychological framework |
| Architecture | HIGH | Three-layout pattern, data flow, and component boundaries directly derived from codebase analysis and official React Router/Supabase/TanStack docs |
| Pitfalls | HIGH | Critical pitfalls verified against official GSAP docs, Supabase CVE reports, and direct codebase inspection; 3 actual bugs found in existing code |

**Gaps to address during planning:**

1. **Image optimization pipeline specifics** -- Client-side resize before Supabase upload is the recommendation, but the exact library/approach (canvas API, sharp in Edge Function, or a third-party service) was not deeply evaluated. Phase 4 research should cover this.
2. **SEO for vehicle pages** -- The SPA architecture means vehicle pages are not server-rendered. If SEO matters for organic search traffic (e.g., "rent Lamborghini Houston"), pre-rendering or SSG may be needed later. Not an MVP concern -- Instagram-to-site is the primary discovery channel.
3. **Email notifications** -- The research does not cover sending booking confirmation or status-change emails to customers. Supabase can trigger emails via database webhooks or Edge Functions, but this was not researched. Consider for Phase 3 or as a fast-follow.
4. **RLS policy testing methodology** -- The exact approach to validating RLS policies (automated tests vs. manual client-side verification) was not specified. Phase 1 should include a concrete testing plan.
5. **Database schema minor differences** -- STACK.md proposes a separate `vehicle_images` table while ARCHITECTURE.md uses a `text[]` array column. The array approach is simpler for MVP (fewer joins, simpler CRUD). Recommend the array approach for Phase 2, with the option to extract to a separate table later if image metadata (alt text, sort order) becomes important.

---

## Sources

### Official Documentation (HIGH Confidence)
- [Supabase React Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [React Router v7 Modes](https://reactrouter.com/start/modes)
- [React Router v7 SPA How-To](https://reactrouter.com/how-to/spa)
- [TanStack Query v5 Overview](https://tanstack.com/query/v5/docs/framework/react/overview)
- [GSAP React Integration Guide](https://gsap.com/resources/React/)
- [@gsap/react npm Package](https://www.npmjs.com/package/@gsap/react)
- [React StrictMode](https://react.dev/reference/react/StrictMode)
- [Vercel KB - 404 Errors](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)

### Competitor Analysis (MEDIUM-HIGH Confidence)
- [mph club](https://mphclub.com/) -- fleet presentation, membership model
- [Uptown Exotics](https://uptownexotics.com/) -- Houston pricing display, categories
- [Royal Exotics USA](https://royalexoticsusa.com/) -- brand filtering, loyalty
- [iExotic](https://iexoticauto.com/) -- concierge positioning
- [Auto Rental News: Exotic Rental Market](https://www.autorentalnews.com/146495/understanding-the-exotic-rental-market)

### Community / Issue Trackers (MEDIUM Confidence)
- [GSAP Forum - ScrollTrigger + React Router](https://gsap.com/community/forums/topic/28327-scrolltrigger-breaks-react-router/)
- [Lenis GitHub Issue #319](https://github.com/darkroomengineering/lenis/issues/319)
- [Supabase Security Flaw: 170+ Apps Exposed](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Custom Cursor Accessibility](https://dbushell.com/2025/10/27/custom-cursor-accessibility/)

---

*Research synthesis completed: 2026-02-15*
