import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  ArrowUpDown,
  Car,
} from 'lucide-react';
import type { Vehicle } from '../../types/database';

// ---------------------------------------------------------------
// VehicleTable — displays all vehicles in a sortable, searchable
// table (desktop) or card list (mobile).
// ---------------------------------------------------------------

interface VehicleTableProps {
  vehicles: Vehicle[];
  onToggleActive: (id: string, currentActive: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

type SortField = 'name' | 'daily_price_cents';
type SortDirection = 'asc' | 'desc';

export default function VehicleTable({
  vehicles,
  onToggleActive,
  onDelete,
}: VehicleTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = vehicles;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.slug.toLowerCase().includes(q) ||
          v.headline.toLowerCase().includes(q),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a.daily_price_cents - b.daily_price_cents;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [vehicles, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const formatPrice = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US')}`;

  const handleDelete = (id: string, name: string) => {
    if (deleteConfirm === id) {
      onDelete(id, name);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicles..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors"
        />
      </div>

      {/* Results count */}
      <p className="text-white/30 text-sm">
        {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Car className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">
            {search ? 'No vehicles match your search.' : 'No vehicles yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left pb-3 pl-3 museo-label text-white/40 text-xs">
                    Image
                  </th>
                  <th className="text-left pb-3">
                    <button
                      onClick={() => toggleSort('name')}
                      className="museo-label text-white/40 text-xs flex items-center gap-1 hover:text-white/60 transition-colors"
                    >
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left pb-3">
                    <button
                      onClick={() => toggleSort('daily_price_cents')}
                      className="museo-label text-white/40 text-xs flex items-center gap-1 hover:text-white/60 transition-colors"
                    >
                      Daily Price
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left pb-3 museo-label text-white/40 text-xs">
                    Status
                  </th>
                  <th className="text-left pb-3 museo-label text-white/40 text-xs">
                    Tags
                  </th>
                  <th className="text-right pb-3 pr-3 museo-label text-white/40 text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 pl-3">
                      <div className="w-14 h-10 rounded-md overflow-hidden bg-white/5">
                        {vehicle.images[0] ? (
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-5 h-5 text-white/10" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name + slug */}
                    <td className="py-3">
                      <span className="text-white text-sm font-medium block">
                        {vehicle.name}
                      </span>
                      <span className="text-white/30 text-xs">{vehicle.slug}</span>
                    </td>

                    {/* Price */}
                    <td className="py-3">
                      <span className="text-white/70 text-sm">
                        {formatPrice(vehicle.daily_price_cents)}/day
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          vehicle.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            vehicle.is_active ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        />
                        {vehicle.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {vehicle.experience_tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {vehicle.experience_tags.length > 3 && (
                          <span className="text-[10px] text-white/30">
                            +{vehicle.experience_tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/vehicles/edit/${vehicle.id}`}
                          className="p-2 text-white/30 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            onToggleActive(vehicle.id, vehicle.is_active)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            vehicle.is_active
                              ? 'text-green-400/60 hover:text-yellow-400 hover:bg-white/5'
                              : 'text-red-400/60 hover:text-green-400 hover:bg-white/5'
                          }`}
                          title={
                            vehicle.is_active ? 'Deactivate' : 'Activate'
                          }
                        >
                          {vehicle.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id, vehicle.name)}
                          className={`p-2 rounded-lg transition-colors ${
                            deleteConfirm === vehicle.id
                              ? 'text-red-400 bg-red-500/10'
                              : 'text-white/30 hover:text-red-400 hover:bg-white/5'
                          }`}
                          title={
                            deleteConfirm === vehicle.id
                              ? 'Click again to confirm'
                              : 'Delete'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-md overflow-hidden bg-white/5 shrink-0">
                    {vehicle.images[0] ? (
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-white/10" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate">
                      {vehicle.name}
                    </h3>
                    <p className="text-white/40 text-xs">{vehicle.slug}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/60 text-sm">
                        {formatPrice(vehicle.daily_price_cents)}/day
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                          vehicle.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {vehicle.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {vehicle.experience_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vehicle.experience_tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <Link
                    to={`/admin/vehicles/edit/${vehicle.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-[#D4AF37] py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() =>
                      onToggleActive(vehicle.id, vehicle.is_active)
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-yellow-400 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {vehicle.is_active ? (
                      <>
                        <ToggleRight className="w-3.5 h-3.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-colors ${
                      deleteConfirm === vehicle.id
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-white/50 hover:text-red-400 hover:bg-white/5'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleteConfirm === vehicle.id ? 'Confirm' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
