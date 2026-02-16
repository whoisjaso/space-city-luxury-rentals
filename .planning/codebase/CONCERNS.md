# Codebase Concerns

**Analysis Date:** 2026-02-15

## Tech Debt

**Massive Unused shadcn/ui Component Library:**
- Issue: 53 shadcn/ui component files exist in `app/src/components/ui/` but ZERO are imported by any section or application code. Only internal cross-references exist (e.g., `sidebar.tsx` imports `button.tsx`). The entire library is dead weight.
- Files: All 53 files in `app/src/components/ui/`
- Impact: Increases bundle size (~350KB JS bundle includes tree-shaken but still partially bundled Radix primitives). Clutters the codebase. 30+ Radix UI packages in `app/package.json` are unused at the application level.
- Fix approach: Remove all files from `app/src/components/ui/`. Remove corresponding `@radix-ui/*`, `cmdk`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-hook-form`, `@hookform/resolvers`, `react-resizable-panels`, `recharts`, `sonner`, `vaul`, `zod`, `next-themes`, `class-variance-authority`, `date-fns` dependencies from `app/package.json`. Keep only `clsx`, `tailwind-merge`, `lucide-react`, `gsap`, `@studio-freight/lenis`.

**Deprecated Lenis Package:**
- Issue: Using `@studio-freight/lenis` (v1.0.42) which is officially deprecated. The npm registry marks it with: "The '@studio-freight/lenis' package has been renamed to 'lenis'."
- Files: `app/package.json` (line 40), `app/src/hooks/useLenis.ts` (line 2)
- Impact: Will stop receiving updates. May be removed from npm registry eventually.
- Fix approach: Replace `@studio-freight/lenis` with `lenis` package. Update import in `app/src/hooks/useLenis.ts` from `import Lenis from '@studio-freight/lenis'` to `import Lenis from 'lenis'`.

**Unused Playfair Display Font Import:**
- Issue: `Playfair Display` Google Font is imported in CSS but never referenced in any font-family declaration. All typography uses `Inter`.
- Files: `app/src/index.css` (line 2)
- Impact: Unnecessary network request on page load (~50-100KB of font files downloaded for nothing). Slows first contentful paint.
- Fix approach: Remove line 2 from `app/src/index.css`.

**Redundant `gsap.registerPlugin(ScrollTrigger)` Calls:**
- Issue: `gsap.registerPlugin(ScrollTrigger)` is called 9 times across 9 different files. GSAP only needs this once at the application entry point.
- Files: `app/src/App.tsx`, `app/src/hooks/useLenis.ts`, `app/src/hooks/useScrollTrigger.ts`, `app/src/sections/Hero.tsx`, `app/src/sections/About.tsx`, `app/src/sections/Exhibitions.tsx`, `app/src/sections/Collections.tsx`, `app/src/sections/Testimonials.tsx`, `app/src/sections/Visit.tsx`
- Impact: Code clutter. No runtime cost (GSAP deduplicates), but signals poor module organization.
- Fix approach: Keep only the call in `app/src/App.tsx` (the entry point). Remove from all other files.

**Unused Hooks:**
- Issue: `app/src/hooks/useScrollTrigger.ts` exports `useScrollTrigger` and `useParallax` but neither is imported anywhere in the codebase. `app/src/hooks/use-mobile.ts` exports `useIsMobile` which is only used by the unused `app/src/components/ui/sidebar.tsx`.
- Files: `app/src/hooks/useScrollTrigger.ts`, `app/src/hooks/use-mobile.ts`
- Impact: Dead code. Confuses developers about which patterns to use.
- Fix approach: Delete `app/src/hooks/useScrollTrigger.ts`. Delete `app/src/hooks/use-mobile.ts` (only after removing `app/src/components/ui/`).

**Committed `dist/` Build Artifacts:**
- Issue: The `app/dist/` directory containing built artifacts (JS bundle, CSS bundle, images) is tracked in the repository. No `.gitignore` file exists in the project root.
- Files: `app/dist/` directory (6.8MB), all files within
- Impact: Bloats the repository. Creates merge conflicts on every build. Images are duplicated between `app/public/images/` and `app/dist/images/`.
- Fix approach: Add a `.gitignore` at the project root with `app/dist/` and `node_modules/`. Remove `app/dist/` from git tracking with `git rm -r --cached app/dist/`.

**Unused Image Assets:**
- Issue: Several images exist in `app/public/images/` but are never referenced in `app/src/config.ts`: `fleet-corvette.jpg` (127KB), `fleet-rangerover.jpg` (160KB), `testimonial-2.jpg` (65KB), `testimonial-3.jpg` (65KB).
- Files: `app/public/images/fleet-corvette.jpg`, `app/public/images/fleet-rangerover.jpg`, `app/public/images/testimonial-2.jpg`, `app/public/images/testimonial-3.jpg`
- Impact: ~417KB of unnecessary assets served and stored.
- Fix approach: Either remove the files or add them to the config (e.g., add more vehicles to `exhibitionsConfig.exhibitions` or more testimonials).

## Known Bugs

**Broken Navigation Links -- IDs Do Not Match:**
- Symptoms: Clicking "Fleet" or "Experiences" in the hero nav or "Our Fleet" / "Experience Packages" in the footer does nothing (no scroll to section). The page does not navigate.
- Files: `app/src/config.ts` (lines 142-143, 293-294), `app/src/sections/Exhibitions.tsx` (line 80), `app/src/sections/Collections.tsx` (line 99)
- Trigger: Click any "Fleet" or "Experiences" link in the navigation or footer.
- Workaround: None. The links are dead.
- Detail: Config defines `href: "#fleet"` and `href: "#experiences"` but the actual section IDs are `id="exhibitions"` and `id="collections"`. Either change the section IDs to match the nav links, or update the nav link hrefs to `#exhibitions` and `#collections`. The former is recommended since "fleet" and "experiences" match the business domain better.

