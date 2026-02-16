# Requirements: Space City Luxury Rentals

**Defined:** 2026-02-15
**Core Value:** Customers can discover Joey's vehicles and submit a booking request with zero friction — and Joey can manage his fleet and respond to every request from a single admin panel.

## v1 Requirements

### Vehicle Catalog

- [x] **CAT-01**: User can browse all available vehicles on a fleet page with photos, identity headlines, and starting prices
- [x] **CAT-02**: User can view individual vehicle detail pages with image gallery, full description, pricing, and booking CTA
- [x] **CAT-03**: User can filter/browse vehicles by experience tags (Date Night, Content Ready, Boss Move, Wedding Day, Weekend Takeover, Statement)
- [x] **CAT-04**: Each vehicle displays social proof metrics (rental count, popularity indicators)

### Booking

- [x] **BOOK-01**: User can submit a booking request as a guest (name, phone, email, dates, vehicle) in under 60 seconds
- [x] **BOOK-02**: User sees a confirmation page with confirmation code and booking status after submitting
- [x] **BOOK-03**: User can check booking status by entering confirmation code or email
- [x] **BOOK-04**: User acknowledges rental terms/agreement before submitting a booking request

### Admin

- [ ] **ADMIN-01**: Joey can log in to the admin panel with email/password (single admin account)
- [ ] **ADMIN-02**: Joey can add, edit, and delete vehicles with photo upload, pricing, descriptions, and experience tags
- [ ] **ADMIN-03**: Joey can view all booking requests and approve or decline them with notes visible to the customer
- [ ] **ADMIN-04**: Joey sees a dashboard with quick stats (total bookings, pending requests, active vehicles)

### Design & Brand

- [x] **BRAND-01**: Space City Luxury Rentals logo displayed in site header/navigation
- [x] **BRAND-02**: Vehicles presented with cinematic imagery (hero-style photos, moody lighting, lifestyle context)
- [x] **BRAND-03**: Identity headlines used for vehicles instead of spec sheets ("Move in Silence. Let the Car Do the Talking.")
- [x] **BRAND-04**: Fully responsive mobile-first design across all pages

### Infrastructure

- [x] **INFRA-01**: React Router integrated without breaking existing GSAP landing page animations
- [x] **INFRA-02**: Supabase backend configured (auth, PostgreSQL database, file storage for vehicle images)
- [x] **INFRA-03**: Supabase Row Level Security (RLS) policies protecting customer data and admin operations
- [ ] **INFRA-04**: Deployed to Vercel with proper routing configuration

## v2 Requirements

### Payments

- **PAY-01**: Customer can pay a refundable deposit online via Stripe to lock in booking
- **PAY-02**: Full rental payment processing through the site

### Customer Accounts

- **ACCT-01**: Customer can create account with email/password
- **ACCT-02**: Customer can view booking history
- **ACCT-03**: Customer session persists across browser refresh

### Experience Packages

- **PKG-01**: Wedding Day package with vehicle + chauffeur + extras
- **PKG-02**: Content Pack for influencers (vehicle + time block + photo locations)
- **PKG-03**: Boss Weekend package (vehicle + delivery + concierge)

### Automation

- **AUTO-01**: Pre-rental anticipation SMS sequence (48hr/24hr/2hr before pickup)
- **AUTO-02**: Post-return follow-up with discount code and photo
- **AUTO-03**: Abandoned booking recovery emails

### Growth

- **GROW-01**: Referral code system
- **GROW-02**: Customer reviews/testimonials engine
- **GROW-03**: Dynamic pricing engine (event-based, utilization-based)
- **GROW-04**: Space City Black Card membership program

### Delivery

- **DELV-01**: Delivery/concierge service booking through the site
- **DELV-02**: Airport pickup/dropoff scheduling

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI voice agent | High complexity, not needed for MVP operations |
| AI vehicle recommendations | Requires behavioral tracking data that doesn't exist yet |
| Multi-city expansion | Houston only; expand after proven model |
| Brand partnerships platform | Business development, not a software feature |
| Social content flywheel | Automated reposting/content engine deferred; Instagram handled manually |
| Real-time chat/messaging | Joey communicates via phone/text; admin notes sufficient for v1 |
| Content licensing framework | Commercial shoot agreements handled offline |
| Fleet utilization analytics | Deferred until enough booking data exists to be meaningful |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAT-01 | Phase 4: Fleet Catalog Page | Pending |
| CAT-02 | Phase 5: Vehicle Detail Pages | Pending |
| CAT-03 | Phase 4: Fleet Catalog Page | Pending |
| CAT-04 | Phase 5: Vehicle Detail Pages | Pending |
| BOOK-01 | Phase 6: Guest Booking Flow | Pending |
| BOOK-02 | Phase 6: Guest Booking Flow | Pending |
| BOOK-03 | Phase 6: Guest Booking Flow | Pending |
| BOOK-04 | Phase 6: Guest Booking Flow | Pending |
| ADMIN-01 | Phase 7: Admin Auth & Vehicle Management | Pending |
| ADMIN-02 | Phase 7: Admin Auth & Vehicle Management | Pending |
| ADMIN-03 | Phase 8: Admin Booking Management & Dashboard | Pending |
| ADMIN-04 | Phase 8: Admin Booking Management & Dashboard | Pending |
| BRAND-01 | Phase 3: Public Layout & Brand Shell | Pending |
| BRAND-02 | Phase 5: Vehicle Detail Pages | Pending |
| BRAND-03 | Phase 4: Fleet Catalog Page | Pending |
| BRAND-04 | Phase 3: Public Layout & Brand Shell | Pending |
| INFRA-01 | Phase 1: Routing & Animation Survival | Complete |
| INFRA-02 | Phase 2: Supabase Foundation | Pending |
| INFRA-03 | Phase 2: Supabase Foundation | Pending |
| INFRA-04 | Phase 9: Production Deploy & Polish | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after roadmap creation*
