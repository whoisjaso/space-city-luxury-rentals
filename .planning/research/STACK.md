# Technology Stack

**Project:** Space City Luxury Rentals
**Researched:** 2026-02-15
**Overall Confidence:** HIGH

---

## Existing Stack (Preserve As-Is)

These are already installed and working. Do NOT upgrade, replace, or reconfigure.

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | ^19.2.0 | UI framework | Active, all components |
| React DOM | ^19.2.0 | DOM rendering via createRoot | Active |
| Vite | ^7.2.4 | Build tool and dev server | Active |
| @vitejs/plugin-react | ^5.1.1 | React Fast Refresh, JSX | Active |
| TypeScript | ~5.9.3 | Type safety | Active |
| GSAP | ^3.14.2 | Scroll animations, parallax, entrance effects | Active, all sections |
| @studio-freight/lenis | ^1.0.42 | Smooth scroll | Active |
| Tailwind CSS | ^3.4.19 | Utility-first styling | Active |
| tailwindcss-animate | ^1.0.7 | Animation plugin | Active |
| shadcn/ui (new-york) | N/A (component library) | Pre-built UI components | 50+ components installed |
| Radix UI | Various ^1.x | Headless primitives | 18 packages installed |
| lucide-react | ^0.562.0 | Icons | Active |
| class-variance-authority | ^0.7.1 | Component variants | Active (shadcn) |
| clsx | ^2.1.1 | Conditional classes | Active (shadcn) |
| tailwind-merge | ^3.4.0 | Class deduplication | Active (shadcn) |
| PostCSS | ^8.5.6 | CSS processing | Active |
| Autoprefixer | ^10.4.23 | CSS vendor prefixes | Active |
| ESLint | ^9.39.1 | Linting (flat config) | Active |

## Existing Stack (Installed, Ready to Activate)

These are installed but currently unused. Activate them -- do NOT reinstall different versions.

| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| react-hook-form | ^7.70.0 | Form state management | Use for booking form and admin forms |
| @hookform/resolvers | ^5.2.2 | Zod resolver for react-hook-form | Bridges zod schemas to form validation |
| zod | ^4.3.5 | Schema validation | Use for all form schemas AND API response validation |
| react-day-picker | ^9.13.0 | Date picker component | Use for booking date selection |
| date-fns | ^4.1.0 | Date utilities | Use for date formatting, comparison |
| sonner | ^2.0.7 | Toast notifications | Use for booking confirmations, admin actions, errors |
| recharts | ^2.15.4 | Charts | Use in admin dashboard for booking stats |
| embla-carousel-react | ^8.6.0 | Carousel | Use for vehicle image galleries |
| cmdk | ^1.1.1 | Command palette | Use for admin quick actions |
| input-otp | ^1.4.2 | OTP input | Use for booking lookup by confirmation code |
| react-resizable-panels | ^4.2.2 | Resizable panels | Use for admin layout |
| vaul | ^1.1.2 | Drawer component | Use for mobile booking flow |
| next-themes | ^0.4.6 | Theme switching | Low priority -- admin dark/light toggle |

---

## New Dependencies to Add

### Core: Supabase Client

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| @supabase/supabase-js | ^2.95.x | Database, auth, storage, realtime | HIGH |