**Missing "Phone" Icon in Visit Section:**
- Symptoms: The fourth info card ("Contact") in the Visit section renders without an icon.
- Files: `app/src/sections/Visit.tsx` (lines 4, 9-14), `app/src/config.ts` (line 276)
- Trigger: View the Visit/Contact section -- the "Contact" card has no icon while the other three cards do.
- Workaround: None.
- Detail: The config specifies `icon: "Phone"` but the `iconMap` in `Visit.tsx` only maps `MapPin`, `Clock`, `Calendar`, and `Ticket`. `Phone` is not imported from `lucide-react` and not added to `iconMap`. Fix: Add `import { Phone } from 'lucide-react'` and add `Phone` to the `iconMap` object.

**React Rules of Hooks Violation -- Conditional Early Return Before Hooks:**
- Symptoms: Every section component calls `return null` before `useEffect` and `useRef` calls. This violates the Rules of Hooks (hooks must not be called conditionally). In practice, since the config values are static constants, the condition never changes at runtime, so this does not cause crashes. But it will trigger React lint warnings and could break if config becomes dynamic.
- Files: `app/src/sections/Hero.tsx` (line 18), `app/src/sections/About.tsx` (line 15), `app/src/sections/Exhibitions.tsx` (line 15), `app/src/sections/Collections.tsx` (line 15), `app/src/sections/Testimonials.tsx` (line 14), `app/src/sections/Visit.tsx` (line 21)
- Trigger: ESLint with react-hooks plugin will flag this. Currently the config is static so no runtime error occurs.
- Workaround: Config is compile-time constant so hooks order never actually changes.
- Detail: The `return null` guard appears after `useRef` declarations but before `useEffect`. Since `useRef` calls are above the guard in most files, and `useEffect` is below, the hook call count changes if the guard triggers. Move all hooks above the early return, or move the guard into the JSX return.

