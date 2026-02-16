# Domain Pitfalls

**Domain:** Luxury car rental platform (brownfield SPA evolution)
**Stack:** React 19 + Vite 7 + GSAP + Lenis + Supabase + Vercel
**Researched:** 2026-02-15

---

## Critical Pitfalls

Mistakes that cause rewrites, data exposure, or broken user experience.

---

### Pitfall 1: ScrollTrigger Memory Leaks and Ghost Animations on Route Changes

**What goes wrong:** When React Router is introduced, navigating away from a page unmounts components but does NOT automatically kill their ScrollTrigger instances. Orphaned ScrollTriggers continue listening to scroll events on elements that no longer exist. On returning to the page, new triggers are created alongside zombies from the previous visit. The result is doubled animations, janky scroll behavior, and steadily increasing memory consumption.

**Why it happens:** The current codebase uses raw `useEffect` with manual `ScrollTrigger.create()` calls in every section component (Hero, About, Exhibitions, Collections, Testimonials, Visit). Each component registers its own `gsap.registerPlugin(ScrollTrigger)` call and manages its own `triggersRef` array. This pattern works in a single-page-that-never-unmounts but breaks the moment components mount/unmount during navigation.

**Specific codebase evidence:**
- `Hero.tsx` lines 20-72: Uses `useEffect` with manual trigger cleanup via `triggersRef`
- `Collections.tsx` lines 17-95: Creates 3 ScrollTrigger instances per card (pin, dim, text reveal) -- up to 12 triggers for 4 cards
- `About.tsx` lines 17-98: Creates triggers for text reveals, parallax columns, image wraps, and stats -- easily 10+ triggers
- `useLenis.ts` lines 26-28: Adds a function to `gsap.ticker` but the cleanup creates a NEW anonymous function that does not match the one added, so the ticker callback is never actually removed
- `useScrollTrigger.ts` lines 23-40: Uses `config` object as useEffect dependency, which changes on every render (new object reference), causing infinite recreation of ScrollTriggers

**Consequences:**
- Memory leak grows with each page navigation cycle
- Animations play incorrectly (doubled timelines, wrong positions)
- Scroll performance degrades progressively
- Lenis-ScrollTrigger sync breaks when orphaned triggers fire on destroyed Lenis instances

**Prevention:**
1. Replace all `useEffect` + manual ScrollTrigger patterns with `useGSAP()` hook from `@gsap/react`. This hook wraps everything in `gsap.context()` and automatically reverts all GSAP instances (animations, ScrollTriggers, Draggables) on unmount.
2. Fix `useLenis.ts` ticker cleanup: store the callback in a `useRef` so the same function reference is used for both `gsap.ticker.add()` and `gsap.ticker.remove()`.
3. Fix `useScrollTrigger.ts`: memoize the config object or destructure individual properties as dependencies.
4. Add a global `ScrollTrigger.killAll()` call in the route-change handler as a safety net during the transition period.

**Detection (warning signs):**
- Open browser DevTools Performance tab: if memory increases after each navigation cycle, triggers are leaking
- Run `ScrollTrigger.getAll().length` in the console -- should match expected count for current page, not accumulate
- Animations "double up" or elements animate from wrong starting positions after back-navigation

**Phase mapping:** Must be addressed in the FIRST phase that introduces React Router -- before any new routes are added. Retrofitting ScrollTrigger cleanup after multiple routes exist is exponentially harder.

**Confidence:** HIGH -- verified against official GSAP React documentation and codebase inspection.

