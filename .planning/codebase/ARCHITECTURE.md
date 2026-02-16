# Architecture

**Analysis Date:** 2026-02-15

## Pattern Overview

**Overall:** Single-Page Application (SPA) with section-based composition

**Key Characteristics:**
- Static marketing/landing page for a luxury vehicle rental business ("Space City Rentals")
- No routing, no backend, no API calls -- purely client-side rendered sections
- Configuration-driven content: all text, images, and data live in a single config file (`app/src/config.ts`)
- Heavy use of GSAP ScrollTrigger for scroll-driven animations and parallax effects
- Lenis smooth scrolling integrated via custom hook
- shadcn/ui component library installed but largely unused by the main page (UI primitives are available for future use)

## Layers

**Configuration Layer:**
- Purpose: Centralized content and site metadata. All section text, images, links, and data are defined as typed exports.
- Location: `app/src/config.ts`
- Contains: TypeScript interfaces for each section config + exported const config objects (`siteConfig`, `heroConfig`, `aboutConfig`, `exhibitionsConfig`, `collectionsConfig`, `testimonialsConfig`, `visitConfig`, `footerConfig`)
- Depends on: Nothing
- Used by: Every section component imports its respective config

**Section Components Layer:**
- Purpose: Full-page vertical sections that compose the landing page
- Location: `app/src/sections/`
- Contains: 7 section components -- `Hero.tsx`, `About.tsx`, `Exhibitions.tsx`, `Collections.tsx`, `Testimonials.tsx`, `Visit.tsx`, `Footer.tsx`
- Depends on: `app/src/config.ts` for content, `gsap` + `gsap/ScrollTrigger` for animations, `lucide-react` for icons
- Used by: `app/src/App.tsx`

**Hooks Layer:**
- Purpose: Reusable behavior hooks for smooth scrolling, custom cursor, scroll triggers, and responsive detection
- Location: `app/src/hooks/`
- Contains: `useLenis.ts` (smooth scroll), `useCustomCursor.ts` (custom cursor), `useScrollTrigger.ts` (scroll trigger + parallax helpers), `use-mobile.ts` (mobile breakpoint detection)
- Depends on: `@studio-freight/lenis`, `gsap`, browser APIs
- Used by: `app/src/App.tsx` (useLenis, useCustomCursor), section components could use useScrollTrigger/useParallax (currently inline their own GSAP logic)

**UI Components Layer:**
- Purpose: Reusable UI primitives from shadcn/ui (new-york style)
- Location: `app/src/components/ui/`
- Contains: 50+ shadcn/ui components (button, card, dialog, tabs, form, sidebar, etc.)
- Depends on: `@radix-ui/*` primitives, `class-variance-authority`, `app/src/lib/utils.ts`
- Used by: Currently not used by the main landing page sections. Available as a component library for future pages/features.

**Utilities Layer:**
- Purpose: Shared helper functions
- Location: `app/src/lib/utils.ts`
- Contains: `cn()` function (Tailwind class merging via `clsx` + `tailwind-merge`)
- Depends on: `clsx`, `tailwind-merge`
- Used by: All shadcn/ui components

**Styles Layer:**
- Purpose: Global styles, CSS custom properties, typography classes, animation definitions
- Location: `app/src/index.css` (global base + brand tokens + component classes + custom cursor + marquee animation), `app/src/App.css` (app-specific overrides, accessibility, reduced motion)
- Contains: Tailwind base/components/utilities layers, CSS custom properties for shadcn theming, brand color variables (`--space-purple`, `--space-gold`, `--space-black`, etc.), typography classes (`.museo-headline`, `.museo-body`, `.museo-label`), custom cursor styles, marquee keyframes, utility classes
- Depends on: Google Fonts (Inter, Playfair Display), Tailwind CSS
- Used by: All components via Tailwind classes and custom CSS classes

## Data Flow

**Content Rendering Flow:**

1. `app/src/config.ts` exports typed configuration objects with all site content (text, images, links)
2. Each section component in `app/src/sections/` imports its config object
3. Section components render the config data into JSX with Tailwind styling
4. `app/src/App.tsx` composes all sections in vertical order

**Animation Flow:**

1. `app/src/App.tsx` registers GSAP ScrollTrigger plugin globally
2. `app/src/App.tsx` creates ScrollTrigger instances for background color transitions between sections (mapping section IDs to background colors)
3. Each section component creates its own GSAP timelines and ScrollTrigger instances in `useEffect` hooks
4. All section components maintain a `triggersRef` array for cleanup on unmount
5. `useLenis` hook integrates Lenis smooth scroll with GSAP ticker for frame-synced smooth scrolling

**Custom Cursor Flow:**

