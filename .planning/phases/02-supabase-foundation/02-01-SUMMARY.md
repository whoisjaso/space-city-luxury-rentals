---
phase: 02-supabase-foundation
plan: 01
subsystem: data-layer
tags: [supabase, tanstack-query, auth, typescript, providers]
completed: 2026-02-15
duration: ~2 min

dependency-graph:
  requires: [01-03]
  provides: [supabase-client, database-types, auth-provider, query-provider]
  affects: [02-02, 03-01, 04-01, 06-01, 07-01]

tech-stack:
  added:
    - "@supabase/supabase-js@^2.95.3"
    - "@tanstack/react-query@^5.90.21"
  patterns:
    - "Typed Supabase client via Database generic"
    - "React Context for auth state"
    - "QueryClient singleton with sensible defaults"

key-files:
  created:
    - app/src/lib/supabase.ts
    - app/src/types/database.ts
    - app/src/providers/AuthProvider.tsx
    - app/src/providers/QueryProvider.tsx
    - app/.env.example
  modified:
    - app/package.json
    - app/package-lock.json
    - app/src/App.tsx

decisions:
  - id: env-var-validation
    choice: "Runtime throw if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing"
    rationale: "Fail fast with clear error message rather than cryptic network errors"
  - id: query-defaults
    choice: "staleTime 5min, gcTime 10min, retry 1, refetchOnWindowFocus false"
    rationale: "MVP-appropriate: avoid unnecessary refetches, single retry, quiet dev experience"
  - id: provider-order
    choice: "QueryProvider outside AuthProvider"
    rationale: "Auth doesn't depend on React Query; Query might be used by auth-adjacent hooks later"
---

# Phase 2 Plan 1: Supabase Client & Provider Infrastructure Summary

**One-liner:** Typed Supabase client, Vehicle/Booking database types, AuthProvider with session hydration, and QueryProvider with sensible defaults -- all wired into App.tsx.

## What Was Done

### Task 1: Install dependencies and create Supabase client with types

Installed `@supabase/supabase-js` and `@tanstack/react-query` as production dependencies. Created the full client-side infrastructure for Supabase communication:

**Supabase Client (`lib/supabase.ts`):**
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`
- Validates presence of both variables at startup (throws with clear instructions if missing)
- Creates a typed `createClient<Database>()` singleton

**Database Types (`types/database.ts`):**
- `Vehicle` interface with all 12 fields (id, slug, name, headline, description, daily_price_cents, images, experience_tags, rental_count, is_active, created_at, updated_at)
- `Booking` interface with all 13 fields including `BookingStatus` union type ('pending' | 'approved' | 'declined')
- `VehicleInsert` / `BookingInsert` types (omit auto-generated fields)
- `VehicleUpdate` / `BookingUpdate` types (partial versions)
- `Database` interface for Supabase generics with Tables map

**AuthProvider (`providers/AuthProvider.tsx`):**
- React Context exposing: `user`, `session`, `loading`, `signIn(email, password)`, `signOut()`
- Hydrates existing session on mount via `supabase.auth.getSession()`
- Subscribes to `onAuthStateChange` for login/logout/token refresh events
- `useAuth()` hook with context validation (throws if used outside provider)
- `signIn` and `signOut` wrapped in `useCallback` for referential stability

**QueryProvider (`providers/QueryProvider.tsx`):**
- QueryClient singleton with: staleTime 5min, gcTime 10min, retry 1, refetchOnWindowFocus disabled
- Simple wrapper component exporting `QueryProvider`

**App.tsx Integration:**
- Routes wrapped with `<QueryProvider>` (outer) and `<AuthProvider>` (inner)
- Existing Route structure preserved

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Env var validation | Runtime throw on missing vars | Fail fast with actionable error message |
| QueryClient defaults | 5min stale, 1 retry, no window refocus | MVP-appropriate, quiet dev experience |
| Provider nesting order | QueryProvider > AuthProvider > Routes | Auth doesn't need Query; Query may serve auth-adjacent hooks |
| Type strategy | Manual types mirroring schema | Replace with `supabase gen types` once project connected |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] `@supabase/supabase-js` and `@tanstack/react-query` in package.json
- [x] `lib/supabase.ts` creates typed client from env vars
- [x] `.env.example` documents required variables
- [x] `types/database.ts` exports Vehicle, Booking, Database types
- [x] `AuthProvider` provides full auth context
- [x] `QueryProvider` wraps with QueryClientProvider
- [x] `App.tsx` wraps routes with both providers
- [x] TypeScript compiles with zero errors (`tsc --noEmit`)
- [x] Vite production build succeeds

## Commits

| Hash | Message |
|------|---------|
| 2b32d52 | feat(02-01): supabase client, types, auth and query providers |

## Next Phase Readiness

All client-side infrastructure is in place. Plan 02-02 can now:
- Use `supabase` client to create database schema (SQL migrations)
- Use the `Vehicle` and `Booking` types for seed data
- Use `useAuth()` in admin routes for protected access
- Use `QueryProvider` for data fetching hooks