**Sources:**
- [GSAP React Documentation](https://gsap.com/resources/React/)
- [useGSAP Hook - @gsap/react](https://www.npmjs.com/package/@gsap/react)
- [ScrollTrigger + React Router Issue](https://gsap.com/community/forums/topic/28327-scrolltrigger-breaks-react-router/)
- [ScrollTrigger Route Change Fix](https://gsap.com/community/forums/topic/37475-gsap-scrolltrigger-doesnt-run-on-route-change-react-router-v6-route-transition-with-framer-motion/)

---

### Pitfall 2: Lenis Smooth Scroll Conflicts with React Router Navigation

**What goes wrong:** When navigating between routes, Lenis has the scroll position at an arbitrary point from the previous page. The new page renders partway down instead of at the top. Worse, if the user clicks a link while Lenis is still animating (has not come to a complete stop), the next page's scroll position is corrupted because Lenis's requestAnimationFrame loop updates `window.scroll` values that the router then saves to history.

**Why it happens:** Lenis overrides native scroll behavior by continuously updating scroll position via `requestAnimationFrame`. React Router's scroll restoration reads the scroll position to save it in history state -- but Lenis is updating that position constantly, creating a race condition.

**Specific codebase evidence:**
- `useLenis.ts` is called once in `App.tsx` line 29. When routing is introduced, `App.tsx` will wrap the router, meaning Lenis persists across routes. But it holds scroll positions from previous pages.
- Lenis is configured with `smoothWheel: true` and custom easing, which means scroll position is always "in motion" briefly after any interaction.

**Consequences:**
- Users land on new pages scrolled to random positions
- Scroll history (browser back button) restores wrong positions
- `ScrollTrigger.refresh()` fires with wrong scroll measurements, causing all triggers to miscalculate their start/end positions

**Prevention:**
1. On every route change, call `lenis.scrollTo(0, { immediate: true })` to instantly reset scroll position without animation.
2. Use React Router's `useLocation()` hook to detect route changes and trigger the reset.
3. Call `ScrollTrigger.refresh()` AFTER the new page has fully rendered (use a small `requestAnimationFrame` delay to ensure DOM is painted).
4. Consider wrapping Lenis in a context provider that exposes `scrollTo` and `stop` methods to route transition components.

**Detection:**
- Navigate to a new route and check if the page starts at the top
- Use browser back button and verify scroll position restoration
- Watch for `ScrollTrigger.refresh is not updating` warnings in console

**Phase mapping:** Same phase as React Router introduction. Must be solved before second route is added.

**Confidence:** HIGH -- confirmed by multiple Lenis GitHub issues and GSAP community forum posts.

**Sources:**
- [Lenis GitHub Issue #319 - Begins halfway down on navigation](https://github.com/darkroomengineering/lenis/issues/319)
- [Lenis Discussion #244 - Not starting at top on navigate](https://github.com/darkroomengineering/lenis/discussions/244)

---

### Pitfall 3: Supabase RLS Misconfiguration Exposing Booking and Admin Data

**What goes wrong:** Tables are created without RLS enabled, or RLS is enabled but policies are missing or incorrectly scoped. In January 2025, 170+ apps were found with exposed Supabase databases because developers forgot to enable RLS (CVE-2025-48757). 83% of exposed Supabase databases involve RLS misconfigurations.

**Why it happens:** Supabase creates tables with RLS DISABLED by default. Developers create tables in the dashboard, test queries in the SQL Editor (which runs as superuser and bypasses RLS), see correct results, and deploy. Real users then either see all data (no RLS) or no data (RLS enabled but no policies). The SQL Editor gives false confidence because it never shows you what your actual users will experience.

**Specific risk for this project:**
- **Bookings table:** Guest booking data (names, phone numbers, dates) must not be visible to other visitors. Without RLS, anyone with the Supabase anon key (which is in the client bundle) can query all bookings.
- **Vehicles table:** Likely needs public read access but admin-only write access. A missing `WITH CHECK` on INSERT/UPDATE policies lets any anonymous user add or modify vehicles.
- **Admin user data:** If using Supabase Auth, the admin's email and auth metadata are queryable through the API unless RLS is properly configured on auth-related tables.

**Consequences:**
- Customer PII (names, phone numbers, email, booking details) exposed to anyone
- Vehicles or bookings can be modified/deleted by anonymous API calls
- Legal liability under data protection laws

**Prevention:**
1. Enable RLS on EVERY table immediately after creation -- no exceptions.
2. Write explicit policies for each operation (SELECT, INSERT, UPDATE, DELETE) separately. Never use a blanket `ALL` policy.
3. Always include `WITH CHECK` on INSERT and UPDATE policies. Without it, users can insert rows with arbitrary `user_id` values.
4. Test RLS policies by querying from the client (not the SQL Editor). The SQL Editor bypasses RLS.
5. For the admin panel: use Supabase Auth to identify the admin user, then write RLS policies that check `auth.uid() = '[joey-uuid]'` for write operations.
6. For vehicle photos: use a PUBLIC bucket for serving images (anyone can view car photos) but restrict uploads to authenticated admin user via storage RLS policies.
7. Create a pre-deployment checklist that verifies RLS status on all tables.

**Detection:**
- Open browser DevTools, find the Supabase anon key in the JS bundle, and try querying tables directly with `fetch()`. If you get data you should not see, RLS is broken.
- In Supabase Dashboard, check "RLS Enabled" column on each table. Any table showing "disabled" is fully exposed.

**Phase mapping:** Must be in place BEFORE the first table with user data is created. Ideally, write RLS policies as part of the migration that creates each table.

**Confidence:** HIGH -- verified with official Supabase documentation and CVE reports.

**Sources:**
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Security Flaw: 170+ Apps Exposed](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Row-Level Recklessness: Testing Supabase Security](https://www.precursorsecurity.com/security-blog/row-level-recklessness-testing-supabase-security)
- [Supabase RLS Complete Guide 2026](https://designrevision.com/blog/supabase-row-level-security)

---

### Pitfall 4: Service Role Key Exposure in Client-Side Admin Panel

**What goes wrong:** The admin panel runs in the same SPA as the public site. To perform admin operations (bypass RLS for data management), developers embed the Supabase `service_role` key in the client bundle. This key bypasses ALL Row Level Security -- it is god-mode access to the entire database. Anyone who inspects the JS bundle gets full read/write/delete access to every table.

**Why it happens:** This is a single-admin app (only Joey). The temptation is to think "it's just me, I'll use the service_role key for convenience." But the SPA ships to every visitor's browser. Even if the admin routes are behind a login screen, the service_role key is in the JavaScript bundle that every visitor downloads.

**Consequences:**
- Complete database exposure: read, modify, delete all data
- Supabase storage exposure: upload, delete any files
- Auth manipulation: create, delete, modify user accounts
- No audit trail -- attacker operates as superuser

**Prevention:**
1. NEVER include the `service_role` key in client-side code. Period.
2. Use Supabase Auth to authenticate Joey as a regular user, then write RLS policies that grant admin privileges based on `auth.uid()` matching Joey's UUID, or based on a custom claim/role.
3. For operations that genuinely need service_role access (like user management), create Supabase Edge Functions or Vercel serverless functions that hold the service_role key server-side and validate the caller is the authenticated admin before executing.
4. Use environment variables: `VITE_SUPABASE_ANON_KEY` for the client, `SUPABASE_SERVICE_ROLE_KEY` only in server-side code (Edge Functions, Vercel API routes).
5. Add a `.env` validation step that fails the build if `service_role` appears in any `VITE_` prefixed variable.

**Detection:**
- Search the codebase for `service_role` -- it should appear in zero client-side files
- In production, view page source and search for the service_role key value
- Check Vercel environment variables: `service_role` should only be in server-side env vars, never in `NEXT_PUBLIC_` or `VITE_` prefixed ones

**Phase mapping:** Establish the pattern in the same phase that sets up Supabase Auth. The admin auth pattern must be decided before the admin panel is built.

**Confidence:** HIGH -- official Supabase documentation explicitly warns against this.

**Sources:**
- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Auth Admin Methods](https://supabase.com/docs/reference/javascript/admin-api)
- [Securing Supabase Service Role Key](https://chat2db.ai/resources/blog/secure-supabase-role-key)

---

### Pitfall 5: Vercel SPA Routing 404s on Direct URL Access and Page Refresh

**What goes wrong:** After deploying to Vercel, the homepage works fine. But if a user navigates to `/fleet/rolls-royce` and then refreshes the browser (or shares that URL), Vercel returns a 404 error. This is because Vercel tries to serve a static file at that path, and no such file exists -- all routing is handled client-side by React Router.

**Why it happens:** Vite builds a single `index.html` file. React Router handles all routing in the browser. But when the browser makes a direct HTTP request to `/fleet/rolls-royce`, Vercel's static file server looks for `fleet/rolls-royce/index.html` which does not exist.

**Specific codebase evidence:**
- No `vercel.json` currently exists in the project
- Vite builds to a single `index.html` with no server-side routing

**Consequences:**
- Every direct link to a non-root route returns 404
- Shared URLs are broken (someone texts a booking link, recipient gets 404)
- SEO crawlers that try to access routes directly get 404
- Browser refresh on any route except `/` shows 404

**Prevention:**
1. Create `vercel.json` in the project root with a rewrite rule BEFORE the first deployment with routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
2. Test this LOCALLY before deploying: run `vite build && vite preview` and try accessing routes directly.
3. Add this file in the same PR/commit that introduces React Router. Never deploy routing without the rewrite rule.

**Detection:**
- After deploying, open a non-root route directly in a new browser tab
- Try refreshing the browser on any non-root route
- If you see a Vercel 404 page, the rewrite is missing

**Phase mapping:** Same commit that introduces React Router. This is a one-line fix but causes total breakage if forgotten.

**Confidence:** HIGH -- extremely well-documented issue, verified by multiple Vercel community posts and official docs.

**Sources:**
- [Vercel 404 on React Router Routes](https://medium.com/@rohantgeorge05/how-to-fix-404-error-on-vercel-with-react-router-and-client-side-routing-bc940e500776)
- [Vercel Community - React Router 404](https://community.vercel.com/t/react-router-and-vite-app-404-error-for-routes-on-vercel-deployment/2920)
- [Vercel KB - 404 Errors](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)

---

## Moderate Pitfalls

Mistakes that cause delays, degraded UX, or technical debt.

---

### Pitfall 6: React 19 StrictMode Double-Mounting Breaks GSAP Animations

**What goes wrong:** In development mode (StrictMode), React 19 mounts components, unmounts them, and mounts them again. With raw `useEffect`, GSAP animations run twice: the first run sets elements to their "animated" state, then cleanup reverts them, then the second run animates again -- but starting positions are wrong because the first run already modified styles. Users see elements flash, jump, or appear in wrong positions during development.

**Why it happens:** StrictMode deliberately double-invokes effects to catch missing cleanup. The current codebase uses `gsap.set()` for initial states (opacity: 0, y: 60) and then `gsap.to()` for animation. When the effect runs, reverts, and runs again, the `gsap.set()` calls may not properly reset because the cleanup only kills triggers and timelines but does not revert CSS changes made by `gsap.set()`.

**Specific codebase evidence:**
- `main.tsx` line 7: StrictMode is enabled
- Every section component uses `gsap.set()` followed by `gsap.to()` in `useEffect` -- all are vulnerable
- Hero.tsx lines 32-36: Sets initial states with `gsap.set()` that will not be reverted on cleanup

**Prevention:**
1. Migrate to `useGSAP()` hook which internally uses `gsap.context()` -- context automatically reverts ALL property changes, not just kills animations.
2. If keeping `useEffect` temporarily: use `gsap.context()` manually and call `context.revert()` in the cleanup function.
3. Do NOT remove StrictMode as a "fix" -- it exists to catch real bugs.

**Detection:**
- Elements flash or appear in wrong positions on initial page load in development
- Animations work in production build but look broken in `npm run dev`
- Console shows no errors but visual behavior is wrong

**Phase mapping:** Should be addressed when migrating to `useGSAP()` (same phase as routing introduction).

**Confidence:** HIGH -- well-documented React 19 behavior, confirmed by GSAP team.

**Sources:**
- [React StrictMode Reference](https://react.dev/reference/react/StrictMode)
- [SplitText Renders Twice in StrictMode](https://gsap.com/community/forums/topic/38734-splittext-innerwrap-renders-twice-in-strictmode/)
- [GSAP React Best Practices](https://gsap.com/resources/React/)

---

### Pitfall 7: Config-to-Database Migration Breaks Existing Rendering

**What goes wrong:** The site currently renders from `config.ts` -- a static TypeScript file with typed interfaces. Migrating to database-driven content means replacing synchronous `import { heroConfig } from './config'` with asynchronous `const { data } = await supabase.from('vehicles').select('*')`. Components that assume config data is immediately available on render will break with loading states, null references, and layout shift.

**Why it happens:** Static imports are synchronous -- the data exists at build time. Database fetches are asynchronous -- the data arrives after the component mounts. Every component currently reads config as a direct import at the top of the file and uses it immediately in the render function (some components even use config for conditional returns BEFORE any hooks, e.g., `if (!heroConfig.brandLeft && !heroConfig.brandRight) return null` in Hero.tsx line 18).

**Specific codebase evidence:**
- `config.ts` exports 7 config objects used across 7 section components
- Hero.tsx line 18: early return based on config data -- will fail if data is `undefined` during loading
- Collections.tsx line 15: same pattern
- Exhibitions.tsx line 15: same pattern
- All sections use config data directly in JSX -- no loading/error states

**Consequences:**
- Components crash with "Cannot read properties of undefined" during data loading
- Layout shift: page renders without content, then jumps when data arrives
- ScrollTrigger positions calculated during loading state (empty DOM) are wrong
- GSAP animations target elements that don't exist yet (empty data = empty list)

**Prevention:**
1. Migrate incrementally: keep `config.ts` as fallback data while database content loads. Components render immediately with static data, then hydrate with fresh data.
2. Create a data layer with React Query or SWR that provides loading/error states. Do NOT fetch in every component individually.
3. Add skeleton screens for content-dependent sections to prevent layout shift.
4. Defer ScrollTrigger initialization until data has loaded and DOM is fully rendered. Use `ScrollTrigger.refresh()` after data hydration.
5. Move conditional returns (the `if (!config.x) return null` pattern) to AFTER hooks, using the data loading state to determine what to render.

**Detection:**
- Elements missing or flashing on first load
- ScrollTrigger animations starting from wrong positions
- Console errors about reading properties of undefined

**Phase mapping:** This is a gradual migration. Start with vehicle/fleet data (most dynamic) and leave static content (hero, about, footer) in config until later phases.

**Confidence:** HIGH -- observable from direct codebase analysis.

---

### Pitfall 8: Unoptimized Vehicle Photos Destroying Page Load Performance

**What goes wrong:** Admin uploads raw DSLR photos of luxury vehicles (4000x3000px, 5-15MB each). The fleet page loads 8-12 of these images. On a mobile connection, the page takes 30+ seconds to load. Supabase Storage serves original files by default. Users on mobile (majority of luxury rental traffic) bounce before seeing a single car.

**Why it happens:** Professional car photography produces large files. Without image optimization, the full-resolution file is served to every device regardless of viewport size. Supabase Storage does support image transformations (resize, format conversion, quality) but only on Pro plan and above, and the transformation parameters must be explicitly requested in the URL.

**Specific risk for this project:**
- Current images are served from `/images/` (static, local). When migrated to Supabase Storage, the default behavior is to serve the original uploaded file.
- The Exhibitions grid shows 4 images at `aspect-ratio: 4/3` -- these likely need to be at most 800px wide, not 4000px.
- The Collections section shows full-width images for each card -- large but still not 4000px.

**Consequences:**
- Page load times of 10-30+ seconds on mobile
- Supabase egress costs spike (5MB x 12 images x 1000 visitors/day = 60GB/day, exceeding free tier 2GB/month in 48 minutes)
- Google Core Web Vitals fail (LCP, CLS)
- Users leave before booking

**Prevention:**
1. Resize images on upload: use a Supabase Edge Function or client-side compression (before upload) to create multiple sizes (thumbnail: 400px, card: 800px, hero: 1600px).
2. If on Supabase Pro plan: use the image transformation API with `width`, `height`, and `quality` parameters in the URL to serve optimized versions.
3. Use `<img srcset>` or `<picture>` element to serve appropriate size per viewport.
4. Set `quality: 80` (Supabase default) -- luxury photos look fine at 80% quality at 1/3 the file size.
5. Implement lazy loading (`loading="lazy"`) for images below the fold.
6. Consider serving images through a CDN (Vercel Edge or Cloudflare) with caching headers to reduce Supabase egress.

**Detection:**
- Check image sizes in Network tab -- anything over 500KB for a card image is too large
- Monitor Supabase dashboard for storage egress usage
- Run Lighthouse on fleet page -- LCP should be under 2.5s

**Phase mapping:** Must be solved when Supabase Storage is introduced. Build the upload pipeline with resize/compression from day one.

**Confidence:** HIGH -- confirmed by Supabase Storage documentation and pricing.

**Sources:**
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Supabase Storage Scaling](https://supabase.com/docs/guides/storage/production/scaling)
- [Supabase Bandwidth & Egress](https://supabase.com/docs/guides/storage/serving/bandwidth)

---

### Pitfall 9: Custom Cursor Hides Native Cursor, Breaking Accessibility

**What goes wrong:** The site uses `cursor: none` globally and renders a custom animated cursor div. This breaks accessibility for screen reader users, keyboard navigators, users with motor disabilities who use alternative pointing devices, and Windows users who have customized their system cursor size/color for visibility.

**Why it happens:** The custom cursor is a luxury design choice that provides a smooth, branded feel. But `cursor: none` is applied globally in both `App.css` (lines 17, 22) and `index.css` (line 73), meaning there is no escape for users who cannot use the custom cursor.

**Specific codebase evidence:**
- `useCustomCursor.ts` line 33: Does check for touch devices and skips on `pointer: coarse`, which is good
- `App.css` lines 17, 22: `cursor: none` applied broadly
- `index.css` line 73: Additional `cursor: none`
- No `prefers-reduced-motion` media query check
- No respect for Windows system cursor settings
- Custom cursor div has no `aria-hidden="true"`

**Consequences:**
- Screen reader users cannot see focus indicators (cursor is hidden, and custom cursor does not indicate focus)
- Users with motor disabilities may not be able to use the site at all
- Windows users with enlarged cursors for accessibility lose their enlarged cursor
- Potential legal liability under ADA / WCAG 2.1 guidelines
- Bad SEO signal from Google's accessibility scoring

**Prevention:**
1. Apply `cursor: none` ONLY inside a `@media (any-hover: hover) and (pointer: fine)` media query -- this limits it to devices with a precise pointing device (mouse, not touch, not assistive).
2. Add `prefers-reduced-motion` check: disable custom cursor when user prefers reduced motion.
3. Add `aria-hidden="true"` to the custom cursor div so screen readers ignore it.
4. Provide a visible fallback focus indicator for keyboard navigation (do not rely on cursor for focus indication).
5. Consider adding an accessibility toggle that disables the custom cursor.

**Detection:**
- Tab through the site with keyboard only -- can you tell where focus is?
- Enable Windows accessibility cursor settings -- does the site respect them?
- Run aXe or Lighthouse accessibility audit

**Phase mapping:** Can be fixed in any phase, but ideally before public launch. Low effort, high impact.

**Confidence:** HIGH -- based on WCAG guidelines and direct codebase inspection.

**Sources:**
- [Custom Cursor Accessibility - David Bushell](https://dbushell.com/2025/10/27/custom-cursor-accessibility/)
- [CSS Accessibility Guide](https://codelucky.com/css-accessibility-screen-reader-styling/)

---

### Pitfall 10: dangerouslySetInnerHTML with Database Content Creates XSS Vulnerability

**What goes wrong:** The current codebase uses `dangerouslySetInnerHTML` in Visit.tsx and Footer.tsx to render HTML strings from config. This is safe now because the config is a static TypeScript file controlled by the developer. When content moves to a database (where admin inputs data), any HTML in the database fields will be rendered as executable HTML. If the admin accidentally pastes content with embedded scripts, or if the database is compromised, arbitrary JavaScript executes in every visitor's browser.

**Specific codebase evidence:**
- `Visit.tsx` line 65: `dangerouslySetInnerHTML={{ __html: visitConfig.headline }}` -- headline contains `<br />` tags
- `Visit.tsx` line 85: `dangerouslySetInnerHTML={{ __html: card.content }}` -- content contains `<br />` tags
- `Footer.tsx` line 96: `dangerouslySetInnerHTML={{ __html: item }}` -- contact items rendered as HTML

**Consequences:**
- XSS vulnerability if database content contains `<script>` tags or event handlers
- Cookie theft, session hijacking, redirects to phishing sites
- Even without malicious intent: if admin types `<b>test` without closing tag, page layout breaks

**Prevention:**
1. Replace `dangerouslySetInnerHTML` with proper React components. Instead of `<br />` in strings, split strings and render line breaks with CSS (`white-space: pre-line`) or by splitting on newlines and mapping to elements.
2. If raw HTML is absolutely needed: sanitize with DOMPurify before rendering. `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}`.
3. Use a limited markdown parser (like `marked` with sanitization) instead of raw HTML if rich text is needed.
4. Validate and sanitize content on the Supabase side: use a database trigger or Edge Function to strip dangerous HTML tags on insert/update.

**Detection:**
- Search codebase for `dangerouslySetInnerHTML` and verify every instance has sanitized input
- Try entering `<img src=x onerror=alert(1)>` in admin content fields and see if it executes

**Phase mapping:** Must be addressed when migrating content from config to database. The refactor should happen in the same phase.

**Confidence:** HIGH -- standard web security concern, directly observable in codebase.

---

### Pitfall 11: Supabase Free Tier Auto-Pause Kills Production Site

**What goes wrong:** Supabase free tier projects automatically pause after 7 days of inactivity. For a low-traffic luxury rental site (not getting daily requests), the database pauses. The next visitor gets a connection timeout. The site appears completely broken -- no vehicles load, no booking form works.

**Why it happens:** Supabase free tier is designed for development, not production. The auto-pause feature saves resources but has no warning mechanism visible to end users.

**Consequences:**
- Site appears broken to potential customers -- worst possible impression for a luxury brand
- Lost bookings during downtime
- Manual intervention required to unpause (visit Supabase dashboard)
- First request after unpause is slow (cold start)

**Prevention:**
1. Upgrade to Supabase Pro ($25/month) before production launch. Pro tier does not auto-pause.
2. If staying on free tier during development: set up a cron job (Vercel Cron, GitHub Actions, or a simple health check) that pings the Supabase API at least once every 5 days to prevent pausing.
3. Implement graceful error handling in the frontend: if Supabase is unreachable, show a branded "we'll be right back" message rather than a broken page.

**Detection:**
- Check Supabase dashboard for project status (active vs paused)
- Set up uptime monitoring (e.g., UptimeRobot) that pings a Supabase-dependent API endpoint

**Phase mapping:** Must be addressed before production deployment.

**Confidence:** HIGH -- documented Supabase free tier limitation.

**Sources:**
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Pricing Complete Breakdown 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)

---

## Minor Pitfalls

Mistakes that cause annoyance, confusion, or minor rework.

---

### Pitfall 12: Lenis Package Import Path Change (`@studio-freight/lenis` is Deprecated)

**What goes wrong:** The current codebase imports Lenis from `@studio-freight/lenis` (useLenis.ts line 2). This package was renamed to `lenis` (npm package) under the `@darkroom.engineering` organization. The old package may stop receiving updates or break with newer React versions.

**Prevention:**
1. Update the import to `import Lenis from 'lenis'` and install the new package.
2. Check for API changes in the latest version (the core API is largely the same but the React integration has improved).

**Phase mapping:** Quick fix, can be done in any phase. Ideally during the routing/animation refactor phase.

**Confidence:** MEDIUM -- based on Lenis GitHub repository showing the organization change.

**Sources:**
- [Lenis GitHub (darkroomengineering)](https://github.com/darkroomengineering/lenis)

---

### Pitfall 13: Booking Flow UX -- Too Many Steps Kills Luxury Conversion

**What goes wrong:** Developers build booking flows with too many form fields and steps (full registration, insurance details, payment upfront). Luxury rental customers expect a concierge-like experience -- minimal friction, personal touch. A 5-step form with 15 fields feels like renting from Enterprise, not a luxury service.

**Why it matters for this project:**
- The brand positioning is "book in under 60 seconds" (visitConfig.description)
- No payment integration (guest booking with deposit handled offline)
- Single admin (Joey) handles all approvals personally

**Prevention:**
1. Minimum viable booking form: Name, Phone, Vehicle, Dates. That is it. Joey contacts them personally for everything else.
2. No account creation required (guest booking is already the plan -- keep it that way)
3. Sticky CTA on vehicle pages -- do not make users hunt for the booking button
4. Show vehicle availability prominently to prevent frustration
5. Mobile-first form design -- majority of luxury rental traffic is mobile

**Detection:**
- Count form fields -- more than 5 for initial booking is too many
- Time yourself completing the booking flow -- should be under 60 seconds as promised
- Watch for drop-off: if analytics show users reaching the booking form but not submitting, the form has too much friction

**Phase mapping:** Booking flow design phase. Get the minimal version right first, add fields later only if Joey needs them.

**Confidence:** HIGH -- based on car rental UX research and the project's own brand promise.

**Sources:**
- [Booking UX Best Practices 2025](https://ralabs.org/blog/booking-ux-best-practices/)
- [Car Rental Booking Conversion Strategies](https://www.zigpoll.com/content/what-innovative-strategies-can-we-implement-to-boost-our-car-rental-booking-conversion-rates-on-both-our-website-and-mobile-app)

---

### Pitfall 14: ScrollTrigger.refresh() Timing After Dynamic Content Load

**What goes wrong:** When vehicle data loads from Supabase and renders new DOM elements (images, cards), the page height changes. But ScrollTrigger calculated all its positions during initial render (when the page was shorter/empty). Now all trigger start/end positions are wrong -- animations fire at wrong scroll positions, pinned sections overlap, and parallax offsets are miscalculated.

**Why it happens:** ScrollTrigger measures element positions once when triggers are created. It does not automatically re-measure when the DOM changes. The Collections section with pinned stacking cards is especially sensitive -- pin spacing calculations depend on exact element heights.

**Prevention:**
1. Call `ScrollTrigger.refresh()` after every data-driven DOM update completes.
2. Use `ScrollTrigger.refresh()` inside a `requestAnimationFrame` callback to ensure the browser has painted the new layout before measuring.
3. For images: use explicit `width` and `height` attributes (or CSS `aspect-ratio`) so the layout is stable even before images load. This prevents layout shift from causing refresh timing issues.
4. Consider `ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" })` but note this does NOT cover dynamic data loading -- manual refresh is still needed.

**Phase mapping:** Every phase that introduces database-driven content must include ScrollTrigger refresh logic.

**Confidence:** HIGH -- well-documented GSAP behavior, critical for this specific codebase.

---

### Pitfall 15: Missing Error Boundaries Cause Full-Page Crashes

**What goes wrong:** A single failed Supabase query, a missing image, or a null pointer in one section component crashes the entire React tree. The user sees a blank white page with no indication of what happened.

**Specific codebase evidence:**
- No error boundaries exist anywhere in the codebase
- When Supabase is introduced, network errors become possible in every data-fetching component
- A single failed image URL from Supabase Storage can trigger an error in rendering

**Prevention:**
1. Add error boundaries around major sections so a failure in one section does not crash the entire page.
2. Add a top-level error boundary with a branded fallback UI ("Something went wrong, please refresh").
3. For Supabase queries: always handle errors in the data fetching layer, never let rejections bubble to rendering.
4. For images: use `onError` handlers to show placeholder images when Supabase Storage images fail to load.

**Phase mapping:** Add error boundaries in the first phase that introduces external data fetching.

**Confidence:** HIGH -- no error boundaries observed in codebase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| React Router introduction | ScrollTrigger memory leaks (Pitfall 1), Lenis scroll position corruption (Pitfall 2), Vercel 404s (Pitfall 5) | Migrate to `useGSAP()`, add Lenis route-change reset, create `vercel.json` -- all in same phase |
| Supabase setup | RLS misconfiguration (Pitfall 3), service_role key exposure (Pitfall 4), free tier auto-pause (Pitfall 11) | Enable RLS on every table, never use service_role in client, plan for Pro tier |
| Data migration (config to DB) | Broken rendering (Pitfall 7), XSS via dangerouslySetInnerHTML (Pitfall 10), ScrollTrigger position errors (Pitfall 14) | Add loading states, sanitize HTML, refresh ScrollTrigger after data load |
| Image upload system | Unoptimized photos (Pitfall 8), storage egress costs | Resize on upload, serve optimized versions, use CDN caching |
| Admin panel | Service role key in client (Pitfall 4), RLS bypass attempts | Auth-based admin identification, server-side operations only |
| Booking flow | Over-engineered form (Pitfall 13), missing error handling (Pitfall 15) | Minimal fields, error boundaries, graceful degradation |
| Production deployment | Auto-pause (Pitfall 11), 404s (Pitfall 5), image performance (Pitfall 8) | Upgrade to Pro, verify rewrites, run Lighthouse |

---

## Sources

### Official Documentation (HIGH confidence)
- [GSAP React Integration Guide](https://gsap.com/resources/React/)
- [@gsap/react npm Package](https://www.npmjs.com/package/@gsap/react)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Pricing](https://supabase.com/pricing)
- [Vercel KB - 404 Errors](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)
- [React StrictMode](https://react.dev/reference/react/StrictMode)

### Community & Analysis (MEDIUM confidence)
- [GSAP Forum - ScrollTrigger Breaks React Router](https://gsap.com/community/forums/topic/28327-scrolltrigger-breaks-react-router/)
- [GSAP Forum - ScrollTrigger Route Change](https://gsap.com/community/forums/topic/37475-gsap-scrolltrigger-doesnt-run-on-route-change-react-router-v6-route-transition-with-framer-motion/)
- [Lenis GitHub Issue #319](https://github.com/darkroomengineering/lenis/issues/319)
- [Supabase Security Flaw CVE-2025-48757](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Custom Cursor Accessibility](https://dbushell.com/2025/10/27/custom-cursor-accessibility/)
- [Booking UX Best Practices 2025](https://ralabs.org/blog/booking-ux-best-practices/)
- [Supabase Pricing Breakdown 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
