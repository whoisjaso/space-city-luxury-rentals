import { Calendar, Clock, Car, DollarSign } from 'lucide-react';
import type { AdminStats } from '../../hooks/useAdminBookings';

// ---------------------------------------------------------------
// DashboardStats — three stat cards for the admin dashboard.
// Shows total bookings, pending requests, and active vehicles.
// ---------------------------------------------------------------

interface DashboardStatsProps {
  stats: AdminStats | undefined;
  isLoading: boolean;
}

export default function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const formatCents = (cents: number) =>
    cents > 0 ? `$${(cents / 100).toLocaleString()}` : '$0';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 w-24 bg-white/10 rounded mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded mb-1" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      subtitle: 'all time',
      icon: <Calendar className="w-5 h-5" />,
      highlight: false,
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingBookings ?? 0,
      subtitle: 'awaiting review',
      icon: <Clock className="w-5 h-5" />,
      highlight: (stats?.pendingBookings ?? 0) > 0,
    },
    {
      label: 'Active Vehicles',
      value: stats?.activeVehicles ?? 0,
      subtitle: 'in fleet',
      icon: <Car className="w-5 h-5" />,
      highlight: false,
    },
    {
      label: 'Pending Captures',
      value: formatCents(stats?.authorizedPaymentsCents ?? 0),
      subtitle: 'authorized holds',
      icon: <DollarSign className="w-5 h-5" />,
      highlight: (stats?.authorizedPaymentsCents ?? 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-[#1a1a1a] border rounded-xl p-6 ${
            card.highlight
              ? 'border-[#D4AF37]/30'
              : 'border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="museo-label text-white/40 text-xs uppercase tracking-wider">
              {card.label}
            </span>
            <span
              className={`${
                card.highlight ? 'text-[#D4AF37]' : 'text-white/20'
              }`}
            >
              {card.icon}
            </span>
          </div>
          <span
            className={`text-3xl font-bold block ${
              card.highlight ? 'text-[#D4AF37]' : 'text-white'
            }`}
          >
            {card.value}
          </span>
          <span className="museo-label text-white/25 text-[11px] mt-1 block">
            {card.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
