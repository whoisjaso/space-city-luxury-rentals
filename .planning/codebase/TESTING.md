# Testing Patterns

**Analysis Date:** 2026-02-15

## Test Framework

**Runner:**
- None configured. No test framework is installed or configured.
- No `jest`, `vitest`, `cypress`, `playwright`, or any other test runner in `app/package.json`
- No test config files (`jest.config.*`, `vitest.config.*`, `cypress.config.*`) exist
- No `test` script in `app/package.json` scripts

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test commands available
# package.json scripts: dev, build, lint, preview
```

## Test File Organization

**Location:**
- No test files exist anywhere in the codebase
- No `*.test.*` or `*.spec.*` files found
- No `__tests__/` directories found
- No test utility files or fixtures

**Naming:**
- Not established

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- Not established. No tests exist.

**Recommended setup if adding tests:**

Given the Vite + React + TypeScript stack, use Vitest (native Vite integration):

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `app/vite.config.ts`:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  // ...existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

Add to `app/package.json` scripts:
```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

## Mocking

**Framework:** Not established

**Recommended mocking targets based on codebase analysis:**

**GSAP animations (used in every section component):**
```typescript
// Mock GSAP for unit tests — animations are side effects
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn(),
    },
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(() => ({ kill: vi.fn() })),
    update: vi.fn(),
  },
}));
```

**Lenis smooth scroll:**
```typescript
vi.mock('@studio-freight/lenis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      raf: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});
```

**What to Mock:**
- GSAP/ScrollTrigger (DOM animation side effects)
- Lenis smooth scroll
- `window.matchMedia` (used in `app/src/hooks/use-mobile.ts` and `app/src/hooks/useCustomCursor.ts`)
- `requestAnimationFrame` (used in `app/src/hooks/useCustomCursor.ts`)

**What NOT to Mock:**
- Config objects from `app/src/config.ts` (pure data, test with real values)
- `cn()` utility from `app/src/lib/utils.ts` (pure function)
- React hooks from React itself

## Fixtures and Factories

**Test Data:**
- Not established
- Config data in `app/src/config.ts` can serve as test fixtures since all content is centralized there
- Example fixture approach:

```typescript
// src/test/fixtures/config.ts
import type { HeroConfig } from '@/config';

export const mockHeroConfig: HeroConfig = {
  brandLeft: 'TEST',
  brandRight: 'BRAND',
  tagline: 'Test Tagline',
  badge: 'Test Badge',
  since: 'Est. 2024',
  email: 'test@example.com',
  heroImage: '/test-image.png',
  heroImageAlt: 'Test image',
  scrollText: 'Scroll',
  copyrightText: '2024 Test',
  navLinks: [],
  socialLinks: [],
};
```

**Location:**
- No fixtures directory exists. Recommended: `app/src/test/fixtures/`

## Coverage

**Requirements:** None enforced. No coverage configuration or thresholds.

**View Coverage:**
```bash
# Not configured. Would need vitest with @vitest/coverage-v8 or @vitest/coverage-istanbul
```

## Test Types

**Unit Tests:**
- Not implemented
- Candidates for unit testing:
  - `app/src/lib/utils.ts` — `cn()` function (pure utility)
  - `app/src/config.ts` — Interface conformance of config objects
  - `app/src/hooks/use-mobile.ts` — `useIsMobile()` hook
  - `app/src/hooks/useScrollTrigger.ts` — `useScrollTrigger()` and `useParallax()` hooks

**Integration Tests:**
- Not implemented
- Candidates:
  - Section components render correctly given config data
  - App component mounts all sections in order

**E2E Tests:**
- Not implemented
- No Cypress or Playwright installed
- Candidates if added:
  - Scroll-triggered animations fire correctly
  - Navigation links scroll to correct sections
  - Custom cursor behavior on hover targets (`data-cursor="hover"`)
  - Responsive layout at `md` and `lg` breakpoints

## Recommended Test File Placement

**Co-located pattern (recommended for this codebase):**
```
app/src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
├── hooks/
│   ├── useLenis.ts
│   ├── useLenis.test.ts
│   ├── useCustomCursor.ts
│   └── useCustomCursor.test.ts
├── sections/
│   ├── Hero.tsx
│   ├── Hero.test.tsx
│   └── ...
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx
└── test/
    ├── setup.ts          # Global test setup
    └── fixtures/
        └── config.ts     # Shared test data
```

## Common Patterns (Recommended)

**Async Testing:**
```typescript
// For hooks with useEffect (most of this codebase)
import { renderHook, waitFor } from '@testing-library/react';

test('useIsMobile returns false on desktop', async () => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  const { result } = renderHook(() => useIsMobile());
  await waitFor(() => {
    expect(result.current).toBe(false);
  });
});
```

**Component Rendering:**
```typescript
import { render, screen } from '@testing-library/react';

test('Hero renders brand text from config', () => {
  render(<Hero />);
  expect(screen.getByText('SPACE')).toBeInTheDocument();
  expect(screen.getByText('CITY')).toBeInTheDocument();
});
```

**Utility Testing:**
```typescript
import { cn } from '@/lib/utils';

test('cn merges tailwind classes correctly', () => {
  expect(cn('px-2 py-1', 'px-4')).toBe('px-4 py-1');
});

test('cn handles conditional classes', () => {
  expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
});
```

## Key Testability Observations

**Strengths:**
- All content data centralized in `app/src/config.ts` with typed interfaces makes it easy to provide test fixtures
- UI components accept `className` and spread props, making them composable and testable
- Hooks return simple values (refs, booleans), not complex objects

**Challenges:**
- Section components tightly couple GSAP animations with rendering — tests must mock GSAP extensively
- Direct DOM manipulation in `app/src/hooks/useCustomCursor.ts` (`document.createElement`, `document.body.appendChild`) requires JSDOM
- `gsap.registerPlugin(ScrollTrigger)` called at module level in every section file — must be mocked before import
- `dangerouslySetInnerHTML` used in `app/src/sections/Visit.tsx` and `app/src/sections/Footer.tsx` — snapshot tests recommended to catch XSS regressions

---

*Testing analysis: 2026-02-15*