1. `useCustomCursor` hook creates a DOM element (`.custom-cursor`) on mount
2. Tracks mouse position via `mousemove` listener, interpolates cursor position at 15% per frame via `requestAnimationFrame`
3. Detects hover targets via `mouseover`/`mouseout` on `<a>`, `<button>`, or `[data-cursor="hover"]` elements
4. Adds `.hover` class to cursor element for size expansion (12px to 40px)
5. Disabled on touch devices via `(pointer: coarse)` media query check

**State Management:**
- No global state management (no Redux, Zustand, Context, etc.)
- All state is local React refs (`useRef`) for DOM element references and GSAP trigger tracking
- Content is static configuration, not fetched or mutated at runtime

## Key Abstractions

**Section Component Pattern:**
- Purpose: Each full-viewport section follows a consistent pattern
- Examples: `app/src/sections/Hero.tsx`, `app/src/sections/About.tsx`, `app/src/sections/Exhibitions.tsx`, `app/src/sections/Collections.tsx`, `app/src/sections/Testimonials.tsx`, `app/src/sections/Visit.tsx`, `app/src/sections/Footer.tsx`
- Pattern: Import config from `../config` -> early return null if config is empty -> set up refs for DOM elements -> `useEffect` with GSAP animations + ScrollTrigger -> cleanup triggers on unmount -> render JSX with config data

**Config Interface Pattern:**
- Purpose: Type-safe content configuration for each section
- Examples: `HeroConfig`, `AboutConfig`, `ExhibitionsConfig`, `CollectionsConfig`, `TestimonialsConfig`, `VisitConfig`, `FooterConfig` in `app/src/config.ts`
- Pattern: Interface defines shape -> exported const implements interface with all content data

**GSAP ScrollTrigger Cleanup Pattern:**
- Purpose: Prevent memory leaks from scroll-triggered animations
- Examples: Every section component uses `triggersRef = useRef<ScrollTrigger[]>([])` with cleanup in `useEffect` return
- Pattern: Create triggers -> push to `triggersRef.current` -> in cleanup, iterate and `.kill()` each trigger, then reset array

**Icon Map Pattern:**
- Purpose: Map string icon names from config to React icon components
- Examples: `app/src/sections/Visit.tsx` (`iconMap`), `app/src/sections/Footer.tsx` (`socialIconMap`)
- Pattern: `Record<string, React.ComponentType<props>>` mapping string names to lucide-react components, looked up dynamically during render

## Entry Points

**Application Entry:**
- Location: `app/index.html` -> `app/src/main.tsx`
- Triggers: Browser loads `index.html`, which loads `main.tsx` as ES module
- Responsibilities: Creates React root, renders `<App />` in StrictMode

**App Root Component:**
- Location: `app/src/App.tsx`
- Triggers: Mounted by `main.tsx`
- Responsibilities: Initializes Lenis smooth scroll, custom cursor, sets document lang/title from config, creates section background color transitions via ScrollTrigger, renders all 7 sections in order

**Build Entry:**
- Location: `app/vite.config.ts`
- Triggers: `npm run dev` (Vite dev server) or `npm run build` (production build)
- Responsibilities: Configures Vite with React plugin, kimi-plugin-inspect-react (dev tool), and `@` path alias to `./src`

## Error Handling

**Strategy:** Minimal -- defensive null checks with early returns

**Patterns:**
- Each section component checks if its config has meaningful content and returns `null` if not (e.g., `if (!heroConfig.brandLeft && !heroConfig.brandRight) return null`)
- GSAP effect hooks check that all DOM refs are populated before proceeding (`if (!section || !statue || ...) return`)
- No try/catch blocks, no error boundaries, no error reporting
- No loading states (all content is static/bundled)

## Cross-Cutting Concerns

**Logging:** None. No logging framework or console logging in production code.

**Validation:** None at runtime. TypeScript interfaces enforce config shape at compile time only.

**Authentication:** Not applicable. Static marketing site with no user accounts or protected content.

**Accessibility:**
- Focus-visible styles defined in `app/src/App.css` for `<a>` and `<button>` elements
- `prefers-reduced-motion` media query disables animations and hides custom cursor (`app/src/App.css`)
- `prefers-contrast: high` media query adjusts border opacity (`app/src/App.css`)
- Document `lang` attribute set from config (`app/src/App.tsx`)
- Images have `alt` attributes from config
- Default browser cursor hidden globally (`cursor: none` on body) -- custom cursor replaces it

**Performance Optimizations:**
- `will-change: transform` applied to animated elements
- `{ passive: true }` on mouse event listeners in custom cursor hook
- GSAP `lagSmoothing(0)` for consistent animation frame rate
- Lenis smooth scroll tuned with `wheelMultiplier: 1`, `touchMultiplier: 2`
- Scrollbar hidden via `::-webkit-scrollbar { width: 0 }`

---

*Architecture analysis: 2026-02-15*
