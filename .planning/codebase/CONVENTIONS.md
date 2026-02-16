# Coding Conventions

**Analysis Date:** 2026-02-15

## Naming Patterns

**Files:**
- Section components: PascalCase (e.g., `app/src/sections/Hero.tsx`, `app/src/sections/Collections.tsx`)
- UI components: kebab-case (e.g., `app/src/components/ui/button-group.tsx`, `app/src/components/ui/alert-dialog.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `app/src/hooks/useLenis.ts`, `app/src/hooks/useCustomCursor.ts`)
- Exception: shadcn-generated hooks use kebab-case (e.g., `app/src/hooks/use-mobile.ts`)
- Config/utility files: camelCase (e.g., `app/src/config.ts`, `app/src/lib/utils.ts`)

**Functions:**
- React components: PascalCase — `function Button()`, `const Hero = () => {}`
- Custom hooks: camelCase with `use` prefix — `useLenis()`, `useCustomCursor()`, `useIsMobile()`
- Utility functions: camelCase — `cn()`

**Variables:**
- Refs: camelCase with `Ref` suffix — `sectionRef`, `statueRef`, `triggersRef`, `cardsRef`
- Config exports: camelCase with `Config` suffix — `siteConfig`, `heroConfig`, `aboutConfig`
- Constants: UPPER_SNAKE_CASE — `MOBILE_BREAKPOINT`, `SIDEBAR_COOKIE_NAME`, `SIDEBAR_WIDTH`

**Types/Interfaces:**
- PascalCase — `SiteConfig`, `HeroConfig`, `NavLink`, `Exhibition`, `ScrollTriggerConfig`
- Use `interface` for object shapes, not `type` (custom code in `app/src/config.ts`)
- shadcn UI components use `type` aliases for context values

## Code Style

**Formatting:**
- No Prettier config detected. No `.prettierrc`, `.editorconfig`, or format script in `package.json`
- Inconsistent semicolon usage: custom code uses semicolons, shadcn UI components omit semicolons
- Indentation: 2 spaces throughout
- Strings: Single quotes in custom code (`'react'`), double quotes in shadcn UI code (`"react"`)
- When adding new custom code, use single quotes and semicolons to match `app/src/sections/`, `app/src/hooks/`, and `app/src/config.ts`
- When modifying shadcn UI components, match their style: double quotes, no semicolons

**Linting:**
- ESLint 9 flat config at `app/eslint.config.js`
- Plugins: `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks` recommended, `react-refresh` (vite)
- TypeScript strict mode enabled in `app/tsconfig.app.json`: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`
- Run lint: `npm run lint`

## Import Organization

**Order (observed in section components like `app/src/sections/Hero.tsx`):**
1. React imports (`import { useEffect, useRef } from 'react'`)
2. Third-party libraries (`import { gsap } from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`)
3. Icon imports from lucide-react (`import { Quote } from 'lucide-react'`)
4. Local config imports (`import { heroConfig } from '../config'`)
5. Local component/hook imports

**Order (observed in shadcn UI components like `app/src/components/ui/sidebar.tsx`):**
1. `"use client"` directive (first line, when present)
2. React imports (`import * as React from "react"`)
3. Third-party primitives (`import * as DialogPrimitive from "@radix-ui/react-dialog"`)
4. Icons (`import { XIcon } from "lucide-react"`)
5. Local utils (`import { cn } from "@/lib/utils"`)
6. Local UI components (`import { Button } from "@/components/ui/button"`)

**Path Aliases:**
- `@/` maps to `./src/` (configured in `app/tsconfig.json` and `app/vite.config.ts`)
- Use `@/lib/utils` for utility imports
- Use `@/components/ui/*` for UI component imports
- Use `@/hooks/*` for hook imports
- Section components use relative imports: `'../config'`

## Component Patterns

**Section Components (`app/src/sections/*.tsx`):**
- Use arrow function syntax: `const Hero = () => { ... }`
- Default export at file bottom: `export default Hero;`
- Always have a `sectionRef` with `useRef<HTMLElement>(null)`
- Always have a `triggersRef` with `useRef<ScrollTrigger[]>([])` for GSAP cleanup
- Early return `null` for empty config: `if (!heroConfig.brandLeft && !heroConfig.brandRight) return null;`
- Single `useEffect` with `[]` dependency array for GSAP animations
- Cleanup pattern: `triggersRef.current.forEach((t) => t.kill()); triggersRef.current = [];`
- All animation data comes from config objects imported from `app/src/config.ts`

**Section component template:**
```typescript
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { someConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const SectionName = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  if (!someConfig.headline) return null;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Animation setup...

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  return (
    <section id="section-id" ref={sectionRef} className="relative w-full bg-[#050505]">
      {/* Content */}
    </section>
  );
};

export default SectionName;
```

**shadcn UI Components (`app/src/components/ui/*.tsx`):**
- Use `function` declarations (not arrow functions): `function Button({ ... }) { ... }`
- Named exports (no default export): `export { Button, buttonVariants }`
- Use `data-slot` attribute on root elements for identification: `data-slot="button"`
- Props typed with `React.ComponentProps<"element">` intersection
- Always accept `className` and spread remaining props
- Always use `cn()` for className merging
- Use `class-variance-authority` (`cva`) for variant-based styling

**UI component template:**
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

function ComponentName({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component-name"
      className={cn("base-classes", className)}
      {...props}
    />
  )
}

export { ComponentName }
```

**Hook Pattern (`app/src/hooks/*.ts`):**
- Both named and default exports: `export const useLenis = ...; export default useLenis;`
- Return refs or values, not objects (e.g., `return lenisRef;`, `return !!isMobile`)
- Cleanup side effects in return function of `useEffect`

## GSAP Animation Conventions

**Registration:** Call `gsap.registerPlugin(ScrollTrigger)` at module level in every file that uses ScrollTrigger

**Initial state:** Use `gsap.set()` before animating: `gsap.set(el, { opacity: 0, y: 60 })`

**Animation easing:** Consistently use `'power3.out'` for entrance animations

**ScrollTrigger defaults:**
- `start: 'top 85%'` for element reveals
- `scrub: 0.5` or `scrub: 0.6` for parallax effects
- Always store triggers in `triggersRef.current` array for cleanup

**Parallax pattern:** Use `onUpdate` callback with `self.progress` for scrub-based animations

## CSS/Styling Conventions

**Approach:** Tailwind CSS utility-first with custom CSS component classes

**Custom CSS classes defined in `app/src/index.css`:**
- Typography: `museo-headline`, `museo-body`, `museo-label`
- Colors: `text-gold`, `text-gold-gradient`, `bg-gold`, `border-gold`
- Animation: `clip-reveal`, `fade-in-up`, `animate-marquee`
- Performance: `will-change-transform`, `gpu-accelerate`, `backface-hidden`
- Use `will-change-transform` class on animated elements

**Color system:**
- Brand colors defined as CSS custom properties: `--space-purple`, `--space-gold`, `--space-black`, etc.
- shadcn theme colors use HSL CSS variables: `--primary`, `--background`, `--foreground`, etc.
- Hard-coded hex colors in section backgrounds: `#050505` (dark), `#f0f0f0` (light), `#8c8c91` (grey)

**Responsive breakpoints:** Use Tailwind's `md:` (768px) and `lg:` (1024px) prefixes

**Spacing:** Use Tailwind spacing scale — `px-8 lg:px-16` is the standard section padding

**Container pattern:** `max-w-7xl mx-auto px-8 lg:px-16` for content width constraint

## Error Handling

**Patterns:**
- Early return `null` for missing config data (defensive rendering)
- Null checks on refs before DOM operations: `if (!section || !statue) return;`
- Optional chaining for cleanup: `tweenRef.current?.scrollTrigger?.kill()`
- No try/catch blocks — the codebase has no async operations or API calls
- No error boundary components detected

## Logging

**Framework:** None. No console.log, no logging framework. The codebase is entirely client-side with no logging.

## Comments

**When to Comment:**
- Section boundary comments in JSX: `{/* Hero Section */}`, `{/* Navigation */}`
- Config section separators: `// HERO SECTION`, `// ABOUT SECTION`
- GSAP animation phase comments: `// Set initial states`, `// Entrance timeline`, `// Scroll parallax`
- No JSDoc/TSDoc on any functions or interfaces

**Style:**
- Single-line `//` comments for code explanations
- JSX `{/* */}` comments for template sections
- Inline CSS comment blocks for organization in `app/src/index.css`

## Module Design

**Exports:**
- Section components: single default export
- UI components: multiple named exports, no default
- Hooks: both named export and default export
- Config: all named exports (`export const siteConfig`, `export interface SiteConfig`)

**Barrel Files:** None. No `index.ts` barrel files anywhere in the codebase.

## Data Architecture

**All content is centralized in `app/src/config.ts`:**
- Every interface is explicitly typed and exported
- Config objects are exported as `const` with full type annotations
- Sections receive data through imported config objects, not props
- No prop drilling — sections import directly from config

---

*Convention analysis: 2026-02-15*
