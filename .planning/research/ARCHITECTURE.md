# Architecture Patterns

**Domain:** Luxury car rental platform (React SPA + Supabase backend)
**Researched:** 2026-02-15
**Overall Confidence:** HIGH

## Recommended Architecture

### High-Level Overview

```
+-----------------------------------------------------+
|                    Vercel (CDN)                       |
|  Static SPA served from edge                         |
+-----------------------------------------------------+
         |                           |
    Public Routes               Admin Routes
    (no auth needed)            (Supabase auth)
         |                           |
+-----------------------------------------------------+
|              React 19 SPA (Vite 7)                   |
|                                                       |
|  React Router v7 (declarative routing)               |
|  TanStack Query v5 (server state/caching)            |
|  Supabase JS Client (auth + data + storage)          |
|  GSAP + ScrollTrigger (landing page only)            |
|  Lenis smooth scroll (landing page only)             |
+-----------------------------------------------------+
         |                           |
+-----------------------------------------------------+
|                  Supabase                             |
|                                                       |
|  Auth (email/password, single admin user)            |
|  PostgreSQL (vehicles, bookings, admin_users)        |
|  Storage (vehicle-images bucket)                     |
|  Row Level Security (public read, admin write)       |
|  PostgREST API (auto-generated REST from tables)     |
+-----------------------------------------------------+
```

### Architecture Rationale

This architecture keeps the existing SPA pattern while adding routing and a backend. The key insight is that this is NOT a traditional full-stack app -- it is a marketing-first site with an admin panel bolted on. The landing page with its cinematic GSAP animations is the core product experience. The vehicle catalog, booking flow, and admin panel are functional additions that should not compromise that experience.

**Why stay SPA (not SSR/SSG):** The existing GSAP ScrollTrigger animations with Lenis smooth scroll are deeply coupled to client-side rendering. These animations initialize on mount, manipulate DOM directly, and rely on scroll position calculations. Moving to SSR (Next.js, Remix) would require rewriting every animation with hydration-safe patterns. The site's content (vehicle data) changes infrequently and is small enough that client-side fetching with TanStack Query caching is performant. SEO for vehicle pages can be addressed later with pre-rendering if needed.

**Why React Router v7 (not TanStack Router):** React Router v7 is the established standard, works with React 19, and has extensive community solutions for GSAP integration issues. The app needs simple declarative routing, not the type-safe file-based routing TanStack Router offers. React Router v7 also provides the `ScrollRestoration` component needed for managing scroll position across routes.

**Why TanStack Query (not raw Supabase calls):** Supabase's JS client returns promises, but provides no caching, background refetching, or optimistic updates. For a catalog page that multiple users hit simultaneously, and an admin dashboard that needs real-time-ish data, TanStack Query provides the caching and mutation patterns needed without writing custom state management. The alternative -- putting Supabase data into React state with useState/useEffect -- leads to loading state bugs, stale data, and duplicate requests.

## Component Boundaries

### Route Structure

```
/                        Landing page (existing sections, GSAP animations)
/fleet                   Vehicle catalog (grid/list of all available vehicles)
/fleet/:slug             Vehicle detail page (single vehicle, booking CTA)
/book/:vehicleId         Booking request form (date selection, customer info)
/booking/status           Booking status check (enter confirmation code)
/admin/login             Admin login (email/password)
/admin                   Admin dashboard (redirect to /admin/vehicles)
/admin/vehicles          Vehicle management (CRUD table)
/admin/vehicles/new      Add new vehicle form
/admin/vehicles/:id/edit Edit vehicle form
/admin/bookings          Booking management (list, approve/decline)
/admin/bookings/:id      Booking detail (full info, status actions)
```

### Component Hierarchy