**Lenis Cleanup Creates New Anonymous Function:**
- Symptoms: The `gsap.ticker.remove()` call in `useLenis.ts` cleanup creates a new anonymous function instead of removing the one that was added. The original callback is never properly removed from GSAP's ticker.
- Files: `app/src/hooks/useLenis.ts` (lines 33-36)
- Trigger: Component unmount or hot module replacement during development.
- Workaround: Lenis `destroy()` is called which handles most cleanup, but the ticker callback leaks.
- Detail: The cleanup function does `gsap.ticker.remove((time) => { lenis.raf(time * 1000); })` which creates a new arrow function. This is a different reference than the one passed to `gsap.ticker.add()` on line 26. Fix: Store the callback in a variable and pass the same reference to both `add` and `remove`.

## Security Considerations

**`dangerouslySetInnerHTML` Used with Config-Driven Content:**
- Risk: Three locations render raw HTML from config strings. While the config is currently hardcoded (not user-supplied), any future change to load config from an API or CMS would create XSS vulnerabilities.
- Files: `app/src/sections/Visit.tsx` (lines 65, 85), `app/src/sections/Footer.tsx` (line 96)
- Current mitigation: Config values are hardcoded in `app/src/config.ts`, not user-controllable.
- Recommendations: Document clearly that these config fields accept HTML. If config ever becomes dynamic/user-supplied, sanitize with DOMPurify before rendering. Consider replacing `<br />` usage with array-based line breaks to avoid HTML injection surface.

**No `.gitignore` File:**
- Risk: Sensitive files (`.env`, credentials, API keys) could be accidentally committed. Currently no env vars or secrets exist, but this is a landmine for future development.
- Files: Project root (missing `.gitignore`)
- Current mitigation: No secrets currently exist in the project.
- Recommendations: Create a `.gitignore` immediately with at minimum: `node_modules/`, `app/dist/`, `.env`, `.env.*`.

**Missing Meta Description in `index.html`:**
- Risk: The `siteConfig.description` is defined in config but never injected into the HTML `<head>`. No `<meta name="description">` tag exists.
- Files: `app/index.html` (no description meta), `app/src/App.tsx` (only sets `document.title`, not description), `app/src/config.ts` (line 126-127 defines `description`)
- Current mitigation: None.
- Recommendations: Add a `useEffect` in `App.tsx` that creates/updates `<meta name="description">` from `siteConfig.description`.

## Performance Bottlenecks

**Oversized Hero Image (3.2MB PNG):**
- Problem: The hero image `hero-rollsroyce.png` is 3.2MB -- a single image that is ~50% of the entire site's weight. It loads on initial page view with no lazy loading.
- Files: `app/public/images/hero-rollsroyce.png` (3,289,039 bytes), referenced in `app/src/config.ts` (line 137)
- Cause: PNG format is used (required for transparency per the template spec), but the file is unoptimized at 3.2MB.
- Improvement path: Convert to WebP with alpha channel (typically 60-80% smaller). Use `<picture>` element with WebP source and PNG fallback. Consider generating multiple sizes for responsive serving.

**Oversized Logo (1.2MB PNG):**
- Problem: `logo.png` is 1.2MB but is never actually referenced in the codebase. If it were to be used, it would need significant optimization.
- Files: `app/public/images/logo.png` (1,256,181 bytes)
- Cause: Unoptimized PNG.
- Improvement path: Remove if unused. If needed, compress to <50KB.

**No Image Lazy Loading:**
- Problem: All 15+ images load eagerly on page load regardless of viewport position. Gallery images, fleet images, experience images, and testimonial images are all below the fold.
- Files: `app/src/sections/About.tsx` (gallery images), `app/src/sections/Exhibitions.tsx` (fleet images), `app/src/sections/Collections.tsx` (experience images), `app/src/sections/Testimonials.tsx` (author image)
- Cause: No `loading="lazy"` attribute on any `<img>` tag. No Intersection Observer-based loading.
- Improvement path: Add `loading="lazy"` to all images except the hero image (which is above the fold). Consider using `decoding="async"` as well.

