# Codebase Structure

**Analysis Date:** 2026-02-15

## Directory Layout

```
joeyrentalkimi/
├── .planning/              # Planning and analysis documents
│   └── codebase/           # Codebase mapping docs (this file lives here)
├── app/                    # Main application (Vite + React + TypeScript)
│   ├── dist/               # Production build output (generated)
│   │   ├── index.html
│   │   └── assets/
│   ├── public/             # Static assets served as-is
│   │   └── images/         # All site images (hero, fleet, gallery, testimonials, etc.)
│   ├── src/                # Application source code
│   │   ├── components/     # Reusable components
│   │   │   └── ui/         # shadcn/ui component library (50+ primitives)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Shared utility functions
│   │   ├── sections/       # Page section components (the actual landing page content)
│   │   ├── App.css         # App-level styles (body, accessibility, reduced motion)
│   │   ├── App.tsx         # Root component (composes all sections)
│   │   ├── config.ts       # All site content and configuration
│   │   ├── index.css       # Global styles (Tailwind, brand tokens, typography, cursor, animations)
│   │   └── main.tsx        # Application entry point (React root)
│   ├── components.json     # shadcn/ui configuration
│   ├── eslint.config.js    # ESLint configuration
│   ├── index.html          # HTML shell (Vite entry)
│   ├── package.json        # Dependencies and scripts
│   ├── package-lock.json   # Dependency lockfile
│   ├── postcss.config.js   # PostCSS config (Tailwind + Autoprefixer)
│   ├── tailwind.config.js  # Tailwind CSS configuration (shadcn theme)
│   ├── tsconfig.json       # TypeScript project references root
│   ├── tsconfig.app.json   # TypeScript config for app source
│   ├── tsconfig.node.json  # TypeScript config for Node (Vite config)
│   └── vite.config.ts      # Vite build configuration
└── .git/                   # Git repository
```

## Directory Purposes

**`app/`:**
- Purpose: The entire application lives here as a single Vite project
- Contains: All source code, config, and build output
- Key files: `package.json`, `vite.config.ts`, `index.html`

**`app/src/sections/`:**
- Purpose: Landing page section components -- each represents a full-viewport (or near-full) vertical section
- Contains: 7 TSX components, one per landing page section
- Key files: `Hero.tsx`, `About.tsx`, `Exhibitions.tsx`, `Collections.tsx`, `Testimonials.tsx`, `Visit.tsx`, `Footer.tsx`

**`app/src/components/ui/`:**
- Purpose: shadcn/ui component library (new-york style). Pre-installed primitives ready for use.
- Contains: 50+ component files (accordion, alert, button, card, dialog, form, tabs, sidebar, etc.)
- Key files: `button.tsx`, `card.tsx`, `form.tsx`, `dialog.tsx`, `sidebar.tsx`, `input.tsx`, `select.tsx`

**`app/src/hooks/`:**
- Purpose: Custom React hooks for cross-cutting behavior
- Contains: 4 hook files
- Key files: `useLenis.ts` (smooth scrolling), `useCustomCursor.ts` (animated cursor), `useScrollTrigger.ts` (GSAP scroll trigger + parallax), `use-mobile.ts` (responsive breakpoint)

**`app/src/lib/`:**
- Purpose: Shared utility functions
- Contains: Single utility file
- Key files: `utils.ts` (exports `cn()` for Tailwind class merging)

**`app/public/images/`:**
- Purpose: Static image assets for the landing page
- Contains: 18 JPG/PNG images (hero car, fleet vehicles, gallery photos, experience packages, testimonials, logo)
- Key files: `hero-rollsroyce.png`, `logo.png`, `fleet-*.jpg`, `experience-*.jpg`, `gallery-*.jpg`, `testimonial-*.jpg`

**`app/dist/`:**
- Purpose: Production build output
- Contains: Bundled and minified HTML, JS, CSS
- Generated: Yes (by `npm run build`)
- Committed: Should not be committed (check `.gitignore`)

## Key File Locations

**Entry Points:**
- `app/index.html`: HTML shell with `<div id="root">` and module script tag
- `app/src/main.tsx`: React root creation, renders `<App />` in StrictMode
- `app/src/App.tsx`: Root component, composes all sections, initializes global effects

**Configuration:**
- `app/src/config.ts`: All site content (text, images, links, section data). This is the single source of truth for all content.
- `app/vite.config.ts`: Vite build config (React plugin, path aliases, kimi inspect plugin)
- `app/tailwind.config.js`: Tailwind CSS theme (shadcn color tokens, animations, border radius)
- `app/tsconfig.app.json`: TypeScript compiler options (strict mode, ES2022 target, `@/*` path alias)
- `app/components.json`: shadcn/ui configuration (new-york style, lucide icons, path aliases)
- `app/postcss.config.js`: PostCSS plugins (tailwindcss, autoprefixer)

**Core Logic:**
- `app/src/sections/Hero.tsx`: Hero section with GSAP entrance animation + scroll parallax
- `app/src/sections/About.tsx`: About section with gallery parallax columns + stats reveal
- `app/src/sections/Exhibitions.tsx`: Vehicle fleet grid with staggered card reveal
- `app/src/sections/Collections.tsx`: Experience packages with GSAP pinned stacking cards
- `app/src/sections/Testimonials.tsx`: Quote testimonial with fade-in reveal
- `app/src/sections/Visit.tsx`: Contact/booking section with info cards
- `app/src/sections/Footer.tsx`: Footer with marquee, links, social icons