```
main.tsx
  |
  BrowserRouter (React Router v7)
    |
    QueryClientProvider (TanStack Query)
      |
      AuthProvider (Supabase session context)
        |
        Routes
          |
          +-- Layout: PublicLayout
          |     |-- Header (navigation, conditional per page)
          |     |-- Outlet (page content)
          |     |-- Footer (conditional per page)
          |
          +-- Route "/" -> LandingPage
          |     |-- (existing App.tsx content moved here)
          |     |-- useLenis() (scoped to landing page ONLY)
          |     |-- useCustomCursor()
          |     |-- Hero, About, Exhibitions, Collections,
          |         Testimonials, Visit, Footer sections
          |
          +-- Route "/fleet" -> FleetPage
          |     |-- VehicleGrid
          |     |     |-- VehicleCard (repeated)
          |     |-- FilterBar (category, price range, availability)
          |
          +-- Route "/fleet/:slug" -> VehicleDetailPage
          |     |-- VehicleHero (full-width image)
          |     |-- VehiclePricing
          |     |-- VehicleSpecs
          |     |-- BookingCTA -> navigates to /book/:vehicleId
          |
          +-- Route "/book/:vehicleId" -> BookingPage
          |     |-- BookingForm (react-hook-form + zod)
          |     |     |-- DateRangePicker
          |     |     |-- CustomerInfoFields
          |     |     |-- BookingSummary
          |     |-- BookingConfirmation (shown after submit)
          |
          +-- Route "/booking/status" -> BookingStatusPage
          |     |-- StatusLookupForm
          |     |-- BookingStatusDisplay
          |
          +-- Layout: AdminLayout (protected)
          |     |-- AdminSidebar
          |     |-- AdminHeader
          |     |-- Outlet
          |
          +-- Route "/admin/login" -> AdminLoginPage
          |     |-- LoginForm (email/password)
          |
          +-- Route "/admin/vehicles" -> AdminVehiclesPage
          |     |-- VehicleTable (shadcn Table)
          |     |-- AddVehicleButton -> /admin/vehicles/new
          |
          +-- Route "/admin/vehicles/new" -> AdminVehicleFormPage
          +-- Route "/admin/vehicles/:id/edit" -> AdminVehicleFormPage
          |     |-- VehicleForm (react-hook-form + zod)
          |     |     |-- ImageUploader (Supabase Storage)
          |     |     |-- PricingFields
          |     |     |-- SpecFields
          |
          +-- Route "/admin/bookings" -> AdminBookingsPage
          |     |-- BookingTable (shadcn Table)
          |     |-- StatusFilter (pending/approved/declined)
          |
          +-- Route "/admin/bookings/:id" -> AdminBookingDetailPage
                |-- BookingInfo
                |-- StatusActions (approve/decline with notes)
```

### Component Communication Rules

| Component | Talks To | Via | Never Talks To |
|-----------|----------|-----|----------------|
| LandingPage | Config (config.ts) | Direct import | Supabase (static content) |
| FleetPage | Supabase (vehicles) | TanStack Query + Supabase client | Direct DOM (no GSAP) |
| VehicleDetailPage | Supabase (single vehicle) | TanStack Query | Other pages directly |
| BookingPage | Supabase (insert booking) | TanStack Query mutation | Admin components |
| BookingStatusPage | Supabase (query booking) | TanStack Query | Auth system |
| AdminVehiclesPage | Supabase (vehicles CRUD) | TanStack Query mutations | Public page components |
| AdminBookingsPage | Supabase (bookings CRUD) | TanStack Query mutations | Public page components |
| AuthProvider | Supabase Auth | onAuthStateChange listener | Page components directly |
| ProtectedRoute | AuthProvider | useAuth() context hook | Supabase directly |

## Data Flow

### Public Data Flow (Vehicles)

```
1. User navigates to /fleet
2. FleetPage mounts
3. TanStack Query fires useVehicles() hook
4. Hook calls supabase.from('vehicles').select('*').eq('is_active', true)
5. Supabase PostgREST returns rows (RLS allows public SELECT)
6. TanStack Query caches result (staleTime: 60s)
7. VehicleGrid renders VehicleCard components
8. On subsequent visits, cache serves instantly, background refetch updates
```

### Booking Submission Flow

```
1. User fills BookingForm on /book/:vehicleId
2. react-hook-form validates with zod schema
3. On submit, TanStack Query mutation fires
4. Mutation calls supabase.from('bookings').insert({...})
5. Supabase RLS allows public INSERT (anon role)
6. Supabase returns created row with generated confirmation_code
7. Mutation onSuccess: navigate to confirmation view
8. Confirmation displays code + "check status at /booking/status"
```

### Booking Status Check Flow

