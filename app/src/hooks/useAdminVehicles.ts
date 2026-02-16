import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { SEED_VEHICLES } from './useVehicles';
import type { Vehicle, VehicleInsert, VehicleUpdate } from '../types/database';

// ---------------------------------------------------------------
// Admin vehicle hooks — CRUD operations for the admin panel.
// All hooks fall back to demo mode with local state when
// Supabase is not configured.
// ---------------------------------------------------------------

// ---------- Demo mode state ----------

let demoVehicles: Vehicle[] = [...SEED_VEHICLES];
let demoIdCounter = 100;

function resetDemoState() {
  demoVehicles = [...SEED_VEHICLES];
}

// Expose for testing if needed
export { resetDemoState };

// ---------- Fetch all vehicles (including inactive) ----------

async function fetchAdminVehicles(): Promise<Vehicle[]> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 300));
    return [...demoVehicles];
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Vehicle[]) ?? [];
}

export function useAdminVehicles() {
  return useQuery<Vehicle[], Error>({
    queryKey: ['admin', 'vehicles'],
    queryFn: fetchAdminVehicles,
  });
}

// ---------- Fetch single vehicle by ID ----------

async function fetchAdminVehicle(id: string): Promise<Vehicle | null> {
  if (!supabaseConfigured || !supabase) {
    return demoVehicles.find((v) => v.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Vehicle;
}

export function useAdminVehicle(id: string) {
  return useQuery<Vehicle | null, Error>({
    queryKey: ['admin', 'vehicle', id],
    queryFn: () => fetchAdminVehicle(id),
    enabled: !!id,
  });
}

// ---------- Create vehicle ----------

async function createVehicle(input: VehicleInsert): Promise<Vehicle> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 500));
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      id: `demo-${++demoIdCounter}`,
      ...input,
      created_at: now,
      updated_at: now,
    };
    demoVehicles.unshift(newVehicle);
    return newVehicle;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, VehicleInsert>({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// ---------- Update vehicle ----------

interface UpdateVehicleInput {
  id: string;
  updates: VehicleUpdate;
}

async function updateVehicle({ id, updates }: UpdateVehicleInput): Promise<Vehicle> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 500));
    const idx = demoVehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');
    const updated: Vehicle = {
      ...demoVehicles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    demoVehicles[idx] = updated;
    return updated;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, UpdateVehicleInput>({
    mutationFn: updateVehicle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicle', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// ---------- Delete vehicle (soft-delete: set is_active = false) ----------

async function deleteVehicle(id: string): Promise<void> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 300));
    demoVehicles = demoVehicles.filter((v) => v.id !== id);
    return;
  }

  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// ---------- Toggle vehicle active status ----------

interface ToggleActiveInput {
  id: string;
  is_active: boolean;
}

async function toggleActive({ id, is_active }: ToggleActiveInput): Promise<Vehicle> {
  return updateVehicle({ id, updates: { is_active } });
}

export function useToggleVehicleActive() {
  const queryClient = useQueryClient();
  return useMutation<Vehicle, Error, ToggleActiveInput>({
    mutationFn: toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// ---------- Upload vehicle image ----------

interface UploadImageInput {
  file: File;
  vehicleId: string;
}

interface UploadImageResult {
  url: string;
}

async function uploadVehicleImage({
  file,
  vehicleId,
}: UploadImageInput): Promise<UploadImageResult> {
  if (!supabaseConfigured || !supabase) {
    // Demo mode: create a local object URL for preview
    await new Promise((r) => setTimeout(r, 300));
    const url = URL.createObjectURL(file);
    return { url };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${vehicleId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('vehicle-images')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}

export function useUploadVehicleImage() {
  return useMutation<UploadImageResult, Error, UploadImageInput>({
    mutationFn: uploadVehicleImage,
  });
}
