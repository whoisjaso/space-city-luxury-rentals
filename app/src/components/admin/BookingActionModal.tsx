import { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, Mail, Phone } from 'lucide-react';
import type { BookingWithVehicle } from '../../hooks/useAdminBookings';

// ---------------------------------------------------------------
// BookingActionModal — confirm approve/decline with optional notes,
// then show a "Notify Customer" step with pre-filled SMS/email.
// ---------------------------------------------------------------

interface BookingActionModalProps {
  booking: BookingWithVehicle;
  action: 'approve' | 'decline';
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  onDone: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusCheckUrl(code: string): string {
  return `${window.location.origin}/book/${code}`;
}

function buildSmsBody(
  booking: BookingWithVehicle,
  action: 'approve' | 'decline',
  notes: string,
): string {
  const statusUrl = getStatusCheckUrl(booking.confirmation_code);
  if (action === 'approve') {
    return (
      `Hey ${booking.guest_name.split(' ')[0]}! Great news - your ${booking.vehicle_name} reservation (${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}) has been APPROVED. ` +
      (notes ? `Note: ${notes} ` : '') +
      `Check details: ${statusUrl} - Space City Luxury Rentals`
    );
  }
  return (
    `Hey ${booking.guest_name.split(' ')[0]}, unfortunately we're unable to confirm your ${booking.vehicle_name} reservation for ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}. ` +
    (notes ? `Reason: ${notes} ` : '') +
    `Check status: ${statusUrl} - Space City Luxury Rentals`
  );
}

function buildEmailSubject(
  booking: BookingWithVehicle,
  action: 'approve' | 'decline',
): string {
  if (action === 'approve') {
    return `Booking Confirmed - ${booking.vehicle_name} | Space City Luxury Rentals`;
  }
  return `Booking Update - ${booking.vehicle_name} | Space City Luxury Rentals`;
}

function buildEmailBody(
  booking: BookingWithVehicle,
  action: 'approve' | 'decline',
  notes: string,
): string {
  const statusUrl = getStatusCheckUrl(booking.confirmation_code);
  const firstName = booking.guest_name.split(' ')[0];

  if (action === 'approve') {
    return [
      `Hey ${firstName},`,
      '',
      `Great news! Your reservation has been APPROVED.`,
      '',
      `Vehicle: ${booking.vehicle_name}`,
      `Dates: ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}`,
      `Confirmation Code: ${booking.confirmation_code}`,
      notes ? `\nNote: ${notes}` : '',
      '',
      `View your booking details anytime: ${statusUrl}`,
      '',
      `We'll reach out before your pickup date with final details.`,
      '',
      `- Joey | Space City Luxury Rentals`,
      `(667) 391-7797`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `Hey ${firstName},`,
    '',
    `Thanks for your interest in the ${booking.vehicle_name}.`,
    `Unfortunately, we're unable to confirm your reservation for ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}.`,
    notes ? `\nReason: ${notes}` : '',
    '',
    `View your booking status: ${statusUrl}`,
    '',
    `Feel free to browse our fleet and try different dates - we'd love to make it work.`,
    '',
    `- Joey | Space City Luxury Rentals`,
    `(667) 391-7797`,
  ]
    .filter(Boolean)
    .join('\n');
}

export default function BookingActionModal({
  booking,
  action,
  onConfirm,
  onCancel,
  onDone,
  isLoading = false,
  isSuccess = false,
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

  // ---- Phase 2: Notify Customer (after success) ----
  if (isSuccess) {
    const smsBody = buildSmsBody(booking, action, notes);
    const emailSubject = buildEmailSubject(booking, action);
    const emailBody = buildEmailBody(booking, action, notes);

    const smsHref = `sms:${booking.guest_phone}?body=${encodeURIComponent(smsBody)}`;
    const emailHref = `mailto:${booking.guest_email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const phoneHref = `tel:${booking.guest_phone.replace(/\D/g, '')}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              {isApprove ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <h2 className="text-white font-semibold text-lg">
                Booking {isApprove ? 'Approved' : 'Declined'}
              </h2>
            </div>
            <button
              onClick={onDone}
              className="text-white/30 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success message */}
          <div className="px-6 py-5 border-b border-white/5 text-center">
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                isApprove ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}
            >
              {isApprove ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
            </div>
            <p className="text-white text-sm font-medium">
              {booking.guest_name}'s booking has been {isApprove ? 'approved' : 'declined'}.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Let them know with a quick message.
            </p>
          </div>

          {/* Notify options */}
          <div className="px-6 py-5 space-y-3">
            <p className="museo-label text-white/40 text-xs mb-3">
              NOTIFY {booking.guest_name.toUpperCase()}
            </p>

            {/* SMS */}
            <a
              href={smsHref}
              className="flex items-center gap-3 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg px-4 py-3 transition-colors group"
            >
              <MessageSquare className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div className="flex-1 text-left">
                <span className="text-white text-sm font-medium block">
                  Send Text Message
                </span>
                <span className="text-white/30 text-xs">
                  {booking.guest_phone}
                </span>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Email */}
            <a
              href={emailHref}
              className="flex items-center gap-3 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg px-4 py-3 transition-colors group"
            >
              <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div className="flex-1 text-left">
                <span className="text-white text-sm font-medium block">
                  Send Email
                </span>
                <span className="text-white/30 text-xs">
                  {booking.guest_email}
                </span>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Call */}
            <a
              href={phoneHref}
              className="flex items-center gap-3 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg px-4 py-3 transition-colors group"
            >
              <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div className="flex-1 text-left">
                <span className="text-white text-sm font-medium block">
                  Call Customer
                </span>
                <span className="text-white/30 text-xs">
                  {booking.guest_phone}
                </span>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Done */}
          <div className="px-6 py-4 border-t border-white/5">
            <button
              onClick={onDone}
              className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Phase 1: Confirm Action ----
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