```
1. User enters confirmation_code + email on /booking/status
2. Query calls supabase.from('bookings')
     .select('*')
     .eq('confirmation_code', code)
     .eq('customer_email', email)
     .single()
3. RLS policy: public can SELECT own bookings (matched by email + code)
4. Display status (pending/approved/declined) + any admin notes
```

### Admin Data Flow

```
1. Joey navigates to /admin/login
2. Submits email + password
3. supabase.auth.signInWithPassword({ email, password })
4. AuthProvider captures session via onAuthStateChange
5. ProtectedRoute checks useAuth().session, allows access
6. Admin page mounts, TanStack Query hooks fire
7. Queries include auth token automatically (Supabase client handles this)
8. RLS policies check auth.uid() against admin_users table
9. Full CRUD operations available through mutations
```

### Image Upload Flow (Admin)

```
1. Admin selects images in VehicleForm ImageUploader
2. On form submit (or on image select):
   a. Generate unique filename: `vehicles/${vehicleId}/${uuid}.${ext}`
   b. supabase.storage.from('vehicle-images').upload(path, file)
   c. Get public URL: supabase.storage.from('vehicle-images').getPublicUrl(path)
3. Store public URL in vehicle record's images array
4. Public pages fetch vehicle records, images load from Supabase Storage CDN
```

## Critical Architecture Pattern: Preserving GSAP Animations

### The Problem

The existing landing page is a single component tree (`App.tsx`) with GSAP ScrollTrigger animations that:
- Register a global plugin (`gsap.registerPlugin(ScrollTrigger)`)
- Create ScrollTrigger instances tied to DOM selectors (`#hero-section`, `#about`, etc.)
- Use Lenis smooth scroll synchronized to GSAP's ticker
- Manage background color transitions based on scroll position across all 7 sections
- Pin and stack cards in the Collections section
- Run parallax effects in the About gallery

Adding React Router means this page becomes ONE route among many. The animations must:
1. Initialize only when the landing page mounts
2. Clean up completely when navigating away
3. Reinitialize correctly when navigating back
4. Not interfere with scroll behavior on other pages

### The Solution: Isolate Landing Page as a Self-Contained Route

**Step 1: Move current App.tsx content into a LandingPage component**

```typescript
// app/src/pages/LandingPage.tsx
// Contains everything currently in App.tsx
// All GSAP/Lenis initialization stays here
function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  // Lenis ONLY for landing page
  useLenis();
  useCustomCursor();

  // All existing useEffect hooks for ScrollTrigger...

  return (
    <div ref={mainRef} className="relative">
      <Hero />
      <About />
      <Exhibitions />
      <Collections />
      <Testimonials />
      <Visit />
      <Footer />
    </div>
  );
}
```

**Step 2: New App.tsx becomes the router shell**

```typescript
// app/src/App.tsx (new)
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Landing page: full GSAP experience, no shared layout */}
            <Route path="/" element={<LandingPage />} />

            {/* Public pages: shared header/footer, no GSAP */}
            <Route element={<PublicLayout />}>
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/fleet/:slug" element={<VehicleDetailPage />} />
              <Route path="/book/:vehicleId" element={<BookingPage />} />
              <Route path="/booking/status" element={<BookingStatusPage />} />
            </Route>

            {/* Admin: completely separate layout */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/vehicles" />} />
                <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
                {/* ... more admin routes */}
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
```

**Step 3: Handle GSAP cleanup on route change**

The existing pattern of `triggersRef.current.forEach(t => t.kill())` in useEffect cleanup already handles this correctly. When React Router unmounts the LandingPage component, all useEffect cleanup functions run, killing all ScrollTrigger instances.

The critical addition: **call `ScrollTrigger.getAll().forEach(t => t.kill())` and `ScrollTrigger.refresh()` as a safety net in LandingPage's cleanup.** This catches any ScrollTrigger instances that might have been created outside the triggersRef tracking pattern (the background color transitions in App.tsx create triggers that each section's cleanup does not know about).

```typescript
// In LandingPage useEffect cleanup:
return () => {
  triggersRef.current.forEach(t => t.kill());
  triggersRef.current = [];
  // Nuclear cleanup: ensure no orphaned triggers persist
  ScrollTrigger.getAll().forEach(t => t.kill());
  ScrollTrigger.clearMatchMedia();
};
```

