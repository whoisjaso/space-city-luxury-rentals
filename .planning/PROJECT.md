# Space City Luxury Rentals

## What This Is

A luxury car rental platform for Joey's Houston-based business, Space City Luxury Rentals. This is not a car rental website — it's an identity transformation platform where customers purchase temporary access to their aspirational self. The platform enables customers to browse and book exotic and luxury vehicles, while giving Joey full control to manage his fleet, set pricing, and handle booking requests through an admin panel.

## Core Value

Customers can discover Joey's vehicles and submit a booking request with zero friction — and Joey can manage his fleet and respond to every request from a single admin panel.

## Requirements

### Validated

- ✓ Cinematic landing page with scroll-driven GSAP animations — existing
- ✓ Brand identity system (purple/gold/black palette, custom typography) — existing
- ✓ Responsive mobile-first design with mobile detection — existing
- ✓ Custom cursor experience for desktop users — existing
- ✓ Accessibility support (reduced motion, focus-visible, high contrast) — existing
- ✓ shadcn/ui component library integrated (50+ components available) — existing
- ✓ Form and validation libraries installed (react-hook-form, zod) — existing

### Active

- [ ] Vehicle catalog with cinematic presentation (identity headlines, experience tags, social proof)
- [ ] Individual vehicle pages with hero imagery, pricing, and booking CTA
- [ ] Guest booking flow (select vehicle > choose dates > submit request — under 60 seconds)
- [ ] Admin authentication (single account, email/password login for Joey)
- [ ] Admin vehicle management (upload photos, set/edit prices, manage vehicle details)
- [ ] Admin booking dashboard (view all requests, approve/decline with notes visible to customer)
- [ ] Customer booking status page (check status via confirmation code or email)
- [ ] Space City Luxury Rentals logo integrated across the site
- [ ] Backend API and database for vehicles, bookings, and admin auth

### Out of Scope

- Payment processing (Stripe, Square, etc.) — MVP uses manual approval; payments handled offline
- Customer accounts / login — guest booking only, reduces friction
- Built-in messaging / chat system — Joey approves/declines with notes; direct communication happens via phone/text
- Experience packages (Wedding, Content Pack, Boss Weekend) — future phase after core booking works
- Pre-rental anticipation sequences (48hr/24hr/2hr SMS) — future automation layer
- Abandoned booking recovery — future intelligence layer
- Dynamic pricing engine — Joey sets prices manually for now
- Membership / VIP program (Space City Black Card) — future scale phase
- AI voice agent / AI recommendations — future intelligence layer
- Multi-city expansion — Houston only for now
- Social content flywheel / Instagram integration — future marketing layer
- Delivery/concierge service booking — handled offline for now
- Referral system — future growth phase

## Context

### Business Context
Joey operates Space City Luxury Rentals in Houston, TX. The fleet includes exotic and luxury vehicles (Rolls-Royce, Lamborghini, Hellcat, etc.) rented for weekends, events, content creation, and lifestyle experiences. The Houston market skews toward five customer profiles: The Come-Up (young professionals/entrepreneurs), The Occasion Buyer (weddings/events), The Boss (executives/athletes), The Content Creator (influencers/videographers), and The Tourist/Visitor.

### Psychological Framework
A comprehensive psychological architecture document (`d:\SpaceCity-Rentals-Psychological-Architecture.md`) guides all design decisions. Key principles:
- **Identity transformation**: Customers buy temporary access to their aspirational self, not transportation
- **PCP Foundation**: Perception shift (private collection, not rental counter), Context shift (experience reservation, not rental agreement), Permission (neutralize guilt, replace with entitlement)
- **FATE activation**: Focus (pattern interrupt — this is NOT Enterprise), Authority (curated, minimal, intentional), Tribe (Houston's elite), Emotion (aspiration, desire)
- **Desire engineering**: Vehicles presented as identity propositions with cinematic imagery, identity headlines ("Move in Silence. Let the Car Do the Talking."), experience tags (Date Night, Content Ready, Boss Move, Wedding Day), and social proof
- **Impulse capture**: Booking flow must complete in under 60 seconds — capture commitment before rational brain catches up
- **Brand DNA**: Purple (royalty), Gold (visible wealth), Black (power without apology)

### Existing Codebase
Built on React 19 + Vite 7 + TypeScript. Current state is a static cinematic landing page with 7 sections (Hero, About, Exhibitions, Collections, Testimonials, Visit, Footer), GSAP ScrollTrigger animations, Lenis smooth scroll, and a config-driven content system. No routing, no backend, no API calls. shadcn/ui component library and form/validation libraries (react-hook-form, zod) are installed but unused. See `.planning/codebase/` for full analysis.

### Brand Assets
- Logo: `d:\SpaceCityRentalsLogoForReal.png` — ornate emblem with winged horses (Pegasus), shield, laurel wreaths, chain border in purple/gold/black
- Fonts: Inter (primary), Playfair Display (display/headlines)
- Colors: `--space-purple`, `--space-gold`, `--space-black` already defined in CSS

## Constraints

- **Stack**: Build on existing React + Vite + TypeScript frontend — do not start from scratch
- **Backend**: Needs a backend for vehicle data, bookings, and admin auth — Supabase recommended (auth, PostgreSQL, storage for vehicle images, minimal backend code)
- **Deployment**: Vercel for frontend hosting
- **Scope**: MVP only — two features (customer booking + admin management). Everything else is future work.
- **Single admin**: Only Joey needs admin access — no multi-user roles for now
- **No payments**: All payment handling happens offline. The site captures booking requests only.
- **Performance**: Must maintain the cinematic scroll experience and animation quality of the existing landing page

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build on existing codebase | Existing landing page has cinematic quality worth preserving; animations, brand system, and component library already in place | — Pending |
| Manual booking approval (no payments) | Gets Joey operational fastest; payment integration adds complexity without blocking the core loop | — Pending |
| Guest booking (no customer accounts) | Reduces friction to zero — aligns with psychological framework's impulse capture principle | — Pending |
| Single admin login for Joey | Only one person managing the fleet right now; multi-user adds unnecessary complexity | — Pending |
| Supabase for backend | Auth, PostgreSQL, file storage in one service; minimal backend code; generous free tier; works well with Vercel | — Pending |
| Vercel for deployment | Free tier, excellent DX, automatic deploys from git, edge network for performance | — Pending |
| Approve/decline with notes | Joey can communicate booking status and any messages to customers without building a full messaging system | — Pending |

---
*Last updated: 2026-02-15 after initialization*
