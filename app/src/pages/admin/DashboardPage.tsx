import { Link } from 'react-router';
import { ArrowRight, CalendarDays, Car } from 'lucide-react';
import { useAdminStats, useAdminBookings } from '../../hooks/useAdminBookings';
import DashboardStats from '../../components/admin/DashboardStats';
import type { BookingStatus } from '../../types/database';

// ---------------------------------------------------------------
// DashboardPage — admin dashboard with stats and recent bookings.
// Shows a quick health check: total bookings, pending requests,
// active vehicles, plus the 5 most recent bookings.
// ---------------------------------------------------------------

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  pending: {
    label: 'Pending',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-400',
  },
  approved: {
    label: 'Approved',
    dotColor: 'bg-green-400',
    textColor: 'text-green-400',
  },
  declined: {
    label: 'Declined',
    dotColor: 'bg-red-400',
    textColor: 'text-red-400',
  },
  completed: {
    label: 'Completed',
    dotColor: 'bg-blue-400',
    textColor: 'text-blue-400',
  },
  cancelled: {
    label: 'Cancelled',
    dotColor: 'bg-white/40',
    textColor: 'text-white/40',
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useAdminStats();
  const { data: bookings = [], isLoading: isLoadingBookings } =
    useAdminBookings();

  // Take only the 5 most recent
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="museo-headline text-white text-2xl lg:text-3xl">
          Dashboard
        </h1>
        <p className="museo-body text-white/40 mt-1">
          Welcome back, Joey. Here&apos;s your fleet overview.
        </p>
      </div>

      {/* Stats cards */}
      <DashboardStats stats={stats} isLoading={isLoadingStats} />

      {/* Recent bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Recent Bookings</h2>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center gap-1 text-[#D4AF37] text-sm hover:text-[#D4AF37]/80 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingBookings ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-white/[0.03] border border-white/5 rounded-lg"
              />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-white/30 museo-body text-sm">
              No bookings yet. They&apos;ll appear here once customers start
              reserving.
            </p>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
            {recentBookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className="px-4 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Code */}
                  <span className="font-mono text-[#D4AF37] text-xs font-bold tracking-wider w-20 shrink-0">
                    {booking.confirmation_code}
                  </span>

                  {/* Guest + Vehicle */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {booking.guest_name}
                    </p>
                    <p className="text-white/30 text-xs truncate">
                      {booking.vehicle_name}
                    </p>
                  </div>

                  {/* Dates */}
                  <span className="text-white/40 text-xs whitespace-nowrap hidden sm:block">
                    {formatDate(booking.start_date)} &ndash;{' '}
                    {formatDate(booking.end_date)}
                  </span>

                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${cfg.textColor}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`}
                    />
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/bookings"
          className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-[#D4AF37]/20 hover:bg-white/[0.04] transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white text-sm font-medium block">
              Manage Bookings
            </span>
            <span className="text-white/30 text-xs">
              View, approve, and decline requests
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/vehicles"
          className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-[#D4AF37]/20 hover:bg-white/[0.04] transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white text-sm font-medium block">
              Manage Vehicles
            </span>
            <span className="text-white/30 text-xs">
              Add, edit, and organize your fleet
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#D4AF37] transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
}