**Why @supabase/supabase-js and NOT @supabase/ssr:** This is a pure client-side SPA with no server-side rendering. The `@supabase/ssr` package is specifically for SSR frameworks (Next.js, Remix, SvelteKit) where you need separate server/browser clients with cookie-based session management. For a Vite SPA, `@supabase/supabase-js` with `createClient` is the correct and simpler choice. ([Source: Supabase GitHub Discussion #28997](https://github.com/orgs/supabase/discussions/28997))

**Confidence:** HIGH -- verified via official Supabase React quickstart docs and community discussions.

### Core: Routing

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| react-router | ^7.13.x | Client-side routing | HIGH |

**Why react-router v7 in Data Mode:** React Router v7 has three modes: Declarative, Data, and Framework. For this project:

- **Framework Mode** is wrong -- it requires a Vite plugin, file-based routing, and restructuring the entire app. This is for new projects built from scratch with React Router as the framework.
- **Declarative Mode** (BrowserRouter) is insufficient -- it provides only basic routing without data loading primitives.
- **Data Mode** (createBrowserRouter + RouterProvider) is correct -- it provides loaders, actions, error boundaries, and pending states without requiring a framework restructure. It integrates cleanly into an existing Vite app by replacing the root render with `RouterProvider`.

**How it integrates with the existing app:**
```tsx
// main.tsx - replace current render
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,    // Current App.tsx content
    ErrorBoundary: RootError,
  },
  {
    path: "/fleet",
    Component: FleetPage,
    loader: fleetLoader,        // Supabase query
  },
  {
    path: "/fleet/:slug",
    Component: VehiclePage,
    loader: vehicleLoader,
  },
  {
    path: "/book/:vehicleId",
    Component: BookingPage,
  },
  {
    path: "/booking/status",
    Component: BookingStatusPage,
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    loader: adminAuthLoader,    // Check session, redirect if not authed
    children: [
      { index: true, Component: AdminDashboard },
      { path: "vehicles", Component: AdminVehicles },
      { path: "vehicles/new", Component: AdminVehicleForm },
      { path: "vehicles/:id/edit", Component: AdminVehicleForm },
      { path: "bookings", Component: AdminBookings },
      { path: "bookings/:id", Component: AdminBookingDetail },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

**Why NOT install react-router-dom:** In v7, the `react-router` package contains everything. The `react-router-dom` package is no longer needed. ([Source: React Router v7 upgrade guide](https://reactrouter.com/upgrading/v6))

**Confidence:** HIGH -- verified via official React Router v7 docs (reactrouter.com/start/modes).

### Core: Server State Management

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| @tanstack/react-query | ^5.90.x | Server state, caching, background refetch | HIGH |

**Why TanStack Query alongside React Router loaders:** React Router loaders handle initial data loading for route transitions, but TanStack Query provides:
- Automatic cache invalidation after mutations (e.g., admin approves booking, list updates)
- Background refetching (admin dashboard stays fresh)
- Optimistic updates (instant UI feedback on admin actions)
- Stale-while-revalidate patterns (vehicle catalog loads instantly on revisit)
- Shared query cache across components (multiple components reading same vehicle data)

**Pattern: Use both together.** Route loaders can prime the TanStack Query cache on navigation, while components use `useQuery` for reactive data that updates after mutations.

```tsx
// Pattern: Route loader primes the cache
import { queryClient } from "@/lib/query-client";

export async function fleetLoader() {
  return queryClient.ensureQueryData({
    queryKey: ["vehicles", "active"],
    queryFn: () => supabase.from("vehicles").select("*").eq("status", "active"),
  });
}

// Pattern: Component uses the cached data reactively
function FleetPage() {
  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "active"],
    queryFn: () => supabase.from("vehicles").select("*").eq("status", "active"),
  });
  // ...
}
```

**Why NOT supabase-cache-helpers:** The `@supabase-cache-helpers/postgrest-react-query` library auto-generates cache keys from Supabase queries. While convenient, it adds a layer of magic that obscures cache behavior and makes debugging harder. For a project this size (2 tables, ~10 queries total), writing explicit query keys is clearer and more maintainable.

**Confidence:** HIGH -- TanStack Query v5 is the standard React server-state library. Verified via official docs.

### Dev Tooling: Supabase CLI

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| supabase (CLI) | latest | Local dev, migrations, type generation | HIGH |

**Install globally or via npx:**
```bash
npm install -D supabase
```

**Why the CLI is essential:**
1. `supabase gen types --lang=typescript` -- generates TypeScript types from your database schema, giving you end-to-end type safety from Supabase queries through to React components
2. `supabase db diff` -- captures schema changes as migration files
3. `supabase start` (optional) -- runs a local Supabase stack via Docker for offline development

**Type generation workflow:**
```bash
npx supabase gen types --lang=typescript --project-id "YOUR_PROJECT_REF" > src/lib/database.types.ts
```

Then use with the client:
```tsx
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Confidence:** HIGH -- verified via official Supabase CLI docs.

### Dev Tooling: React Query DevTools

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| @tanstack/react-query-devtools | ^5.90.x | Query cache inspector (dev only) | HIGH |

**Why:** Invaluable for debugging cache state, seeing which queries are stale/fresh/fetching. Only included in dev builds (tree-shaken in production).

