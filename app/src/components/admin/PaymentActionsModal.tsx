import { useState } from 'react';
import { X, DollarSign, RotateCcw } from 'lucide-react';
import type { BookingWithVehicle } from '../../hooks/useAdminBookings';
import type { PaymentStatus } from '../../types/database';
import { useCapturePayment, useRefundPayment } from '../../hooks/useAdminPayments';

// ---------------------------------------------------------------
// PaymentActionsModal — admin modal for capturing authorized
// payments or issuing refunds on captured payments.
// ---------------------------------------------------------------

interface PaymentActionsModalProps {
  booking: BookingWithVehicle;
  onClose: () => void;
}

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string }
> = {
  none: { label: 'No Payment', color: 'text-white/30', bg: 'bg-white/5' },
  authorized: { label: 'Authorized', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  captured: { label: 'Captured', color: 'text-green-400', bg: 'bg-green-500/10' },
  cancelled: { label: 'Released', color: 'text-white/40', bg: 'bg-white/5' },
  refunded: { label: 'Refunded', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  partially_refunded: {
    label: 'Partial Refund',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
};

function formatCents(cents: number | null | undefined): string {
  if (cents == null) return '$0';
  return `$${(cents / 100).toLocaleString()}`;
}

export default function PaymentActionsModal({
  booking,
  onClose,
}: PaymentActionsModalProps) {
  const [captureAmount, setCaptureAmount] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [confirming, setConfirming] = useState<'capture' | 'refund' | null>(null);

  const capturePayment = useCapturePayment();
  const refundPayment = useRefundPayment();

  const paymentCfg = PAYMENT_STATUS_CONFIG[booking.payment_status];
  const canCapture = booking.payment_status === 'authorized';
  const canRefund =
    booking.payment_status === 'captured' ||
    booking.payment_status === 'partially_refunded';

  const maxRefund =
    (booking.captured_amount_cents ?? 0) - (booking.refunded_amount_cents ?? 0);

  const handleCapture = () => {
    const amountCents = captureAmount
      ? Math.round(parseFloat(captureAmount) * 100)
      : undefined;

    capturePayment.mutate(
      { booking_id: booking.id, capture_amount_cents: amountCents },
      { onSuccess: () => onClose() },
    );
  };

  const handleRefund = () => {
    const amountCents = refundAmount
      ? Math.round(parseFloat(refundAmount) * 100)
      : undefined;

    refundPayment.mutate(
      { booking_id: booking.id, refund_amount_cents: amountCents },
      { onSuccess: () => onClose() },
    );
  };

  const inputClass =
    'w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white text-sm museo-body placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-[#D4AF37]/40 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white font-semibold text-lg">Payment Actions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment summary */}
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
            <span className="text-white/40 text-sm">Payment Status</span>
            <span
              className={`inline-flex items-center gap-1.5 ${paymentCfg.bg} rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${paymentCfg.color}`}
            >
              {paymentCfg.label}
            </span>
          </div>
          <div className="border-t border-white/5 pt-2 mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Authorized</span>
              <span className="text-white/60 text-sm">
                {formatCents(booking.total_amount_cents)}
              </span>
            </div>
            {booking.captured_amount_cents != null && (
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Captured</span>
                <span className="text-green-400 text-sm">
                  {formatCents(booking.captured_amount_cents)}
                </span>
              </div>
            )}
            {(booking.refunded_amount_cents ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Refunded</span>
                <span className="text-orange-400 text-sm">
                  {formatCents(booking.refunded_amount_cents)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 space-y-4">
          {canCapture && (
            <div className="space-y-3">
              <p className="museo-label text-white/40 text-xs">CAPTURE PAYMENT</p>
              {confirming === 'capture' ? (
                <>
                  <input
                    type="number"
                    value={captureAmount}
                    onChange={(e) => setCaptureAmount(e.target.value)}
                    placeholder={`Full amount: ${formatCents(booking.total_amount_cents)}`}
                    step="0.01"
                    min="0"
                    className={inputClass}
                  />
                  <p className="text-white/30 text-xs">
                    Leave empty to capture the full authorized amount. Enter a
                    dollar amount for partial capture.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirming(null)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCapture}
                      disabled={capturePayment.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {capturePayment.isPending ? 'Processing...' : 'Confirm Capture'}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setConfirming('capture')}
                  className="w-full flex items-center justify-center gap-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Capture Payment
                </button>
              )}
            </div>
          )}

          {canRefund && (
            <div className="space-y-3">
              <p className="museo-label text-white/40 text-xs">ISSUE REFUND</p>
              {confirming === 'refund' ? (
                <>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Remaining: ${formatCents(maxRefund)}`}
                    step="0.01"
                    min="0"
                    className={inputClass}
                  />
                  <p className="text-white/30 text-xs">
                    Leave empty for full refund of remaining balance. Enter a
                    dollar amount for partial refund.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirming(null)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRefund}
                      disabled={refundPayment.isPending}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {refundPayment.isPending ? 'Processing...' : 'Confirm Refund'}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setConfirming('refund')}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/20 text-orange-400 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Issue Refund
                </button>
              )}
            </div>
          )}

          {!canCapture && !canRefund && (
            <p className="text-white/30 text-sm text-center py-4">
              No payment actions available for this booking.
            </p>
          )}
        </div>

        {/* Close button */}
        <div className="px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
