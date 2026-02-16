import { Link } from 'react-router';
import { Plus, AlertCircle } from 'lucide-react';
import {
  useAdminVehicles,
  useToggleVehicleActive,
  useDeleteVehicle,
} from '../../hooks/useAdminVehicles';
import VehicleTable from '../../components/admin/VehicleTable';

// ---------------------------------------------------------------
// VehiclesPage — admin vehicle list with management actions.
// ---------------------------------------------------------------

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading, error } = useAdminVehicles();
  const toggleActive = useToggleVehicleActive();
  const deleteVehicle = useDeleteVehicle();

  const handleToggleActive = (id: string, currentActive: boolean) => {
    toggleActive.mutate({ id, is_active: !currentActive });
  };

  const handleDelete = (id: string, _name: string) => {
    deleteVehicle.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="museo-headline text-white text-2xl lg:text-3xl">
            Manage Vehicles
          </h1>
          <p className="museo-body text-white/40 mt-1 text-sm">
            Add, edit, and manage your fleet
          </p>
        </div>
        <Link
          to="/admin/vehicles/new"
          className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C4A030] text-[#050505] font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Mutation error */}
      {(toggleActive.isError || deleteVehicle.isError) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">
            {toggleActive.error?.message ||
              deleteVehicle.error?.message ||
              'An error occurred. Please try again.'}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-10 bg-white/5 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
                <div className="h-4 bg-white/5 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">
            Failed to load vehicles: {error.message}
          </p>
        </div>
      ) : (
        <VehicleTable
          vehicles={vehicles}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