**Confidence:** HIGH -- standard companion to TanStack Query.

---

## Supabase Integration Architecture

### Client Setup

Create a single Supabase client instance in `src/lib/supabase.ts`:

```tsx
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Environment variables (Vite requires `VITE_` prefix):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

**Important:** The anon key is safe to expose in client-side code. It is NOT a secret. Security comes from RLS policies, not from hiding the key. The anon key simply identifies your project and grants the `anon` role.

### Auth Pattern (Single Admin)

Joey is the only admin user. Use Supabase Auth with email/password:

```tsx
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "joey@spacecityrentals.com",
  password: "...",
});

// Check session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Update app state
});

// Logout
await supabase.auth.signOut();
```

**Auth context pattern for React:**
```tsx
// src/lib/auth-context.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const AuthContext = createContext<{ session: Session | null; loading: boolean }>({
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Route protection using React Router loader:**
```tsx
// Redirect unauthenticated users away from /admin
export async function adminAuthLoader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw redirect("/admin/login");
  }
  return { session };
}
```

**Single admin enforcement via RLS (not application code):**
```sql
-- Create an admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'joey@spacecityrentals.com'
  );
$$;
```

### Database Schema Pattern

Use Supabase's PostgreSQL with these tables:

```sql
-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,                    -- "Lamborghini Urus"
  tagline TEXT,                          -- "Move in Silence."
  category TEXT NOT NULL,                -- "exotic", "luxury", "muscle"
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT,
  daily_rate INTEGER NOT NULL,           -- in cents, e.g., 75000 = $750
  weekend_rate INTEGER,                  -- optional weekend pricing
  description TEXT,
  features TEXT[],                       -- PostgreSQL array: ["Heated Seats", "Carbon Fiber"]
  experience_tags TEXT[],                -- ["Date Night", "Content Ready", "Boss Move"]
  identity_headline TEXT,                -- "Let the Car Do the Talking"
  status TEXT NOT NULL DEFAULT 'active', -- "active", "maintenance", "retired"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicle images (separate table for multiple images per vehicle)
CREATE TABLE public.vehicle_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,            -- path in Supabase Storage
  alt_text TEXT,
  is_hero BOOLEAN DEFAULT false,         -- hero image for catalog card
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confirmation_code TEXT UNIQUE NOT NULL, -- 8-char uppercase, e.g., "SCRL-A7B3"
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  occasion TEXT,                          -- "Wedding", "Birthday", "Content Shoot"
  notes TEXT,                             -- customer notes
  status TEXT NOT NULL DEFAULT 'pending', -- "pending", "approved", "declined"
  admin_notes TEXT,                       -- Joey's response notes
  total_amount INTEGER,                  -- in cents, calculated
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Why prices in cents (integers):** Floating point math causes rounding errors with currency. Store `75000` (cents) and format as `$750.00` in the UI. This is the universal standard for handling money in databases.

### Row Level Security (RLS) Policies

RLS is the security backbone. Without it, anyone with the anon key can read/write everything.

```sql
-- Enable RLS on all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- VEHICLES: Everyone can read active vehicles, only admin can write
CREATE POLICY "Anyone can view active vehicles"
  ON public.vehicles FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admin can view all vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can insert vehicles"
  ON public.vehicles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update vehicles"
  ON public.vehicles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can delete vehicles"
  ON public.vehicles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- VEHICLE IMAGES: Same pattern as vehicles
CREATE POLICY "Anyone can view images of active vehicles"
  ON public.vehicle_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = vehicle_images.vehicle_id
      AND vehicles.status = 'active'
    )
  );

CREATE POLICY "Admin can manage images"
  ON public.vehicle_images FOR ALL
  TO authenticated
  USING (public.is_admin());

-- BOOKINGS: Guests can insert, guests can read own by confirmation code, admin can do everything
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view booking by confirmation code"
  ON public.bookings FOR SELECT
  TO anon, authenticated
  USING (true);  -- Filter by confirmation_code in application queries

