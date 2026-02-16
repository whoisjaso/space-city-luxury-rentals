import { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import type { BookingWithVehicle } from '../../hooks/useAdminBookings';

// ---------------------------------------------------------------
// BookingActionModal — confirm approve/decline with optional notes.
// Shows booking summary, textarea for admin notes, and action button.
// ---------------------------------------------------------------

interface BookingActionModalProps {
  booking: BookingWithVehicle;
  action: 'approve' | 'decline';
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function BookingActionModal({
  booking,
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: BookingActionModalProps) {
  const [notes, setNotes] = useState('');

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve Booking' : 'Decline Booking';
  const buttonLabel = isApprove ? 'Approve' : 'Decline';
  const placeholder = isApprove
    ? 'Add a note for the customer (optional)'
    : 'Reason for declining (recommended)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <h2 className="text-white font-semibold text-lg">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white/30 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking summary */}
        <div className="px-6 py-4 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Guest</span>
            <span className="text-white text-sm font-medium">
              {booking.guest_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Vehicle</span>
            <span className="text-white text-sm font-medium">
              {booking.vehicle_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Dates</span>
            <span className="text-white text-sm font-medium">
              {formatDate(booking.start_date)} &mdash;{' '}
              {formatDate(booking.end_date)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Code</span>
            <span className="font-mono text-[#D4AF37] text-sm font-bold tracking-wider">
              {booking.confirmation_code}
            </span>
          </div>
        </div>

        {/* Notes form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label
              htmlFor="admin-notes"
              className="museo-label text-white/40 text-xs block mb-2"
            >
              Notes for Customer
            </label>
            <textarea
              id="admin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white text-sm museo-body placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-[#D4AF37]/40 transition-all resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${
                isApprove
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isLoading ? 'Processing...' : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
