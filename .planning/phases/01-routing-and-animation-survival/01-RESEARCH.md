# Phase 1: Routing & Animation Survival - Research

**Researched:** 2026-02-15
**Domain:** React Router v7 integration, GSAP ScrollTrigger lifecycle, Lenis smooth scroll scoping, Vercel SPA deployment
**Confidence:** HIGH

## Summary

This phase introduces React Router v7 into an existing React 19 + Vite 7 SPA that has 30+ GSAP ScrollTrigger instances and Lenis smooth scrolling across 7 section components. The core risk is that adding routing causes animations to leak memory, double-fire, or break scroll behavior when components mount/unmount during navigation.

Research confirms that the standard solution is: (1) use `@gsap/react`'s `useGSAP()` hook which wraps `gsap.context()` for automatic cleanup of all GSAP instances on unmount, (2) scope Lenis to the landing page route only using the new `lenis` package's React integration, (3) use React Router v7 in **Declarative mode** (`BrowserRouter`) since this phase adds no data loading/actions, and (4) fix three existing hook bugs that would cause memory leaks under routing.

**Primary recommendation:** Use Declarative mode (`BrowserRouter` + `Routes` + `Route`) for Phase 1 since no loaders/actions are needed yet. Migrate all section component GSAP effects from `useEffect` to `useGSAP()` for automatic cleanup. Fix the `useLenis.ts` ticker leak and `useScrollTrigger.ts` infinite recreation bugs before routing is added. Add a nuclear `ScrollTrigger.getAll().forEach(t => t.kill())` safety net in the LandingPage cleanup.

---

## Standard Stack

### New Dependencies for This Phase

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-router` | ^7.13.x | Client-side routing (BrowserRouter, Routes, Route, Link, Outlet, useNavigate, useLocation) | Official React routing solution; v7 consolidates everything into single `react-router` package (no `react-router-dom` needed) |
| `@gsap/react` | ^2.1.x | `useGSAP()` hook -- drop-in replacement for `useEffect` that auto-reverts all GSAP animations, ScrollTriggers, Draggables on unmount via `gsap.context()` | Official GSAP React integration by GreenSock; solves the double-mount (StrictMode) and cleanup problems |
| `lenis` | ^1.3.x | Replace deprecated `@studio-freight/lenis` with the renamed package | `@studio-freight/lenis` is officially deprecated; `lenis` is the active maintained package |

### Packages to Remove

| Package | Reason |
|---------|--------|
| `@studio-freight/lenis` ^1.0.42 | Deprecated. Replaced by `lenis` package. Import path changes from `import Lenis from '@studio-freight/lenis'` to `import Lenis from 'lenis'` |

### What NOT to Install

| Package | Why Not |
|---------|---------|
| `react-router-dom` | Deprecated in v7. Everything is in the `react-router` package now. ([Source](https://reactrouter.com/upgrading/v6)) |
| `@react-router/dev` | Framework mode Vite plugin. NOT needed for Declarative or Data mode. Would require restructuring the entire app. |
| `@vercel/react-router` | Only for React Router Framework mode with SSR on Vercel. This is a pure client-side SPA. |

### Installation

```bash
cd app
npm install react-router@^7 @gsap/react@^2
npm install lenis@^1.3
npm uninstall @studio-freight/lenis
```

**Confidence:** HIGH -- verified via official React Router v7 docs ([modes page](https://reactrouter.com/start/modes)), GSAP React docs ([gsap.com/resources/React](https://gsap.com/resources/React/)), and Lenis GitHub ([darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)).

---

## Architecture Patterns

### Recommended Route Structure for Phase 1

Phase 1 only needs ONE route (the landing page). But the architecture must support adding routes in later phases without refactoring.

```
main.tsx
  StrictMode
    BrowserRouter
      App
        Routes
          Route path="/" element={<LandingPage />}
          Route path="*" element={<Navigate to="/" />}