CREATE POLICY "Admin can manage all bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin());
```

**Note on booking SELECT policy:** Since guests look up bookings by confirmation code (not by user ID -- there are no user accounts), the RLS policy allows SELECT for anyone, but application code always filters by `confirmation_code`. The confirmation code acts as a "knowledge-based access token." This is a deliberate tradeoff: simplicity over strict row-level isolation, appropriate because booking data is not highly sensitive (no payment info, no SSN).

### Storage Buckets

```sql
-- Create a public bucket for vehicle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

-- RLS: Anyone can view (public bucket handles this)
-- RLS: Only admin can upload/update/delete
CREATE POLICY "Admin can upload vehicle images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND public.is_admin()
  );

CREATE POLICY "Admin can update vehicle images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND public.is_admin()
  );

CREATE POLICY "Admin can delete vehicle images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND public.is_admin()
  );
```

**Image upload pattern:**
```tsx
const file = event.target.files[0];
const fileExt = file.name.split(".").pop();
const filePath = `${vehicleId}/${Date.now()}.${fileExt}`;

const { data, error } = await supabase.storage
  .from("vehicle-images")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from("vehicle-images")
  .getPublicUrl(filePath);
```

**Image transformations (Pro plan only):** Supabase offers on-the-fly image resizing via URL parameters (`?width=400&height=300&quality=80`). On the free tier, resize images client-side before upload or use a fixed set of pre-sized images. For MVP on free tier, upload already-optimized images.

### Vercel Deployment

**Configuration (vercel.json):**
```json
{
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Why rewrites are critical:** This is a client-side SPA with React Router. Without the rewrite rule, visiting `/fleet/lamborghini-urus` directly would return a 404 because no file exists at that path. The rewrite sends all requests to `index.html`, where React Router handles the path.

**Environment variables in Vercel:**
- `VITE_SUPABASE_URL` -- add in Vercel project settings
- `VITE_SUPABASE_ANON_KEY` -- add in Vercel project settings
- These are build-time variables (Vite inlines them during build), NOT runtime secrets

**Supabase + Vercel integration:** Install the Supabase integration from the Vercel Marketplace to auto-sync environment variables. This also supports preview branch database branching on Pro plans.

---

## What NOT to Use (and Why)

| Technology | Why NOT |
|------------|---------|
| @supabase/ssr | For SSR frameworks only. This is a pure client-side SPA. Adds unnecessary complexity with cookie-based session management that isn't needed. |
| react-router-dom | Deprecated in v7. Everything is in `react-router` now. |
| React Router Framework Mode | Requires restructuring the entire app with a Vite plugin, file-based routing, and `routes.ts`. Overkill and disruptive for adding routing to an existing app. |
| Next.js / Remix | The frontend already exists as a Vite SPA. Migrating to a meta-framework would mean rewriting everything. No SSR is needed for this use case. |
| Prisma / Drizzle | ORM is unnecessary. Supabase's PostgREST API + generated TypeScript types provide type-safe database access without an ORM. Adding one creates a second source of truth for the schema. |
| Redux / Zustand | No complex client-side state management needed. Auth state lives in a simple React context. Server state lives in TanStack Query. Form state lives in react-hook-form. There's nothing left for Redux to manage. |
| Axios | `fetch` is built into all modern browsers and Supabase's client uses it internally. No need for a wrapper library. |
| Firebase | Supabase is the chosen backend. Firebase is the alternative, not a complement. |
| Stripe / Payment SDK | Out of scope. MVP uses manual approval -- no payment processing. |
| @supabase-cache-helpers/* | Adds magic cache key generation. For 2 tables and ~10 queries, explicit TanStack Query keys are clearer. |
| Tailwind CSS v4 | The existing project uses v3.4.19 with a working config. Upgrading to v4 is a non-trivial migration (new config format, breaking changes) with zero benefit for this project. |

---

## Installation Commands

```bash
# Navigate to app directory
cd app

# New production dependencies
npm install @supabase/supabase-js@^2 react-router@^7 @tanstack/react-query@^5

# New dev dependencies
npm install -D supabase @tanstack/react-query-devtools@^5
```

**That's it. Three production packages.** Everything else is already installed.

---

## Package.json Scripts to Add

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "db:types": "npx supabase gen types --lang=typescript --project-id \"$PROJECT_REF\" > src/lib/database.types.ts"
  }
}
```

---

## Environment Files

```bash
# .env.local (git-ignored, local development)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# .env.example (committed, documents required vars)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## File Structure (New Files)

```
app/src/
  lib/
    supabase.ts          # Supabase client instance
    database.types.ts    # Auto-generated from CLI
    query-client.ts      # TanStack Query client instance
    auth-context.tsx     # Auth provider + useAuth hook
    utils.ts             # Already exists (shadcn cn utility)
  hooks/
    useVehicles.ts       # TanStack Query hooks for vehicle data
    useBookings.ts       # TanStack Query hooks for booking data
    useAuth.ts           # Re-export from auth-context for convenience
  pages/
    Landing.tsx          # Current App.tsx content, extracted
    Fleet.tsx            # Vehicle catalog
    Vehicle.tsx          # Individual vehicle page
    Booking.tsx          # Booking form
    BookingStatus.tsx    # Booking status lookup
    admin/
      Login.tsx          # Admin login
      Dashboard.tsx      # Admin overview
      Vehicles.tsx       # Vehicle management list
      VehicleForm.tsx    # Add/edit vehicle form
      Bookings.tsx       # Booking management list
      BookingDetail.tsx  # Individual booking detail
  layouts/
    AdminLayout.tsx      # Admin shell with sidebar
```

---

## Supabase Free Tier Limits (Relevant to This Project)

| Resource | Free Tier Limit | This Project's Expected Usage |
|----------|-----------------|-------------------------------|
| Database storage | 500 MB | Well under (text data + references) |
| File storage | 1 GB | Monitor -- vehicle images add up. Optimize before upload. |
| Storage egress | 2 GB/month | Monitor -- high-res images served to visitors |
| Auth users | 50,000 MAU | 1 user (Joey). No concern. |
| Database egress | 2 GB/month | Low -- small queries, no heavy joins |
| API requests | Unlimited | No concern |
| Image transformations | NOT included | Use pre-optimized images |
| **Auto-pause** | **7 days inactivity** | **CRITICAL: Upgrade to Pro ($25/mo) before going live** |

**The auto-pause is the most important limit.** On the free tier, if no API requests hit the project for 7 days, it pauses and goes offline. For a production business site, this is unacceptable. Budget $25/month for Supabase Pro when going live.

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Supabase client setup | HIGH | Verified via official React quickstart docs |
| React Router v7 Data Mode | HIGH | Verified via official mode docs (reactrouter.com/start/modes) |
| TanStack Query v5 | HIGH | Verified via official docs and npm |
| RLS patterns | MEDIUM | Patterns verified via official docs; specific policy SQL needs testing against actual schema |
| Storage bucket config | MEDIUM | Patterns verified; image transformation limits on free tier need monitoring |
| Vercel deployment | MEDIUM | Standard SPA deployment; rewrite rules verified pattern but not tested with this specific project |
| Zod v4 compatibility | HIGH | Already installed (^4.3.5), works with @hookform/resolvers ^5.2.2 |
| Database schema | MEDIUM | Schema design follows standard patterns; exact column needs will emerge during implementation |

---

## Sources

- [Supabase React Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase React Getting Started](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart)
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Supabase TypeScript Type Generation](https://supabase.com/docs/guides/api/rest/generating-types)
- [Supabase Local Development CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Pricing](https://supabase.com/pricing)
- [@supabase/supabase-js vs @supabase/ssr Discussion](https://github.com/orgs/supabase/discussions/28997)
- [React Router v7 Modes](https://reactrouter.com/start/modes)
- [React Router v7 SPA How-To](https://reactrouter.com/how-to/spa)
- [React Router v7 Upgrade Guide](https://reactrouter.com/upgrading/v6)
- [React Router v7 Changelog](https://reactrouter.com/changelog)
- [TanStack Query v5 Overview](https://tanstack.com/query/v5/docs/framework/react/overview)
- [Supabase + TanStack Query Integration Guide (MakerKit)](https://makerkit.dev/blog/saas/supabase-react-query)
- [Vercel + Supabase Integration](https://supabase.com/partners/integrations/vercel)
- [Zod v4 Release (InfoQ)](https://www.infoq.com/news/2025/08/zod-v4-available/)
- [sonner (npm)](https://www.npmjs.com/package/sonner)

---

*Stack research completed: 2026-02-15*
