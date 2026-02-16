---
phase: 02-supabase-foundation
plan: 02
subsystem: data-layer
tags: [supabase, sql, rls, storage, seed-data, database-schema]
completed: 2026-02-15
duration: ~2 min

dependency-graph:
  requires: [02-01]
  provides: [database-schema, rls-policies, storage-bucket, seed-data]
  affects: [03-01, 04-01, 05-01, 06-01, 07-01, 08-01]

tech-stack:
  added: []
  patterns:
    - "Numbered SQL migration files (001-004) for ordered execution"
    - "Shared trigger function (update_updated_at) across tables"
    - "Row Level Security with anon read / admin write separation"
    - "Auto-generated confirmation codes via BEFORE INSERT trigger"

key-files:
  created:
    - supabase/migrations/001_create_vehicles.sql
    - supabase/migrations/002_create_bookings.sql
    - supabase/migrations/003_rls_policies.sql
    - supabase/migrations/004_storage_setup.sql
    - supabase/seed.sql
  modified: []

decisions:
  - id: rls-booking-select
    choice: "Allow anon SELECT on all bookings; filter by confirmation_code at app level"
    rationale: "MVP simplicity -- guests look up bookings by code, no user accounts needed"
  - id: confirmation-code-generation
    choice: "Database trigger generates 8-char uppercase hex code on INSERT"
    rationale: "Server-side generation ensures uniqueness; client never needs to provide one"
  - id: migration-ordering
    choice: "4 numbered SQL files: tables, then RLS, then storage"
    rationale: "Tables must exist before policies reference them; clear execution order"
---

# Phase 2 Plan 2: Database Schema, RLS Policies & Seed Data Summary

**One-liner:** SQL migrations for vehicles/bookings tables with auto-updated timestamps, RLS policies enforcing anon-read/admin-write, vehicle-images storage bucket, and 6-vehicle seed fleet.

## What Was Done

### Task 1: Database migrations for vehicles and bookings tables

Created `supabase/migrations/` directory with two DDL migration files.

**001_create_vehicles.sql:**
- `vehicles` table with all 12 columns matching `types/database.ts` Vehicle interface
- uuid primary key with `gen_random_uuid()` default
- `slug` UNIQUE NOT NULL for URL-friendly identifiers
- `daily_price_cents` integer (prices in cents, no floating-point)
- `images text[]` and `experience_tags text[]` for array columns
- `is_active` boolean for soft-delete/deactivation
- `update_updated_at()` trigger function (shared by both tables)
- `vehicles_updated_at` BEFORE UPDATE trigger

**002_create_bookings.sql:**
- `bookings` table with all 13 columns matching `types/database.ts` Booking interface
- `confirmation_code` UNIQUE NOT NULL with empty string default (trigger fills it)
- `vehicle_id` uuid FK referencing `vehicles(id)`
- `status` text with CHECK constraint: 'pending', 'approved', 'declined'
- `generate_confirmation_code()` function: 8-char uppercase hex from md5(random())
- `bookings_confirmation_code` BEFORE INSERT trigger (fires when code is NULL or empty)
- `bookings_updated_at` trigger reusing `update_updated_at()` function

### Task 2: RLS policies, storage setup, and seed data

**003_rls_policies.sql:**
- RLS enabled on both `vehicles` and `bookings`
- Vehicles: anon can SELECT where `is_active = true`; authenticated admin has ALL operations
- Bookings: anon can INSERT (guest checkout) and SELECT (lookup by code); admin can UPDATE and DELETE

**004_storage_setup.sql:**
- `vehicle-images` bucket created with `public = true`
- Public read policy on storage.objects for the bucket
- Admin-only upload (INSERT) and delete (DELETE) policies

**supabase/seed.sql:**
- 6 vehicles matching the Space City Rentals fleet showcase:
  1. Rolls-Royce Ghost -- $1,200/day, tags: Date Night, Wedding Day, Statement
  2. Lamborghini Huracan -- $950/day, tags: Content Ready, Statement, Boss Move
  3. Dodge Hellcat Widebody -- $450/day, tags: Weekend Takeover, Content Ready, Boss Move
  4. Mercedes-Maybach S-Class -- $800/day, tags: Boss Move, Date Night, Wedding Day
  5. Range Rover Sport -- $550/day, tags: Weekend Takeover, Boss Move
  6. Chevrolet Corvette C8 -- $500/day, tags: Date Night, Content Ready, Weekend Takeover
- Each vehicle includes slug, name, headline, description, price, image path, experience tags, and rental_count

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Booking SELECT policy | Allow anon SELECT on all bookings | MVP: guests look up by confirmation_code at app level, no user accounts |
| Confirmation code generation | DB trigger generates 8-char uppercase hex | Server-side ensures uniqueness; client never provides one |
| Migration ordering | 4 numbered files: tables, RLS, storage | Tables must exist before policies; clear execution sequence |
| Seed rental_count values | Non-zero realistic values (29-55) | Makes development UI look populated and realistic |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] vehicles table DDL matches all columns from types/database.ts Vehicle interface
- [x] bookings table DDL matches all columns from types/database.ts Booking interface
- [x] confirmation_code has UNIQUE constraint
- [x] RLS enabled on both vehicles and bookings tables
- [x] Anonymous users can SELECT active vehicles only
- [x] Anonymous users can INSERT bookings but not UPDATE or DELETE
- [x] Authenticated admin can perform all CRUD on vehicles and bookings
- [x] Storage bucket 'vehicle-images' created with public read access
- [x] Seed data includes 6 vehicles matching the fleet showcase
- [x] All SQL files have clear comments and logical ordering

## Commits

| Hash | Message |
|------|---------|
| 27225fc | feat(02-02): database schema migrations for vehicles and bookings |
| 259cda1 | feat(02-02): RLS policies, storage setup, and seed data |

## Next Phase Readiness

Phase 2 (Supabase Foundation) is now complete. The backend data model is fully defined:
- SQL migrations ready to run in Supabase SQL Editor (001 through 004, then seed.sql)
- Client-side types from 02-01 already mirror this schema exactly
- RLS policies enforce the security model needed for public browsing + admin management
- Phase 3 (Public Layout & Brand Shell) can proceed -- it only needs the client infrastructure from 02-01
- Phase 4+ (Fleet Catalog, Vehicle Detail, Guest Booking) will query these tables via the typed Supabase client
