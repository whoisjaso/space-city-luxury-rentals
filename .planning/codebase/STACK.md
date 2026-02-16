# Technology Stack

**Analysis Date:** 2026-02-15

## Languages

**Primary:**
- TypeScript ~5.9.3 - All application code, components, hooks, config, and build tooling
- CSS - Styling via Tailwind utility classes plus custom CSS in `app/src/index.css` and `app/src/App.css`

**Secondary:**
- HTML - Single entry point `app/index.html`
- JavaScript - Config files only (`app/eslint.config.js`, `app/postcss.config.js`, `app/tailwind.config.js`)

## Runtime

**Environment:**
- Browser (client-side SPA) - No server-side runtime
- Node.js - Required for development tooling (Vite dev server, build, lint)

**Package Manager:**
- npm - `app/package-lock.json` present
- Lockfile: present (`app/package-lock.json`, 302KB)
- `node_modules`: not currently installed (must run `npm install` in `app/`)

## Frameworks

**Core:**
- React ^19.2.0 - UI framework, functional components with hooks
- React DOM ^19.2.0 - DOM rendering via `createRoot` in `app/src/main.tsx`

**Animation:**
- GSAP ^3.14.2 - All scroll animations, parallax, entrance effects, stacking cards
- GSAP ScrollTrigger - Registered as plugin in every section component and `app/src/App.tsx`
- Lenis (via `@studio-freight/lenis` ^1.0.42) - Smooth scroll, integrated with GSAP ticker in `app/src/hooks/useLenis.ts`

**UI Components:**
- shadcn/ui (new-york style) - Component library configured via `app/components.json`
- Radix UI - Headless primitives (18 packages: accordion, dialog, dropdown-menu, tabs, tooltip, etc.)
- Lucide React ^0.562.0 - Icon library used in sections (Footer, Visit, Testimonials)

**Styling:**
- Tailwind CSS ^3.4.19 - Utility-first CSS framework
- tailwindcss-animate ^1.0.7 - Animation plugin for Tailwind
- tw-animate-css ^1.4.0 - Additional CSS animations
- PostCSS ^8.5.6 + Autoprefixer ^10.4.23 - CSS processing pipeline

**Build/Dev:**
- Vite ^7.2.4 - Build tool and dev server
- @vitejs/plugin-react ^5.1.1 - React Fast Refresh and JSX transform
- kimi-plugin-inspect-react ^1.0.3 - React component inspection dev plugin (configured in `app/vite.config.ts`)

**Linting:**
- ESLint ^9.39.1 - Flat config in `app/eslint.config.js`
- typescript-eslint ^8.46.4 - TypeScript ESLint integration
- eslint-plugin-react-hooks ^7.0.1 - React hooks linting rules
- eslint-plugin-react-refresh ^0.4.24 - React Refresh boundary validation

**Testing:**
- Not detected - No test framework, test config, or test files present

## Key Dependencies

**Critical (core functionality):**
- `react` ^19.2.0 - UI rendering
- `gsap` ^3.14.2 - All animation (scroll reveals, parallax, stacking cards, entrance timelines)
- `@studio-freight/lenis` ^1.0.42 - Smooth scroll behavior
- `tailwindcss` ^3.4.19 - All styling

**UI Library (shadcn/ui ecosystem):**
- `class-variance-authority` ^0.7.1 - Component variant definitions (`app/src/components/ui/button.tsx`, `app/src/components/ui/badge.tsx`, etc.)
- `clsx` ^2.1.1 - Conditional class joining
- `tailwind-merge` ^3.4.0 - Tailwind class deduplication
- `@radix-ui/react-slot` ^1.2.4 - Polymorphic component support
- `lucide-react` ^0.562.0 - Icon set

**Form & Validation (installed but not actively used in sections):**
- `react-hook-form` ^7.70.0 - Form state management
- `@hookform/resolvers` ^5.2.2 - Form validation resolvers
- `zod` ^4.3.5 - Schema validation

**Visualization (installed but not actively used in sections):**
- `recharts` ^2.15.4 - Chart library
- `react-day-picker` ^9.13.0 - Date picker
- `date-fns` ^4.1.0 - Date utilities

**Additional UI (installed but not used in current sections):**
- `cmdk` ^1.1.1 - Command palette
- `embla-carousel-react` ^8.6.0 - Carousel
- `input-otp` ^1.4.2 - OTP input
- `next-themes` ^0.4.6 - Theme switching
- `react-resizable-panels` ^4.2.2 - Resizable panels
- `sonner` ^2.0.7 - Toast notifications
- `vaul` ^1.1.2 - Drawer component

## Configuration

**TypeScript:**
- `app/tsconfig.json` - Project references config, defines `@/*` path alias to `./src/*`
- `app/tsconfig.app.json` - App code config: ES2022 target, strict mode, bundler module resolution, `react-jsx` JSX transform
- `app/tsconfig.node.json` - Node tooling config: ES2023 target, covers `vite.config.ts`

**Build:**
- `app/vite.config.ts` - Vite config with `base: './'` (relative paths), `@` path alias, React plugin, kimi inspect plugin
- `app/postcss.config.js` - PostCSS with Tailwind CSS and Autoprefixer plugins
- `app/tailwind.config.js` - Tailwind with darkMode: "class", shadcn/ui color tokens via CSS custom properties, custom animations (accordion, caret-blink), `tailwindcss-animate` plugin

**Component Library:**
- `app/components.json` - shadcn/ui configuration: new-york style, TSX, no RSC, lucide icons, path aliases for `@/components`, `@/lib`, `@/hooks`, `@/components/ui`

**Linting:**
- `app/eslint.config.js` - ESLint flat config targeting `**/*.{ts,tsx}`, extends recommended configs for JS, TypeScript, React hooks, and React Refresh

**Content:**
- `app/src/config.ts` - All site content (text, links, image paths) managed via typed config objects. Single source of truth for all section data.

**Fonts (external):**
- Google Fonts loaded via CSS `@import` in `app/src/index.css`:
  - Inter (weights 300-700) - Primary font
  - Playfair Display (weights 400-700) - Imported but not actively used in current CSS classes

**Environment Variables:**
- None required - No `.env` files present, no environment variable references in code
- All content is hardcoded in `app/src/config.ts`

## Platform Requirements

**Development:**
- Node.js (version not pinned, no `.nvmrc`)
- npm (lockfile version present)
- Run `npm install` in `app/` directory, then `npm run dev`

**Production:**
- Static file hosting only - Vite builds to `app/dist/` directory
- `base: './'` in Vite config means assets use relative paths (deployable to any subdirectory)
- Pre-built `app/dist/` directory exists with `assets/`, `images/`, and `index.html`

**Scripts (defined in `app/package.json`):**
```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

---

*Stack analysis: 2026-02-15*
