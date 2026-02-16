# External Integrations

**Analysis Date:** 2026-02-15

## APIs & External Services

**None detected.** This is a fully static single-page application with no API calls, no fetch/axios requests, and no backend communication. All content is hardcoded in `app/src/config.ts`.

## Data Storage

**Databases:**
- None - No database connections, no ORM, no data persistence

**File Storage:**
- Local filesystem only - Static images served from `app/public/images/` (18 image files: hero, fleet, gallery, experience, testimonial assets)

**Caching:**
- None - No service worker, no client-side caching strategy

## Authentication & Identity

**Auth Provider:**
- None - No authentication system, no login flows, no user sessions
- Note: `react-hook-form`, `zod`, and `input-otp` are installed as dependencies but not used in any current section component. These suggest future plans for a booking/reservation form or user authentication flow.

## External Fonts

**Google Fonts (CDN):**
- Loaded via CSS `@import` in `app/src/index.css`
- Inter: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`
- Playfair Display: `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap`
- These are the only external network requests the application makes

## Social Media Links

**Outbound links only (no API integration):**
- Instagram: `https://instagram.com/spacecityrentals` - configured in `app/src/config.ts` heroConfig and footerConfig
- Twitter: `https://twitter.com/spacecityrentals` - configured in `app/src/config.ts` heroConfig and footerConfig
- Facebook: `https://facebook.com/spacecityrentals` - configured in `app/src/config.ts` heroConfig and footerConfig
- LinkedIn: `https://linkedin.com/company/spacecityrentals` - configured in `app/src/config.ts` footerConfig only

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry, LogRocket, or similar service

**Analytics:**
- None - No Google Analytics, Plausible, or similar service

**Logs:**
- None - No logging framework, no console.log statements in production code

## CI/CD & Deployment

**Hosting:**
- Not detected - No deployment configuration files (no `vercel.json`, `netlify.toml`, `Dockerfile`, etc.)
- Pre-built `app/dist/` directory suggests manual or external build process
- Vite `base: './'` config enables deployment to any static host subdirectory

**CI Pipeline:**
- None - No `.github/workflows/`, no CI configuration files

## Environment Configuration

**Required env vars:**
- None - The application has zero environment variable dependencies

**Secrets location:**
- Not applicable - No secrets, API keys, or credentials are used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Third-Party Scripts

**CDN Dependencies:**
- Google Fonts CSS (loaded at runtime via `@import` in `app/src/index.css`)

**No other third-party scripts:**
- No analytics scripts
- No ad trackers
- No chat widgets
- No payment processors

## Future Integration Points

Based on installed-but-unused dependencies and the business context (luxury vehicle rental), likely future integrations include:

**Booking/Reservation System:**
- `react-hook-form` ^7.70.0, `@hookform/resolvers` ^5.2.2, `zod` ^4.3.5 are installed and ready for form validation
- The Visit section has a "Check Availability" CTA button that currently does nothing (`app/src/sections/Visit.tsx` line 96)
- All fleet items have pricing text but no booking links

**Payment Processing:**
- Not yet integrated - The `visitConfig.description` references "$200 refundable deposit" but no payment SDK is installed

**Content Management:**
- Currently all content lives in `app/src/config.ts` - any CMS integration would replace this file's exports

---

*Integration audit: 2026-02-15*