**Step 4: Scope Lenis to landing page only**

Lenis smooth scroll MUST NOT run on non-landing pages. It takes over the browser's native scroll behavior, which would conflict with form inputs, admin tables, and standard page scroll on the catalog/booking pages.

The current `useLenis` hook creates a Lenis instance on mount and destroys it on unmount. Since it is called inside `LandingPage`, it naturally scopes to that route. When the user navigates to `/fleet`, LandingPage unmounts, Lenis is destroyed, and native scroll resumes.

One additional safeguard: ensure the `html.lenis` class is removed on cleanup:

```typescript
// In useLenis cleanup:
return () => {
  lenis.destroy();
  document.documentElement.classList.remove('lenis', 'lenis-smooth');
};
```

**Step 5: Handle scroll position on route transitions**

React Router v7 provides `<ScrollRestoration />` for this. However, since Lenis takes over scroll on the landing page, coordinate:

- Landing page -> other page: Lenis destroys, native scroll takes over at position 0
- Other page -> landing page: Lenis initializes, starts at top
- Other page -> other page: Standard `window.scrollTo(0, 0)` on navigation

```typescript
// ScrollToTop component (used in PublicLayout, NOT in LandingPage)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
```

### Migration Safety Checklist

- [ ] Every GSAP `useEffect` in section components already has cleanup -- verified (all 7 sections follow triggersRef pattern)
- [ ] Background color transition triggers in App.tsx have cleanup -- verified (triggersRef pattern in App.tsx)
- [ ] Lenis hook destroys on unmount -- verified (lenis.destroy() in cleanup)
- [ ] Custom cursor hook removes DOM element on unmount -- verified (cursor.remove() in cleanup)
- [ ] No global ScrollTrigger state leaks between routes -- add nuclear cleanup as safety net
- [ ] Body background color resets when leaving landing page -- add explicit reset in LandingPage cleanup

## Admin vs Public Route Separation

### Three-Layout Architecture

```
                         Routes
                           |
            +--------------+--------------+
            |              |              |
       LandingPage    PublicLayout    AdminLayout
       (no layout)    (header+footer) (sidebar+header)
            |              |              |
       GSAP/Lenis     Standard scroll  Standard scroll
       Custom cursor   Normal cursor   Normal cursor
       Config-driven   Supabase data   Supabase data
       No auth needed  No auth needed  Auth required
```

**LandingPage:** Renders without any shared layout wrapper. The landing page IS its own layout -- it has its own nav in the Hero section and its own Footer section. Wrapping it in a shared header/footer would break the cinematic experience.

**PublicLayout:** Shared header with navigation (Home, Fleet, Book, Check Status) and a minimal footer. Used for all customer-facing functional pages. No animations, no custom cursor, standard browser scroll.

**AdminLayout:** Sidebar navigation (Vehicles, Bookings) and top bar with user info and logout. Protected by ProtectedRoute wrapper. Standard browser scroll. Uses shadcn/ui components heavily (Table, Form, Dialog, etc.).

### Auth Guard Pattern

```typescript
// app/src/components/ProtectedRoute.tsx
function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // or skeleton
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
```

### AuthProvider Pattern

```typescript
// app/src/providers/AuthProvider.tsx
const AuthContext = createContext<AuthContextType>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Admin Login: Single User, Simple Pattern

Joey is the only admin. The setup:

1. Create Joey's account in Supabase Dashboard (Auth > Users > Add User)
2. Set email + password manually
3. Disable public sign-up in Supabase Auth settings (Settings > Auth > Enable Sign Up = OFF)
4. The admin login page only shows a sign-in form, no registration
5. RLS policies check `auth.uid()` matches the admin user's ID

This is simpler and more secure than building a roles system. No one can create new accounts through the API because sign-up is disabled at the Supabase level.

## Supabase Client Setup Pattern

### Client Singleton

```typescript
// app/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Key decisions:**
- Use the `anon` key (public), never the `service_role` key in frontend code
- Type the client with generated Database types for autocomplete and type safety
- Single instance, imported everywhere -- Supabase JS client is designed as a singleton
- Environment variables prefixed with `VITE_` so Vite exposes them to client code

