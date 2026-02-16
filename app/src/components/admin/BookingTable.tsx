import { useState, Fragment } from 'react';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  StickyNote,
} from 'lucide-react';
import type { BookingWithVehicle } from '../../hooks/useAdminBookings';
import type { BookingStatus } from '../../types/database';

// ---------------------------------------------------------------
// BookingTable — displays bookings in a table (desktop) or card
// list (mobile). Rows expand to show contact info and admin notes.
// ---------------------------------------------------------------

interface BookingTableProps {
  bookings: BookingWithVehicle[];
  onAction: (bookingId: string, action: 'approve' | 'decline') => void;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; dotColor: string; textColor: string; bg: string }
> = {
  pending: {
    label: 'Pending',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  approved: {
    label: 'Approved',
    dotColor: 'bg-green-400',
    textColor: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  declined: {
    label: 'Declined',
    dotColor: 'bg-red-400',
    textColor: 'text-red-400',
    bg: 'bg-red-500/10',
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${cfg.bg} rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${cfg.textColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

function ActionButtons({
  booking,
  onAction,
}: {
  booking: BookingWithVehicle;
  onAction: BookingTableProps['onAction'];
}) {
  if (booking.status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction(booking.id, 'approve');
          }}
          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
          title="Approve booking"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction(booking.id, 'decline');
          }}
          className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
          title="Decline booking"
        >
          <XCircle className="w-3.5 h-3.5" />
          Decline
        </button>
      </div>
    );
  }

  // For approved bookings: allow decline. For declined: allow approve.
  const altAction = booking.status === 'approved' ? 'decline' : 'approve';
  const altLabel = altAction === 'approve' ? 'Approve' : 'Decline';
  const altColor =
    altAction === 'approve'
      ? 'text-green-400 hover:text-green-300'
      : 'text-red-400 hover:text-red-300';
  const AltIcon = altAction === 'approve' ? CheckCircle : XCircle;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAction(booking.id, altAction);
      }}
      className={`inline-flex items-center gap-1 ${altColor} text-xs font-medium transition-colors`}
    >
      <AltIcon className="w-3.5 h-3.5" />
      {altLabel}
    </button>
  );
}

export default function BookingTable({ bookings, onAction }: BookingTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-10 text-center">
        <p className="text-white/30 museo-body">No bookings found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-4 museo-label text-white/30 text-[11px] uppercase tracking-wider font-medium">
                Code
              </th>
              <th className="text-left py-3 px-4 museo-label text-white/30 text-[11px] uppercase tracking-wider font-medium">
                Guest
              </th>
              <th className="text-left py-3 px-4 museo-label text-white/30 text-[11px] uppercase tracking-wider font-medium">
                Vehicle
              </th>
              <th className="text-left py-3 px-4 museo-label text-white/30 text-[11px] uppercase tracking-wider font-medium">
                Dates
              </th>
              <th className="text-left py-3 px-4 museo-label text-white/30 text-[11px] uppercase tracking-wider font-medium">
                Status
              </th>
              <th className="text-right py-3 px-4 museo-label text-white/30 text-[11px] uppercase tracking-wider font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const isExpanded = expandedId === booking.id;
              return (
                <Fragment key={booking.id}>
                  <tr
                    onClick={() => toggleExpanded(booking.id)}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-[#D4AF37] text-sm font-bold tracking-wider">
                        {booking.confirmation_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white text-sm">
                      {booking.guest_name}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm">
                      {booking.vehicle_name}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm whitespace-nowrap">
                      {formatDate(booking.start_date)} &ndash;{' '}
                      {formatDate(booking.end_date)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ActionButtons
                          booking={booking}
                          onAction={onAction}
                        />
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-white/20" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-white/[0.015]">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="flex flex-wrap gap-6 text-sm">
                          <div className="flex items-center gap-2 text-white/50">
                            <Mail className="w-4 h-4" />
                            <a
                              href={`mailto:${booking.guest_email}`}
                              className="hover:text-[#D4AF37] transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {booking.guest_email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-white/50">
                            <Phone className="w-4 h-4" />
                            <a
                              href={`tel:${booking.guest_phone}`}
                              className="hover:text-[#D4AF37] transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {booking.guest_phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-white/50">
                            <span className="museo-label text-white/30 text-[10px]">
                              SUBMITTED
                            </span>
                            {new Date(booking.created_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </div>
                          {booking.admin_notes && (
                            <div className="w-full flex items-start gap-2 text-white/50 mt-1">
                              <StickyNote className="w-4 h-4 mt-0.5 shrink-0" />
                              <div>
                                <span className="museo-label text-white/30 text-[10px] block mb-0.5">
                                  ADMIN NOTES
                                </span>
                                <p className="text-white/50 text-sm leading-relaxed">
                                  {booking.admin_notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {bookings.map((booking) => {
          const isExpanded = expandedId === booking.id;
          return (
            <div
              key={booking.id}
              className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden"
            >
              {/* Card header — tappable */}
              <button
                onClick={() => toggleExpanded(booking.id)}
                className="w-full text-left px-4 py-4 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#D4AF37] text-xs font-bold tracking-wider">
                      {booking.confirmation_code}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-white text-sm font-medium truncate">
                    {booking.guest_name}
                  </p>
                  <p className="text-white/40 text-xs truncate">
                    {booking.vehicle_name}
                  </p>
                  <p className="text-white/30 text-xs">
                    {formatDate(booking.start_date)} &ndash;{' '}
                    {formatDate(booking.end_date)}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/20 shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/20 shrink-0 mt-1" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 space-y-3">
                  {/* Full dates */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <span className="museo-label text-white/30 text-[10px] block mb-0.5">
                        PICKUP
                      </span>
                      <span className="text-white/60 text-xs">
                        {formatFullDate(booking.start_date)}
                      </span>
                    </div>
                    <div>
                      <span className="museo-label text-white/30 text-[10px] block mb-0.5">
                        RETURN
                      </span>
                      <span className="text-white/60 text-xs">
                        {formatFullDate(booking.end_date)}
                      </span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5">
                    <a
                      href={`mailto:${booking.guest_email}`}
                      className="flex items-center gap-2 text-white/50 hover:text-[#D4AF37] text-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {booking.guest_email}
                    </a>
                    <a
                      href={`tel:${booking.guest_phone}`}
                      className="flex items-center gap-2 text-white/50 hover:text-[#D4AF37] text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {booking.guest_phone}
                    </a>
                  </div>

                  {/* Admin notes */}
                  {booking.admin_notes && (
                    <div className="bg-white/[0.03] rounded-lg p-3">
                      <span className="museo-label text-white/30 text-[10px] block mb-1">
                        ADMIN NOTES
                      </span>
                      <p className="text-white/50 text-xs leading-relaxed">
                        {booking.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-1">
                    <ActionButtons booking={booking} onAction={onAction} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
