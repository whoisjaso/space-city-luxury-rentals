import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripePromise } from '../lib/stripe';
import { useConfirmBooking } from '../hooks/usePayment';
import type { PaymentIntentResult } from '../hooks/usePayment';

// ---------------------------------------------------------------
// PaymentStep — Stripe Payment Element wrapper with dark luxury
// theme. Shown as step 2 of the booking form when Stripe is
// configured. Handles card authorization and booking confirmation.
// ---------------------------------------------------------------

export interface PaymentStepProps {
  paymentData: PaymentIntentResult;
  bookingDetails: {
    vehicle_id: string;
    vehicleName: string;
    start_date: string;
    end_date: string;
    totalDays: number;
    dailyPriceCents: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    terms_accepted: boolean;
  };
  onSuccess: (booking: { confirmation_code: string }) => void;
  onBack: () => void;
}

// ---------- Inner form with access to Stripe hooks ----------

function PaymentForm({
  paymentData,
  bookingDetails,
  onSuccess,
  onBack,
}: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const confirmBooking = useConfirmBooking();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const formatCents = (cents: number) =>
    `$${(cents / 100).toLocaleString()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/book',
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Payment authorization failed');
      setProcessing(false);
      return;
    }

    // Payment authorized — create the booking record
    try {
      const result = await confirmBooking.mutateAsync({
        paymentIntentId: paymentData.paymentIntentId,
        vehicle_id: bookingDetails.vehicle_id,
        guest_name: bookingDetails.guest_name,
        guest_email: bookingDetails.guest_email,
        guest_phone: bookingDetails.guest_phone,
        start_date: bookingDetails.start_date,
        end_date: bookingDetails.end_date,
        terms_accepted: bookingDetails.terms_accepted,
      });
      onSuccess({ confirmation_code: result.confirmation_code });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create booking',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="museo-label text-[#D4AF37] text-xs">ORDER SUMMARY</h3>

        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">{bookingDetails.vehicleName}</span>
          <span className="text-white/40 text-sm">
            {formatCents(bookingDetails.dailyPriceCents)}/day
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">
            {bookingDetails.totalDays} {bookingDetails.totalDays === 1 ? 'day' : 'days'} rental
          </span>
          <span className="text-white text-sm">
            {formatCents(paymentData.rentalAmountCents)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Security deposit (hold)</span>
          <span className="text-white/40 text-sm">
            {formatCents(paymentData.securityDepositCents)}
          </span>
        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <span className="text-white font-semibold">Total authorization</span>
          <span className="text-[#D4AF37] font-bold text-lg">
            {formatCents(paymentData.totalAmountCents)}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-2 flex-grow-[2] bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-[#D4AF37]/30 disabled:cursor-not-allowed text-[#050505] font-bold py-4 rounded-lg transition-colors duration-300 text-lg tracking-wide flex items-center justify-center gap-3"
        >
          {processing ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            'Authorize & Reserve'
          )}
        </button>
      </div>

      <p className="text-white/30 text-xs text-center">
        Your card will be authorized for the full amount but not charged until
        your booking is confirmed by our team.
      </p>
    </form>
  );
}

// ---------- Outer wrapper providing Stripe Elements ----------

export default function PaymentStep(props: PaymentStepProps) {
  const stripePromise = getStripePromise();

  // Dark luxury theme for Stripe Elements
  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#D4AF37',
      colorBackground: '#0a0a0a',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: '"Inter", system-ui, sans-serif',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      },
      '.Input:focus': {
        borderColor: 'rgba(212,175,55,0.4)',
        boxShadow: '0 0 0 2px rgba(212,175,55,0.3)',
      },
      '.Label': {
        color: 'rgba(255,255,255,0.5)',
      },
    },
  };

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.paymentData.clientSecret,
        appearance,
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}