### Type Generation

Generate TypeScript types from Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

This produces a `Database` type that makes every `.from('table').select()` call return typed data. Regenerate after every schema change.

### TanStack Query Integration Pattern

```typescript
// app/src/hooks/useVehicles.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // 1 minute cache
  });
}
```

```typescript
// app/src/hooks/useCreateBooking.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

## Database Schema

### Entity Relationship Diagram

```
vehicles (1) ----< (many) bookings
    |
    | images stored as JSONB array of URLs
    | (files in Supabase Storage "vehicle-images" bucket)
```

### vehicles Table

```sql
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,              -- URL-friendly identifier
  name text not null,                      -- "Rolls-Royce Ghost"
  tagline text,                            -- "Move in Silence. Let the Car Do the Talking."
  description text,                        -- Full description
  category text not null,                  -- "exotic", "luxury", "muscle", "suv"
  daily_rate integer not null,             -- Price in cents (1200_00 = $1,200)
  images text[] default '{}',             -- Array of Supabase Storage public URLs
  hero_image text,                         -- Primary display image URL
  specs jsonb default '{}',               -- { "year": 2024, "engine": "V12", "hp": 563, ... }
  experience_tags text[] default '{}',    -- ["Date Night", "Boss Move", "Wedding Day"]
  is_active boolean default true,          -- Soft delete / hide from catalog
  display_order integer default 0,         -- Sort order in catalog
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for public catalog queries
create index idx_vehicles_active on public.vehicles (is_active, display_order);
create index idx_vehicles_slug on public.vehicles (slug);
```

### bookings Table

```sql
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  confirmation_code text unique not null,  -- Generated 8-char alphanumeric code
  vehicle_id uuid references public.vehicles(id) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  pickup_date date not null,
  return_date date not null,
  status text default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled')),
  admin_notes text,                        -- Notes visible to customer
  internal_notes text,                     -- Notes only visible to admin
  total_amount integer,                    -- Calculated total in cents
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for customer status lookups
create index idx_bookings_lookup on public.bookings (confirmation_code, customer_email);
-- Index for admin dashboard queries
create index idx_bookings_status on public.bookings (status, created_at desc);
```

### Confirmation Code Generation (Database Function)

```sql
-- Generate unique 8-character confirmation code
create or replace function generate_confirmation_code()
returns trigger as $$
declare
  new_code text;
  done boolean;
begin
  done := false;
  while not done loop
    new_code := upper(substr(md5(random()::text), 1, 8));
    done := not exists(
      select 1 from public.bookings where confirmation_code = new_code
    );
  end loop;
  new.confirmation_code := new_code;
  return new;
end;
$$ language plpgsql;

create trigger set_confirmation_code
  before insert on public.bookings
  for each row
  execute function generate_confirmation_code();
```

### Updated_at Trigger

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vehicles_updated_at
  before update on public.vehicles
  for each row execute function update_updated_at();

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function update_updated_at();
```

### Row Level Security Policies

```sql
-- VEHICLES: public can read active, admin can do everything
alter table public.vehicles enable row level security;

-- Anyone can view active vehicles (catalog)
create policy "Public can view active vehicles"
  on public.vehicles for select
  using (is_active = true);

-- Admin can view all vehicles (including inactive)
create policy "Admin can view all vehicles"
  on public.vehicles for select
  to authenticated
  using (true);

-- Admin can insert vehicles
create policy "Admin can insert vehicles"
  on public.vehicles for insert
  to authenticated
  with check (true);

-- Admin can update vehicles
create policy "Admin can update vehicles"
  on public.vehicles for update
  to authenticated
  using (true);

-- Admin can delete vehicles
create policy "Admin can delete vehicles"
  on public.vehicles for delete
  to authenticated
  using (true);

-- BOOKINGS: public can insert and read own, admin can do everything
alter table public.bookings enable row level security;

-- Anyone can create a booking (guest booking flow)
create policy "Public can create bookings"
  on public.bookings for insert
  to anon
  with check (true);

-- Anyone can view their own booking by confirmation code + email
create policy "Public can view own booking"
  on public.bookings for select
  to anon
  using (true);  -- Filtered at query level by confirmation_code + email

-- Admin can view all bookings
create policy "Admin can view all bookings"
  on public.bookings for select
  to authenticated
  using (true);

-- Admin can update bookings (approve/decline)
create policy "Admin can update bookings"
  on public.bookings for update
  to authenticated
  using (true);
```