**Hooks:**
- `app/src/hooks/useLenis.ts`: Smooth scroll initialization synced with GSAP ticker
- `app/src/hooks/useCustomCursor.ts`: Custom cursor with hover detection and requestAnimationFrame interpolation
- `app/src/hooks/useScrollTrigger.ts`: Reusable GSAP ScrollTrigger and parallax hooks (available but not currently used by sections)
- `app/src/hooks/use-mobile.ts`: Mobile breakpoint detection (768px)

**Styles:**
- `app/src/index.css`: Primary stylesheet -- Google Fonts imports, Tailwind directives, CSS custom properties (shadcn + brand), typography component classes (`.museo-headline`, `.museo-body`, `.museo-label`), Lenis overrides, custom cursor styles, marquee animation, utility classes
- `app/src/App.css`: Secondary stylesheet -- body transition, stacking context, image defaults, typography wrapping, focus-visible styles, reduced motion support, high contrast mode

**Testing:**
- No test files exist in the codebase

## Naming Conventions

**Files:**
- Section components: PascalCase (`Hero.tsx`, `About.tsx`, `Collections.tsx`)
- UI components: kebab-case (`button.tsx`, `alert-dialog.tsx`, `input-otp.tsx`, `button-group.tsx`)
- Hooks: camelCase with `use` prefix (`useLenis.ts`, `useCustomCursor.ts`, `useScrollTrigger.ts`) or kebab-case with `use-` prefix (`use-mobile.ts`)
- Utilities: camelCase (`utils.ts`)
- Config: camelCase (`config.ts`)
- Styles: PascalCase for component-specific (`App.css`), lowercase for global (`index.css`)

**Directories:**
- All lowercase, single words (`sections`, `hooks`, `lib`, `components`, `ui`, `public`, `images`)

**Exports:**
- Section components: PascalCase default export (`export default Hero`)
- UI components: Named PascalCase function exports (`export { Button, buttonVariants }`)
- Hooks: Named camelCase export + default export (`export const useLenis`, `export default useLenis`)
- Config: Named camelCase exports (`export const heroConfig`, `export const siteConfig`)
- Utilities: Named camelCase exports (`export function cn()`)

**CSS Classes:**
- Custom component classes: kebab-case with `museo-` prefix (`museo-headline`, `museo-body`, `museo-label`)
- Brand utility classes: kebab-case (`text-gold`, `bg-gold`, `border-gold`, `text-gold-gradient`)
- Animation classes: kebab-case (`clip-reveal`, `fade-in-up`, `animate-marquee`, `img-reveal`)
- Section-internal classes: kebab-case (`reveal-text`, `reveal-header`, `gallery-col`, `gallery-img-wrap`, `exhibit-card`, `coll-text-el`, `info-card`, `stat-item`, `reveal-item`)

**Config Interfaces:**
- PascalCase suffixed with purpose (`HeroConfig`, `AboutConfig`, `ExhibitionsConfig`, `SiteConfig`)
- Config objects: camelCase suffixed with `Config` (`heroConfig`, `aboutConfig`, `siteConfig`)

## Where to Add New Code

**New Landing Page Section:**
- Create component: `app/src/sections/NewSection.tsx`
- Follow the section pattern: import config -> early null check -> refs + useEffect with GSAP -> cleanup triggers -> render JSX
- Add config interface + exported object to `app/src/config.ts`
- Add section to `app/src/App.tsx` in the desired position within the render
- If section needs a background color transition, add entry to the `sections` array in App.tsx's useEffect

**New Page or Route:**
- This app currently has no router. To add routing, install `react-router-dom`, wrap `<App />` in a router in `app/src/main.tsx`, and create a `app/src/pages/` directory for page components.

**New Reusable Component (custom):**
- Create: `app/src/components/ComponentName.tsx` (PascalCase, in `components/` root, NOT in `ui/`)
- Use `cn()` from `@/lib/utils` for class merging
- Follow shadcn/ui patterns if appropriate (data-slot attributes, variant props via CVA)

**New shadcn/ui Component:**
- Run: `npx shadcn@latest add <component-name>` from inside `app/` directory
- Component will be placed in `app/src/components/ui/<component-name>.tsx`
- Configuration is in `app/components.json`

**New Hook:**
- Create: `app/src/hooks/useHookName.ts` (camelCase with `use` prefix)
- Export both named and default: `export const useHookName` + `export default useHookName`
- If GSAP-based, register ScrollTrigger plugin and follow the triggersRef cleanup pattern

**New Utility Function:**
- Add to `app/src/lib/utils.ts` or create `app/src/lib/newUtil.ts` for domain-specific utilities
- Use named exports

**New Static Images:**
- Place in `app/public/images/`
- Reference as `/images/filename.ext` in config or JSX
- Use kebab-case naming: `category-descriptor.jpg` (e.g., `fleet-lamborghini.jpg`, `experience-wedding.jpg`)

**New CSS:**
- Global styles, brand tokens, new component classes: `app/src/index.css` within the appropriate `@layer`
- App-specific overrides, accessibility: `app/src/App.css`
- Prefer Tailwind utility classes inline over new CSS classes

## Special Directories

**`app/dist/`:**
- Purpose: Production build output (Vite bundles JS/CSS, copies public assets)
- Generated: Yes (`npm run build`)
- Committed: No (should be in `.gitignore`)

**`app/public/`:**
- Purpose: Static assets copied as-is to build output root
- Generated: No
- Committed: Yes
- Note: Files here are referenced by absolute path `/images/...` in code

**`app/src/components/ui/`:**
- Purpose: shadcn/ui managed component library
- Generated: Yes (via `npx shadcn@latest add`)
- Committed: Yes (shadcn generates files into your project, you own them)
- Note: These files can be customized after generation. They are NOT in `node_modules`.

**`.planning/`:**
- Purpose: Project planning and analysis documents
- Generated: By development tooling
- Committed: Yes

---

*Structure analysis: 2026-02-15*
