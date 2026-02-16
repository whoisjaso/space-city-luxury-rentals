import { useState } from 'react';
import {
  useAdminBookings,
  useUpdateBookingStatus,
} from '../../hooks/useAdminBookings';
import type { BookingWithVehicle } from '../../hooks/useAdminBookings';
import type { BookingStatus } from '../../types/database';
import BookingTable from '../../components/admin/BookingTable';
import BookingActionModal from '../../components/admin/BookingActionModal';

// ---------------------------------------------------------------
// BookingsPage — admin booking management with status filtering,
// table view, and approve/decline modal.
// ---------------------------------------------------------------

type StatusFilter = BookingStatus | undefined;

interface FilterTab {
  label: string;
  value: StatusFilter;
}

const FILTER_TABS: FilterTab[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Declined', value: 'declined' },
];

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
  const [modalState, setModalState] = useState<{
    booking: BookingWithVehicle;
    action: 'approve' | 'decline';
  } | null>(null);

  const { data: bookings = [], isLoading } = useAdminBookings(statusFilter);

  // Also fetch all bookings to get pending count for tab badge
  const { data: allBookings = [] } = useAdminBookings(undefined);
  const pendingCount = allBookings.filter(
    (b) => b.status === 'pending',
  ).length;

  const updateStatus = useUpdateBookingStatus();

  const handleAction = (bookingId: string, action: 'approve' | 'decline') => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setModalState({ booking, action });
  };

  const handleConfirm = (notes: string) => {
    if (!modalState) return;
    updateStatus.mutate({
      id: modalState.booking.id,
      status: modalState.action === 'approve' ? 'approved' : 'declined',
      admin_notes: notes || null,
    });
  };

  const handleCancel = () => {
    setModalState(null);
    updateStatus.reset();
  };

  const handleDone = () => {
    setModalState(null);
    updateStatus.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="museo-headline text-white text-2xl lg:text-3xl">
          Manage Bookings
        </h1>
        <p className="museo-body text-white/40 mt-1">
          Review and respond to booking requests.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive =
            statusFilter === tab.value ||
            (statusFilter === undefined && tab.value === undefined);

          return (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#050505]'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking table */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 bg-white/[0.03] border border-white/5 rounded-lg"
            />
          ))}
        </div>
      ) : (
        <BookingTable bookings={bookings} onAction={handleAction} />
      )}

      {/* Action modal */}
      {modalState && (
        <BookingActionModal
          booking={modalState.booking}
          action={modalState.action}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onDone={handleDone}
          isLoading={updateStatus.isPending}
          isSuccess={updateStatus.isSuccess}
        />
      )}
    </div>
  );
}