**Note on booking SELECT policy:** The `anon` SELECT policy uses `using (true)` which allows reading any booking. This is intentional for simplicity -- the query-level filter (`WHERE confirmation_code = X AND customer_email = Y`) provides practical security. A confirmation code + email combination is effectively unguessable. For stronger security, a Supabase database function could enforce the lookup pattern.

### Supabase Storage Bucket

```sql
-- Create vehicle-images bucket (done via Dashboard or API)
-- Public bucket: images are publicly accessible via URL
-- Upload restricted to authenticated users (admin only)
insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true);

-- Allow public read access
create policy "Public can view vehicle images"
  on storage.objects for select
  using (bucket_id = 'vehicle-images');

-- Only admin can upload
create policy "Admin can upload vehicle images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vehicle-images');

-- Only admin can delete
create policy "Admin can delete vehicle images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehicle-images');
```

## Directory Structure (Target State)

```
app/src/
  |-- components/
  |     |-- ui/              (existing shadcn/ui primitives)
  |     |-- ProtectedRoute.tsx
  |     |-- ScrollToTop.tsx
  |     |-- VehicleCard.tsx
  |     |-- VehicleGrid.tsx
  |     |-- BookingForm.tsx
  |     |-- StatusLookupForm.tsx
  |     |-- ImageUploader.tsx
  |     |-- ... (shared components)
  |
  |-- hooks/
  |     |-- useLenis.ts       (existing, used by LandingPage only)
  |     |-- useCustomCursor.ts (existing)
  |     |-- useScrollTrigger.ts (existing)
  |     |-- use-mobile.ts     (existing)
  |     |-- useAuth.ts        (new: auth context hook)
  |     |-- useVehicles.ts    (new: TanStack Query hook)
  |     |-- useVehicle.ts     (new: single vehicle query)
  |     |-- useBookings.ts    (new: admin bookings query)
  |     |-- useCreateBooking.ts (new: booking mutation)
  |     |-- useUpdateBooking.ts (new: admin status mutation)
  |     |-- useVehicleMutations.ts (new: admin CRUD mutations)
  |
  |-- layouts/
  |     |-- PublicLayout.tsx   (header + footer for public pages)
  |     |-- AdminLayout.tsx    (sidebar + header for admin pages)
  |
  |-- lib/
  |     |-- utils.ts           (existing)
  |     |-- supabase.ts        (new: Supabase client singleton)
  |     |-- queryClient.ts     (new: TanStack Query client config)
  |
  |-- pages/
  |     |-- LandingPage.tsx    (existing App.tsx content moved here)
  |     |-- FleetPage.tsx
  |     |-- VehicleDetailPage.tsx
  |     |-- BookingPage.tsx
  |     |-- BookingStatusPage.tsx
  |     |-- admin/
  |           |-- AdminLoginPage.tsx
  |           |-- AdminVehiclesPage.tsx
  |           |-- AdminVehicleFormPage.tsx
  |           |-- AdminBookingsPage.tsx
  |           |-- AdminBookingDetailPage.tsx
  |
  |-- providers/
  |     |-- AuthProvider.tsx   (new: Supabase auth context)
  |
  |-- sections/               (existing, used only by LandingPage)
  |     |-- Hero.tsx
  |     |-- About.tsx
  |     |-- Exhibitions.tsx
  |     |-- Collections.tsx
  |     |-- Testimonials.tsx
  |     |-- Visit.tsx
  |     |-- Footer.tsx
  |
  |-- types/
  |     |-- database.types.ts  (new: generated from Supabase)
  |
  |-- config.ts                (existing, used only by LandingPage sections)
  |-- App.tsx                  (rewritten: router + providers shell)
  |-- App.css                  (existing)
  |-- index.css                (existing)
  |-- main.tsx                 (existing, minimal changes)
```

## Patterns to Follow

### Pattern 1: Query Hook per Entity

**What:** One custom hook per data entity (vehicles, bookings) that encapsulates the Supabase query + TanStack Query configuration.