```

In later phases, this expands to:
```
Routes
  Route path="/" element={<LandingPage />}
  Route element={<PublicLayout />}>
    Route path="/fleet" element={<FleetPage />}
    ...
  Route element={<AdminLayout />}>
    Route path="/admin/..." element={...}
```

### Pattern 1: Declarative Mode (BrowserRouter)

**What:** Use `<BrowserRouter>` with `<Routes>` and `<Route>` components.
**When:** Phase 1, where no data loaders or actions are needed.
**Why not Data Mode yet:** `createBrowserRouter` with `RouterProvider` is more powerful but adds complexity. The landing page loads zero data from any API -- it is entirely config-driven. Data Mode should be adopted in Phase 2 when Supabase data loading begins, or the route definitions can be converted then.

```typescript
// app/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

```typescript
// app/src/App.tsx (new: thin router shell)
import { Routes, Route, Navigate } from 'react-router';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Catch-all: redirect unknown routes to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
```

**Confidence:** HIGH -- verified via [React Router modes documentation](https://reactrouter.com/start/modes).

### Pattern 2: useGSAP Hook for All Animation Effects

**What:** Replace every `useEffect` that creates GSAP animations/ScrollTriggers with `useGSAP()`.
**When:** Every section component (Hero, About, Exhibitions, Collections, Testimonials, Visit) and the LandingPage component (background color transitions).
**Why:** `useGSAP()` wraps everything in `gsap.context()`, which automatically reverts ALL property changes (not just kills animations) on unmount. This correctly handles React 19 StrictMode double-mount AND React Router unmount/remount cycles.

```typescript
// Before (current pattern -- broken under routing)
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    gsap.set(element, { opacity: 0, y: 60 });
    // ... create animations and triggers ...
    triggersRef.current.push(trigger);

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);
};
```

```typescript
// After (correct pattern with useGSAP)
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // All gsap.set(), gsap.to(), ScrollTrigger.create() calls here
    // are automatically tracked and reverted on unmount
    gsap.set(element, { opacity: 0, y: 60 });
    // ... create animations and triggers ...
    // NO manual cleanup needed -- context.revert() handles everything
  }, { scope: sectionRef }); // scope restricts selectors to this container

  return <section ref={sectionRef}>...</section>;
};
```

**Key differences:**
1. No more `triggersRef` arrays -- context tracks everything automatically
2. No more manual cleanup in return function -- `gsap.context().revert()` handles it
3. The `scope` parameter scopes all selector text (like `.reveal-text`) to descendants of the ref, preventing cross-component selector collisions
4. StrictMode double-mount is handled correctly because `revert()` undoes ALL property changes, not just kills triggers

**Confidence:** HIGH -- verified via [GSAP React documentation](https://gsap.com/resources/React/) and [@gsap/react GitHub](https://github.com/greensock/react).

### Pattern 3: LandingPage Component with Nuclear Cleanup

**What:** Move all current `App.tsx` content into `pages/LandingPage.tsx`. Add a safety-net cleanup that kills ALL ScrollTrigger instances and resets body styles when navigating away.
**When:** This is the core migration step for Phase 1.

```typescript
// app/src/pages/LandingPage.tsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import useLenis from '../hooks/useLenis';
import useCustomCursor from '../hooks/useCustomCursor';
import { siteConfig } from '../config';

// Sections
import Hero from '../sections/Hero';
import About from '../sections/About';
import Exhibitions from '../sections/Exhibitions';
import Collections from '../sections/Collections';
import Testimonials from '../sections/Testimonials';
import Visit from '../sections/Visit';
import Footer from '../sections/Footer';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  // Lenis ONLY for landing page
  useLenis();

  // Custom cursor ONLY for landing page
  useCustomCursor();

  // Set document metadata
  useEffect(() => {
    if (siteConfig.language) {
      document.documentElement.lang = siteConfig.language;
    }
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }
  }, []);

  // Background color transitions -- using useGSAP for automatic cleanup
  useGSAP(() => {
    const sections = [
      { selector: '#hero-section', color: '#8c8c91' },
      { selector: '#about', color: '#050505' },
      { selector: '#exhibitions', color: '#050505' },
      { selector: '#collections', color: '#f0f0f0' },
      { selector: '#testimonials-section', color: '#8c8c91' },
      { selector: '#contact', color: '#050505' },
      { selector: '#footer-section', color: '#8c8c91' },
    ];

    sections.forEach(({ selector, color }) => {
      const el = document.querySelector(selector);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to('body', { backgroundColor: color, duration: 0.6, ease: 'power2.out' });
        },
        onEnterBack: () => {
          gsap.to('body', { backgroundColor: color, duration: 0.6, ease: 'power2.out' });
        },
      });
    });
  }, { scope: mainRef });

  // Nuclear cleanup on unmount: catch any orphaned triggers
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearMatchMedia();
      // Reset body background to default
      document.body.style.backgroundColor = '#050505';
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">
      <div id="hero-section"><Hero /></div>
      <About />
      <Exhibitions />
      <Collections />
      <div id="testimonials-section"><Testimonials /></div>
      <Visit />
      <div id="footer-section"><Footer /></div>
    </div>
  );
}

export default LandingPage;
```

**Confidence:** HIGH -- this pattern is recommended in multiple GSAP community forum posts about React Router integration.

### Pattern 4: Lenis Scoped to Landing Page

**What:** The `useLenis()` hook is called inside `LandingPage.tsx`, not in the router shell. When the user navigates away, LandingPage unmounts, Lenis is destroyed, and native browser scroll resumes.

**Critical fix:** The current `useLenis.ts` must also remove the `html.lenis` and `html.lenis-smooth` CSS classes on cleanup, otherwise the Lenis CSS rules (which override scroll behavior) persist after the instance is destroyed.

**Confidence:** HIGH -- verified via [Lenis GitHub Issue #319](https://github.com/darkroomengineering/lenis/issues/319) and [Lenis React docs](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md).

### Anti-Patterns to Avoid

- **Putting `useLenis()` or `useCustomCursor()` in App.tsx (the router shell):** These must be scoped to LandingPage only. Lenis would corrupt scroll on form pages; custom cursor is wrong on admin tables.
- **Using Data Mode (`createBrowserRouter`) in Phase 1:** Unnecessary complexity when there is only one route with zero data loading. Can migrate to Data Mode in Phase 2 when Supabase is added.
- **Keeping `useEffect` for GSAP animations:** Without `gsap.context()`, cleanup only kills triggers/timelines but does NOT revert CSS property changes made by `gsap.set()`. This causes wrong starting positions on StrictMode double-mount and route re-mount.
- **Removing StrictMode to "fix" animation flickering:** StrictMode catches real bugs. The correct fix is `useGSAP()`, not removing the safety net.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GSAP animation cleanup on unmount | Manual `triggersRef` arrays with `forEach(t => t.kill())` | `useGSAP()` hook from `@gsap/react` | `gsap.context().revert()` handles ALL instances (animations, triggers, property changes) automatically. Manual tracking misses `gsap.set()` changes and is error-prone. |
| Scroll-to-top on route change | Custom `useEffect` with `window.scrollTo` | Will be needed in Phase 2 with `useLocation` hook; for Phase 1 there is only one route | React Router's `<ScrollRestoration />` exists for Data Mode; for Declarative Mode, a simple `ScrollToTop` component suffices. |
| SPA routing on Vercel | Custom server config | `vercel.json` with `rewrites` | One-line config that is the official Vercel solution. |

---

## Bug Fixes (Existing Codebase)

### Bug 1: useLenis.ts Ticker Cleanup Creates New Anonymous Function

**File:** `app/src/hooks/useLenis.ts` (lines 26-36)
**What:** The cleanup function does `gsap.ticker.remove((time) => { lenis.raf(time * 1000); })` which creates a new arrow function. This is a different reference than the one passed to `gsap.ticker.add()` on line 26. The `remove` call does nothing because the function references don't match.
**Impact:** The GSAP ticker callback is never removed. Under routing, each mount/unmount cycle adds a new ticker callback that fires on a destroyed Lenis instance. This causes errors and memory leaks.

**Fix:**
```typescript
// app/src/hooks/useLenis.ts -- FIXED
import { useEffect, useRef } from 'react';
import Lenis from 'lenis'; // Updated from '@studio-freight/lenis'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    // Store the callback reference so we can remove the SAME function
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback); // Same reference as added
      // Remove Lenis CSS classes that override scroll behavior
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  return lenisRef;
};

export default useLenis;
```

**Confidence:** HIGH -- direct code inspection confirms the bug. The fix pattern (storing callback in variable) is a standard JavaScript closure pattern.

### Bug 2: useScrollTrigger.ts Config Object as useEffect Dependency

**File:** `app/src/hooks/useScrollTrigger.ts` (line 40)
**What:** `useEffect(() => { ... }, [config])` -- the `config` parameter is an object. Every render creates a new object reference, even if the properties are identical. This causes the useEffect to re-run every render, destroying and recreating the ScrollTrigger instance infinitely.
**Impact:** Infinite ScrollTrigger recreation on every render. Performance degradation.

**Note:** This hook is currently unused (no component imports it). The fix is relevant if it will be used in later phases. For Phase 1, it can be either fixed or deleted.

**Fix (if keeping):**
```typescript
// Option A: Destructure individual properties as dependencies
useEffect(() => {
  triggerRef.current = ScrollTrigger.create({
    trigger: config.trigger,
    start: config.start || 'top 80%',
    end: config.end || 'bottom 20%',
    scrub: config.scrub || false,
    pin: config.pin || false,
    markers: config.markers || false,
    onEnter: config.onEnter,
    onLeave: config.onLeave,
    onEnterBack: config.onEnterBack,
    onLeaveBack: config.onLeaveBack,
  });

  return () => {
    triggerRef.current?.kill();
  };
}, [
  config.trigger,
  config.start,
  config.end,
  config.scrub,
  config.pin,
  config.markers,
  // Note: function callbacks should be wrapped in useCallback by the consumer
]);
```

**Confidence:** HIGH -- standard React dependency array issue. Direct code inspection.

### Bug 3: cursor:none Without Accessibility Media Queries

**Files:** `app/src/App.css` (lines 17, 22), `app/src/index.css` (line 73)
**What:** Three `cursor: none` declarations applied globally without checking if the user has a precise pointing device. This hides the system cursor for all users, including those using assistive technology, enlarged cursors, or touch devices (though touch is handled in the hook).

**Fix:** Wrap all `cursor: none` declarations in a media query:
```css
/* Only hide cursor for devices with a precise pointer (mouse) */
@media (any-hover: hover) and (pointer: fine) {
  body {
    cursor: none;
  }
  a {
    cursor: none;
  }
  button {
    cursor: none;
  }
}
```

Remove the standalone `cursor: none` from `body` in `index.css` line 73, from `a` in `App.css` line 17, and from `button` in `App.css` line 22. Replace with the media-queried version above.

**Confidence:** HIGH -- WCAG accessibility requirement. Direct code inspection.

### Bug 4: Rules of Hooks Violations (Conditional Returns Before Hooks)

**Files:** All section components (`Hero.tsx` line 18, `About.tsx` line 15, `Exhibitions.tsx` line 15, `Collections.tsx` line 15, `Testimonials.tsx` line 14, `Visit.tsx` line 21)
**What:** Each section has a pattern like `if (!config.x) return null;` BEFORE the `useEffect` call. This violates React's Rules of Hooks because the hook call count changes if the condition were ever true (though it currently cannot with static config).

**Fix:** Move hooks above the conditional return, or (preferred when migrating to `useGSAP`) restructure so the early return is inside the JSX or after all hooks. When converting from `useEffect` to `useGSAP`, this natural restructuring happens:

```typescript
const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  // ... all other refs ...

  // useGSAP runs after all hooks are declared
  useGSAP(() => {
    // Animation logic, returns early inside if refs are null
    if (!sectionRef.current) return;
    // ...
  }, { scope: sectionRef });

  // Now the conditional return is after all hooks
  if (!heroConfig.brandLeft && !heroConfig.brandRight) return null;

  return <section ref={sectionRef}>...</section>;
};
```

**Confidence:** HIGH -- React Rules of Hooks violation confirmed by code inspection.

---

## Common Pitfalls

### Pitfall 1: ScrollTrigger Memory Leaks on Route Change

**What goes wrong:** When React Router unmounts the LandingPage, `useEffect` cleanup only kills tracked triggers. But `gsap.set()` inline style changes, timelines created outside `triggersRef`, and any ScrollTrigger instances created by third-party code remain as zombies. On re-mount, new instances are created alongside orphans.
**Why it happens:** `kill()` removes the ScrollTrigger but does NOT revert CSS properties set by `gsap.set()`. Elements retain their animated styles.
**How to avoid:** Use `useGSAP()` which uses `gsap.context().revert()` -- this reverts ALL property changes, not just kills. Add the nuclear cleanup (`ScrollTrigger.getAll().forEach(t => t.kill())`) in LandingPage's `useEffect` cleanup as a safety net.
**Warning signs:** `ScrollTrigger.getAll().length` in browser console returns numbers higher than expected. Memory increases after navigation cycles in Performance tab.

### Pitfall 2: Lenis Scroll Position Corruption on Route Change

**What goes wrong:** Lenis holds scroll position from the previous page. When navigating back to landing, the page starts partway down instead of at the top. If Lenis is still animating (has not come to complete stop) when a link is clicked, the next page gets a corrupted scroll position.
**Why it happens:** Lenis continuously updates `window.scroll` via `requestAnimationFrame`. React Router reads scroll position for history state, creating a race condition.
**How to avoid:** Scope Lenis to LandingPage only (it destroys on unmount). In later phases when the `ScrollToTop` component is added, it should use `window.scrollTo(0, 0)` with `{ behavior: 'instant' }` to avoid interference.
**Warning signs:** Pages start scrolled partway down. Browser back button restores wrong positions.

### Pitfall 3: Vercel SPA 404s on Direct URL Access

**What goes wrong:** Refreshing on any non-root route returns Vercel's 404 page because no file exists at that path on the server.
**Why it happens:** Vite builds a single `index.html`. Without server-side rewrite rules, Vercel looks for a file at the requested path.
**How to avoid:** Create `vercel.json` at the project root with the rewrite rule. Deploy this in the same commit as React Router.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Warning signs:** 404 on any non-root URL after deployment.

### Pitfall 4: StrictMode Double-Mount Breaks GSAP Animations

**What goes wrong:** In development, React mounts, unmounts, and re-mounts components. With raw `useEffect`, `gsap.set()` changes are NOT reverted on unmount, so the second mount starts with wrong initial states. Elements flash, jump, or appear in wrong positions.
**Why it happens:** `gsap.set()` modifies inline styles. `useEffect` cleanup with `trigger.kill()` removes the trigger but leaves the inline styles. The re-mount then calls `gsap.set()` again on elements that already have modified styles.
**How to avoid:** `useGSAP()` uses `gsap.context().revert()` which reverts ALL inline style changes, not just kills triggers.
**Warning signs:** Animations look broken in development (`npm run dev`) but work in production build. Elements visible when they should be hidden (opacity: 0 state never applied).

### Pitfall 5: Vite `base: './'` Breaks BrowserRouter

**What goes wrong:** The current `vite.config.ts` has `base: './'` which uses relative asset paths. `BrowserRouter` uses the History API which expects assets to be served from the root (`/`). When navigating to `/fleet` and refreshing, relative paths like `./assets/index.js` resolve to `/fleet/assets/index.js` which does not exist.
**Why it happens:** Relative paths are resolved from the current URL path, not the domain root. This works for a single-page site at `/` but breaks for any nested route.
**How to avoid:** Change `base` in `vite.config.ts` from `'./'` to `'/'` (or remove the `base` property entirely since `'/'` is the default).

```typescript
// vite.config.ts -- BEFORE
export default defineConfig({
  base: './',  // WRONG for SPA routing
  plugins: [inspectAttr(), react()],
  // ...
});

// vite.config.ts -- AFTER
export default defineConfig({
  // base defaults to '/' which is correct for SPA routing
  plugins: [inspectAttr(), react()],
  // ...
});
```

**Warning signs:** CSS/JS assets fail to load when accessing any non-root route directly. Console shows 404 errors for asset files.

**Confidence:** HIGH -- this is a documented Vite + React Router integration requirement ([Vite issue #13390](https://github.com/vitejs/vite/discussions/13390), [React Router issue #11116](https://github.com/remix-run/react-router/issues/11116)).

### Pitfall 6: Redundant gsap.registerPlugin Calls After Migration

**What goes wrong:** Currently `gsap.registerPlugin(ScrollTrigger)` is called in 9 different files. After adding `@gsap/react`, `useGSAP` also needs to be registered. If registration happens inconsistently, some components may not have access to the plugin.
**How to avoid:** Register ALL plugins once in a single file (e.g., `app/src/lib/gsap.ts` or at the top of `LandingPage.tsx`) and remove all other `gsap.registerPlugin` calls.

```typescript
// app/src/lib/gsap.ts (optional centralized registration)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
```

Then all section components import from this file instead of directly from `gsap`.

---

## Code Examples

### Complete useGSAP Migration for a Section Component

This shows the Hero component migrated from `useEffect` to `useGSAP`:

```typescript
// app/src/sections/Hero.tsx -- MIGRATED
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { heroConfig } from '../config';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statueRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const statue = statueRef.current;
    const leftText = leftTextRef.current;
    const rightText = rightTextRef.current;
    const nav = navRef.current;
    const badge = badgeRef.current;
    const bottom = bottomRef.current;

    if (!section || !statue || !leftText || !rightText || !nav || !badge || !bottom) return;

    // Set initial states -- these will be auto-reverted on unmount
    gsap.set([leftText, rightText], { opacity: 0, y: 60 });
    gsap.set(statue, { opacity: 0, scale: 1.08, y: 40 });
    gsap.set(nav, { opacity: 0, y: -20 });
    gsap.set(badge, { opacity: 0, y: 20 });
    gsap.set(bottom, { opacity: 0 });

    // Entrance timeline -- auto-killed on unmount
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
    tl.to(statue, { opacity: 1, scale: 1, y: 0, duration: 1.4 })
      .to(leftText, { opacity: 1, y: 0, duration: 1 }, '-=1')
      .to(rightText, { opacity: 1, y: 0, duration: 1 }, '-=0.85')
      .to(nav, { opacity: 1, y: 0, duration: 0.7 }, '-=0.7')
      .to(badge, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')
      .to(bottom, { opacity: 1, duration: 0.5 }, '-=0.3');

    // Scroll parallax -- auto-killed on unmount
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(statue, { y: p * 120 });
        gsap.set(leftText, { y: p * 200, x: p * -60 });
        gsap.set(rightText, { y: p * 180, x: p * 60 });
        gsap.set(badge, { y: p * 80 });
      },
    });
    // No triggersRef needed! No manual cleanup needed!
  }, { scope: sectionRef });

  // Conditional return is now AFTER the hook call (Rules of Hooks compliant)
  if (!heroConfig.brandLeft && !heroConfig.brandRight) return null;

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[#8c8c91]">
      {/* ... same JSX as before ... */}
    </section>
  );
};

export default Hero;
```

### Lenis with GSAP Ticker (Fixed Version)

```typescript
// app/src/hooks/useLenis.ts -- FIXED
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    // FIXED: Store callback reference for proper removal
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
      // Clean up Lenis CSS classes
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  return lenisRef;
};

export default useLenis;
```

### vercel.json for SPA Routing

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Place at project root (`D:/joeyrentalkimi/vercel.json`), NOT inside `app/`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@studio-freight/lenis` | `lenis` (npm package) | 2024 | Import path changes; old package deprecated |
| `react-router-dom` | `react-router` (single package) | React Router v7 (Oct 2024) | No separate DOM package needed |
| `useEffect` + manual GSAP cleanup | `useGSAP()` from `@gsap/react` | @gsap/react v2.0 (2024) | Automatic `gsap.context()` cleanup |
| `<BrowserRouter>` + `<Routes>` (Declarative) | `createBrowserRouter` + `RouterProvider` (Data) | React Router v6.4 (2022) | Loaders, actions, pending states; but Declarative still valid for simple cases |

**Deprecated/outdated:**
- `@studio-freight/lenis`: Renamed to `lenis`. Will stop receiving updates.
- `react-router-dom`: Merged into `react-router` in v7.
- Manual `triggersRef` cleanup pattern: Superseded by `useGSAP()` hook.

---

## Open Questions

### 1. useGSAP and the Entrance Timeline Delay

**What we know:** The Hero component has a `gsap.timeline({ delay: 0.3 })` for the entrance animation. Under StrictMode, the first mount creates the timeline (with delay), cleanup reverts it, then the second mount creates it again. The user sees the entrance animation play once (the second mount), starting after a 0.3s delay.
**What's unclear:** When navigating away and back to landing, will the entrance animation replay with the delay? This is actually desired behavior (re-entering the page should replay the entrance), but needs verification.
**Recommendation:** Test after implementation. If the delay feels wrong on re-entry, make it conditional on first visit using a ref flag.

### 2. Collections Stacking Cards Pin Behavior After Route Re-mount

**What we know:** The Collections section uses `pin: true` with `pinSpacing: false` and cross-references between cards (`endTrigger: cards[i + 1]`). This is the most complex ScrollTrigger setup in the codebase.
**What's unclear:** Whether `useGSAP` correctly handles the pin spacing calculations on re-mount. The GSAP community forum ([thread 39982](https://gsap.com/community/forums/topic/39982-scrolltrigger-breaks-when-navigating-back-usegsap-react-react-router/)) suggests calling `ScrollTrigger.refresh()` after route change may be needed.
**Recommendation:** After migrating Collections to `useGSAP`, test navigation cycle (landing -> away -> back) and verify stacking cards work correctly. If positions are wrong, add `ScrollTrigger.refresh()` inside the `useGSAP` callback after all triggers are created.

### 3. Custom Cursor DOM Element Across Routes

**What we know:** `useCustomCursor` creates a DOM element (`div.custom-cursor`) and appends it to `document.body`. On unmount, it removes it. This works correctly for the landing page scope.
**What's unclear:** In later phases, should the custom cursor persist across public routes (not just landing)? The current architecture scopes it to LandingPage only.
**Recommendation:** Keep it landing-only for Phase 1. Decision can be revisited in Phase 2 when other public pages are added.

---

## Implementation Checklist

This is the ordered sequence of changes for Phase 1:

1. **Install new dependencies** (`react-router`, `@gsap/react`, `lenis`) and uninstall deprecated (`@studio-freight/lenis`)
2. **Fix `vite.config.ts`** -- remove `base: './'` (change to default `/`)
3. **Fix `useLenis.ts`** -- store ticker callback reference; update import from `lenis`; add Lenis CSS class cleanup
4. **Fix `useScrollTrigger.ts`** -- either fix dependency array or delete (unused)
5. **Fix `cursor: none` accessibility** -- wrap in `@media (any-hover: hover) and (pointer: fine)` in both CSS files
6. **Centralize `gsap.registerPlugin`** -- register `ScrollTrigger` and `useGSAP` once, remove from all other files
7. **Migrate each section component** from `useEffect` to `useGSAP`:
   - Hero.tsx
   - About.tsx
   - Exhibitions.tsx
   - Collections.tsx
   - Testimonials.tsx
   - Visit.tsx
8. **Fix Rules of Hooks violations** in each section (move conditional returns after hooks)
9. **Create `pages/LandingPage.tsx`** -- move current `App.tsx` content here, add nuclear cleanup
10. **Rewrite `App.tsx`** -- thin router shell with `<Routes>` and `<Route>`
11. **Update `main.tsx`** -- wrap with `<BrowserRouter>`
12. **Create `vercel.json`** at project root with SPA rewrite rule
13. **Create `.gitignore`** at project root (node_modules, dist, .env files)
14. **Verification testing:**
    - Landing page animations work identically to pre-routing state
    - All 7 sections scroll, animate, and transition backgrounds correctly
    - Navigate to a non-existent route and back (catch-all redirect works)
    - Refresh browser on root URL (no 404)
    - Check `ScrollTrigger.getAll().length` in console (matches expected count)
    - Check browser Performance tab for memory leaks during navigation cycles

---

## Sources

### Primary (HIGH confidence)
- [React Router v7 Modes Documentation](https://reactrouter.com/start/modes) -- Declarative vs Data vs Framework mode setup
- [GSAP React Integration Guide](https://gsap.com/resources/React/) -- useGSAP hook documentation, cleanup patterns, scope parameter
- [@gsap/react GitHub Repository](https://github.com/greensock/react) -- Package details, usage examples
- [Lenis GitHub (darkroomengineering)](https://github.com/darkroomengineering/lenis) -- Current package, React integration
- [Lenis React Integration README](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md) -- ReactLenis component, GSAP ticker integration
- [Vercel SPA Rewrite Documentation](https://vercel.com/docs/frameworks/frontend/react-router) -- Vercel deployment for React Router

### Secondary (MEDIUM confidence)
- [GSAP Forum: ScrollTrigger Breaks When Navigating Back](https://gsap.com/community/forums/topic/39982-scrolltrigger-breaks-when-navigating-back-usegsap-react-react-router/) -- ScrollTrigger + React Router navigation patterns
- [GSAP Forum: ScrollTrigger Route Change](https://gsap.com/community/forums/topic/37475-gsap-scrolltrigger-doesnt-run-on-route-change-react-router-v6-route-transition-with-framer-motion/) -- ScrollTrigger.refresh() on route change
- [Lenis GitHub Issue #319](https://github.com/darkroomengineering/lenis/issues/319) -- Scroll position corruption on SPA navigation
- [Vercel Community: SPA 404 Fix](https://community.vercel.com/t/rewrite-to-index-html-ignored-for-react-vite-spa-404-on-routes/8412) -- vercel.json rewrite pattern verification
- [Vite Discussion #13390](https://github.com/vitejs/vite/discussions/13390) -- base path issues with React Router

### Tertiary (LOW confidence)
- None -- all findings verified with official documentation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified via official docs and npm
- Architecture patterns: HIGH -- patterns derived from official GSAP React docs and React Router docs
- Bug fixes: HIGH -- bugs confirmed by direct code inspection, fixes verified against official API docs
- Pitfalls: HIGH -- all pitfalls verified with official documentation and community confirmation
- Vite base path issue: HIGH -- confirmed by multiple Vite and React Router issue threads

**Research date:** 2026-02-15
**Valid until:** 2026-04-15 (60 days -- stable libraries, patterns unlikely to change)

**Total ScrollTrigger instances in codebase (estimated):**
- Hero: 1 (scroll parallax)
- About: ~12 (text reveals + gallery parallax + image reveals + stat reveals)
- Exhibitions: ~7 (header reveals + card reveals + CTA)
- Collections: ~16 (header reveals + pin triggers + dim triggers + text reveals for 4 cards)
- Testimonials: ~4 (reveal items)
- Visit: ~4 (info card reveals)
- App/LandingPage: 7 (background color transitions)
- **Total: ~51 ScrollTrigger instances** that must be properly cleaned up on unmount