**Excessive `will-change: transform` Usage:**
- Problem: `will-change-transform` class is applied to many elements throughout the page. This promotes each element to its own compositor layer, consuming GPU memory.
- Files: `app/src/sections/Hero.tsx` (lines 82, 97, 115, 120, 138), `app/src/sections/About.tsx` (lines 130, 132, 140, 142, 150, 152), `app/src/sections/Exhibitions.tsx` (line 99), `app/src/sections/Collections.tsx` (line 121)
- Cause: Preemptive GPU layer promotion for GSAP animations.
- Improvement path: Only apply `will-change` during active animation, not permanently. GSAP's `force3D` property handles GPU acceleration automatically. Remove static `will-change-transform` classes and let GSAP manage layer promotion.

**CSS Bundle Size (87KB) Includes Unused Styles:**
- Problem: The CSS bundle is 87KB, much of which is from the unused shadcn/ui Tailwind configuration (sidebar colors, dark mode variants, etc.) and unused utility classes.
- Files: `app/dist/assets/index-DmqwH71O.css` (86,706 bytes), `app/tailwind.config.js`
- Cause: Tailwind config includes extensive shadcn/ui theme tokens (sidebar colors, dark mode) that generate CSS but are unused.
- Improvement path: Remove shadcn/ui-specific config from `app/tailwind.config.js`. Remove `darkMode: ["class"]` if not used. Remove sidebar color definitions.

**External Google Fonts Loaded with Render-Blocking `@import`:**
- Problem: Two Google Fonts are loaded via CSS `@import` which is render-blocking. Only one font (Inter) is actually used.
- Files: `app/src/index.css` (lines 1-2)
- Cause: CSS `@import` blocks rendering until fonts are downloaded.
- Improvement path: Remove unused Playfair Display import. Move Inter font loading to `<link rel="preconnect">` and `<link rel="stylesheet">` in `app/index.html` for better performance. Consider self-hosting the font.

## Fragile Areas

**GSAP ScrollTrigger Animation System:**
- Files: `app/src/sections/Hero.tsx`, `app/src/sections/About.tsx`, `app/src/sections/Exhibitions.tsx`, `app/src/sections/Collections.tsx`, `app/src/sections/Testimonials.tsx`, `app/src/sections/Visit.tsx`, `app/src/App.tsx`
- Why fragile: Every section manually creates ScrollTrigger instances, manually sets initial GSAP states with `gsap.set()`, and manually cleans up in useEffect returns. There is no shared animation utility -- each section reimplements the same reveal-on-scroll pattern independently. A change to scroll behavior (e.g., adjusting Lenis settings, changing section order) can break animations in unpredictable ways because timings are hardcoded.
- Safe modification: When modifying animations, always verify cleanup runs correctly. Test by scrolling rapidly up/down. Test with Lenis disabled. Test in both Chrome and Safari.
- Test coverage: Zero. No tests exist anywhere in the codebase.

**Collections Stacking Card Effect:**
- Files: `app/src/sections/Collections.tsx` (lines 40-89)
- Why fragile: The stacking card scroll effect uses `pin: true` with `pinSpacing: false` and cross-references between adjacent cards (`endTrigger: cards[i + 1]`). This is highly sensitive to: section height changes, content length changes, number of collection items, viewport size. Adding/removing a collection card requires the pinning logic to still correctly reference adjacent cards.
- Safe modification: Test on multiple viewport sizes after any change. Verify first and last card behavior separately. Ensure `cardsRef.current` array stays in sync with rendered cards.
- Test coverage: None.