**When:** Every time a component needs data from Supabase.

**Why:** Centralizes query keys, stale times, and error handling. Prevents duplicate query definitions scattered across components.

**Example:**
```typescript
// hooks/useVehicle.ts
export function useVehicle(slug: string) {
  return useQuery({
    queryKey: ['vehicles', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
```

### Pattern 2: Form + Mutation + Redirect

**What:** Forms use react-hook-form with zod validation, submit via TanStack Query mutation, redirect on success.

**When:** Booking form submission, vehicle creation/editing.

**Why:** Separates validation (zod), form state (react-hook-form), server communication (TanStack Query), and navigation (React Router). Each concern is handled by the right tool.

**Example:**
```typescript
const form = useForm<BookingFormValues>({
  resolver: zodResolver(bookingSchema),
});
const mutation = useCreateBooking();
const navigate = useNavigate();

const onSubmit = (values: BookingFormValues) => {
  mutation.mutate(values, {
    onSuccess: (data) => {
      navigate(`/booking/status?code=${data.confirmation_code}`);
    },
  });
};
```

### Pattern 3: Optimistic Admin Updates

**What:** Admin actions (approve/decline booking, toggle vehicle active) update the UI immediately, then sync with server.

**When:** Admin dashboard interactions where feedback speed matters.

**Why:** Makes the admin panel feel instant. If the server request fails, TanStack Query automatically rolls back to the previous state.

### Pattern 4: Conditional Layout Features

**What:** The custom cursor and Lenis smooth scroll are features of the landing page experience, not the entire app.

**When:** Only the landing page route uses these features.

**Why:** Lenis conflicts with form inputs and standard page scroll. The custom cursor is a cinematic effect that feels wrong on functional pages like forms and admin tables.

**Implementation:** These hooks are called inside `LandingPage.tsx`, not in `App.tsx` or `main.tsx`. React's cleanup handles the rest.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global GSAP Registration in App Shell

**What:** Putting `gsap.registerPlugin(ScrollTrigger)` and `useLenis()` in the new App.tsx router shell.

**Why bad:** Every route would have Lenis smooth scroll and ScrollTrigger globally active. This breaks form interactions, admin table scroll, and creates orphaned ScrollTrigger instances when non-landing pages mount.

**Instead:** Keep GSAP/Lenis initialization inside `LandingPage.tsx` only.

### Anti-Pattern 2: Storing Supabase Data in React State

**What:** Using `useState` + `useEffect` to fetch and store Supabase data.

**Why bad:** No caching (every mount refetches), no background refetching, no loading/error states built in, no mutation coordination. Leads to stale data and loading spinners everywhere.

**Instead:** Use TanStack Query hooks that handle caching, refetching, and loading/error states automatically.

### Anti-Pattern 3: Service Role Key in Frontend

**What:** Using the Supabase `service_role` key in the React app to bypass RLS.

**Why bad:** The service role key has full database access. If exposed in frontend JavaScript (which is publicly visible), anyone can read, write, and delete all data.

**Instead:** Use the `anon` key with properly configured RLS policies. The anon key is designed to be public.

### Anti-Pattern 4: Sharing Layout Between Landing and Functional Pages

**What:** Wrapping the landing page in the same PublicLayout (header + footer) used by fleet/booking pages.

**Why bad:** The landing page has its own nav in the Hero section and its own Footer section. Adding another header/footer creates duplicate navigation and breaks the full-viewport cinematic flow.

**Instead:** LandingPage renders without any layout wrapper. PublicLayout is only for /fleet, /book, /booking/status routes.

### Anti-Pattern 5: Using Supabase Realtime for Everything

**What:** Setting up Supabase Realtime subscriptions for vehicle catalog and booking status.

**Why bad:** Unnecessary complexity for this use case. Vehicle data changes rarely (when admin edits). Booking status changes rarely (when admin approves/declines). TanStack Query's staleTime + background refetch is sufficient.

**Instead:** Use TanStack Query polling/caching. Consider Realtime only if adding a live admin notification feature later.

## Suggested Build Order

Based on dependencies between components, the recommended implementation sequence:

```
Phase 1: Foundation
  |-- Supabase project setup (database, auth, storage)
  |-- Database schema (vehicles + bookings tables, RLS policies)
  |-- Supabase client singleton (lib/supabase.ts)
  |-- TypeScript types generation
  |-- React Router installation and basic routing
  |-- Move App.tsx -> LandingPage.tsx (preserve animations)
  |-- New App.tsx with router shell
  |-- Verify landing page still works identically

Phase 2: Vehicle Catalog (Public)
  |-- TanStack Query setup
  |-- Seed vehicles table with current config.ts data
  |-- useVehicles / useVehicle hooks
  |-- PublicLayout (header + footer)
  |-- FleetPage (vehicle grid)
  |-- VehicleDetailPage
  |-- VehicleCard component

Phase 3: Booking Flow (Public)
  |-- Booking form (react-hook-form + zod)
  |-- useCreateBooking mutation
  |-- BookingPage with confirmation
  |-- BookingStatusPage with lookup
  |-- Confirmation code generation (DB trigger)

Phase 4: Admin Panel
  |-- AuthProvider + ProtectedRoute
  |-- Admin login page
  |-- AdminLayout (sidebar + header)
  |-- Vehicle management CRUD
  |-- Image uploader (Supabase Storage)
  |-- Booking management (list + approve/decline)
```

**Why this order:**
1. Foundation first because everything depends on routing and the Supabase client
2. Vehicle catalog before booking because booking requires selecting a vehicle
3. Booking before admin because admin manages bookings (need bookings to manage)
4. Admin last because it is the most complex and least customer-facing

**Critical dependency:** Phase 1 MUST verify the landing page animations survive the routing migration before building anything else. If animations break, fix them before proceeding.

## Scalability Considerations

| Concern | Current (MVP) | At 1K vehicles | At 10K bookings/month |
|---------|--------------|----------------|----------------------|
| Data fetching | TanStack Query cache | Add pagination, filters | Server-side filtering, cursor pagination |
| Image storage | Supabase Storage free tier (1GB) | Monitor usage, optimize images | Consider CDN or image optimization service |
| Auth | Single admin user | Add role column to admin_users | Full RBAC system |
| Search | Client-side filter | Postgres full-text search | Dedicated search (Algolia/Meilisearch) |
| Performance | SPA, no SSR | Add pre-rendering for SEO pages | Consider SSR for vehicle pages |

## Sources

### HIGH Confidence (Official Documentation)
- [GSAP React Integration Guide](https://gsap.com/resources/React/) - useGSAP hook patterns, cleanup, scoping
- [Supabase Auth React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) - Client setup, auth state management
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS policies, role-based access
- [Supabase Tables Documentation](https://supabase.com/docs/guides/database/tables) - Table creation, types, foreign keys
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) - Bucket setup, access policies
- [Supabase Password Auth](https://supabase.com/docs/guides/auth/passwords) - signInWithPassword method
- [React Router v7 Documentation](https://reactrouter.com/) - Latest version, React 19 compatibility
- [React Router Changelog](https://reactrouter.com/changelog) - v7.13.0 current version

### MEDIUM Confidence (Verified Community Patterns)
- [GSAP ScrollTrigger + React Router Issues](https://gsap.com/community/forums/topic/37475-gsap-scrolltrigger-doesnt-run-on-route-change-react-router-v6-route-transition-with-framer-motion/) - ScrollTrigger.refresh() needed on route change
- [Lenis Route Change Issues](https://github.com/darkroomengineering/lenis/issues/319) - Lenis scroll position on navigation
- [TanStack Query + Supabase Integration](https://makerkit.dev/blog/saas/supabase-react-query) - Query patterns, mutation strategies, staleTime
- [Supabase React Auth Template](https://github.com/mmvergara/react-supabase-auth-template) - Protected routes pattern
- [Supabase + React Admin Guide](https://www.9thco.com/labs/supabase-and-react-admin-guide) - Admin panel architecture
- [Supabase RLS Real Examples](https://designrevision.com/blog/supabase-row-level-security) - Policy patterns for multi-role access

### LOW Confidence (Single Source / Unverified)
- [Car Rental Database Design](https://github.com/dhvani-k/Car_Rental_Database_Design) - Schema reference (PostgreSQL, not Supabase-specific)

---

*Architecture research: 2026-02-15*