**Background Color Transition System:**
- Files: `app/src/App.tsx` (lines 44-86)
- Why fragile: Background colors are defined by hardcoded CSS selectors (`#hero-section`, `#about`, `#exhibitions`, `#collections`, `#testimonials-section`, `#contact`, `#footer-section`). Some selectors target IDs set on the section component itself (e.g., `#about`), while others target wrapper `<div>` elements in App.tsx (e.g., `#hero-section`, `#testimonials-section`, `#footer-section`). This inconsistency means moving, renaming, or conditionally rendering sections will silently break background transitions.
- Safe modification: Always verify that the selector in the `sections` array matches the actual DOM element ID. After any section reorder or conditional rendering change, test all background color transitions.
- Test coverage: None.

## Scaling Limits

**Single-Page Monolith Architecture:**
- Current capacity: Works fine for 7 sections and ~1400 lines of custom code.
- Limit: All content is in a single config file. All sections render on one page. No routing. Adding more pages (e.g., individual vehicle detail pages, booking flow) requires a fundamental architecture change.
- Scaling path: Add React Router for multi-page support. Extract config into separate files per section. Consider a headless CMS for content management.

**Single Testimonial Only:**
- Current capacity: Exactly one testimonial is supported. The `TestimonialsConfig` interface defines a single quote, not an array.
- Limit: Cannot display multiple testimonials or a testimonial carousel.
- Scaling path: Change `TestimonialsConfig` to use an array of testimonials. Add a carousel or rotation mechanism.

## Dependencies at Risk

**`@studio-freight/lenis` (Deprecated):**
- Risk: Package is deprecated and renamed to `lenis`. Will stop receiving security patches.
- Impact: Smooth scrolling will continue to work but may develop incompatibilities with future browser updates.
- Migration plan: `npm uninstall @studio-freight/lenis && npm install lenis`. Update import path in `app/src/hooks/useLenis.ts`.

**`gsap` (License):**
- Risk: GSAP has a custom license. Free for non-commercial use but requires a paid license for commercial products. A luxury car rental business website is commercial.
- Impact: Potential licensing violation if no GSAP Business license is purchased.
- Migration plan: Purchase a GSAP Business license, OR migrate scroll animations to CSS-only solutions (Scroll-Driven Animations API, Intersection Observer + CSS transitions).

**Massive Unused Radix UI Dependency Tree:**
- Risk: 20+ `@radix-ui/*` packages are installed but unused by the application. These add maintenance burden, security surface area, and `npm audit` noise.
- Impact: Any vulnerability in Radix dependencies triggers alerts for code that is not even used.
- Migration plan: Remove all `@radix-ui/*` packages along with the unused `app/src/components/ui/` directory.

## Missing Critical Features

**No Contact Form or Booking System:**
- Problem: The site has a "Check Availability" CTA button and "Reserve Now" section, but these buttons do nothing -- no `onClick` handler, no form, no external link. The email address is the only actual contact method.
- Blocks: Users cannot book vehicles, check availability, or submit inquiries through the website.

**No SEO Meta Tags:**
- Problem: No `<meta name="description">`, no Open Graph tags, no Twitter Card tags, no structured data (JSON-LD). The `siteConfig.description` field exists but is never injected.
- Blocks: Poor search engine indexing. No rich previews on social media sharing.

**No Analytics or Tracking:**
- Problem: No Google Analytics, no Plausible, no event tracking of any kind. No way to know if anyone visits the site or clicks CTAs.
- Blocks: Cannot measure marketing effectiveness or user behavior.

## Test Coverage Gaps

**No Tests Exist:**
- What's not tested: Everything. Zero test files exist in the entire codebase. No `*.test.*` or `*.spec.*` files. No test framework is configured (no vitest, jest, or testing-library in dependencies).
- Files: The entire `app/src/` directory
- Risk: Any code change could break functionality undetected. The GSAP animations, config-driven rendering, null-check guards, and icon mapping are all untested. The broken navigation links and missing Phone icon bugs demonstrate that issues persist because there is no verification.
- Priority: High. At minimum, add tests for: config-driven rendering (sections render/null based on config), navigation link-to-section-ID consistency, icon map completeness, and component snapshot tests.

---

*Concerns audit: 2026-02-15*
