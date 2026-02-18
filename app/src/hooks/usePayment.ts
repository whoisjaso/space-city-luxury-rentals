import { useMutation } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { isPaymentDemoMode } from '../lib/stripe';

// ---------------------------------------------------------------
// Payment hooks — create PaymentIntent and confirm booking after
// Stripe authorizes the card. Falls back to demo mode when Stripe
// is not configured.
// ---------------------------------------------------------------

// ---------- Types ----------

export interface CreatePaymentIntentInput {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  totalAmountCents: number;
  rentalAmountCents: number;
  securityDepositCents: number;
}

export interface ConfirmBookingInput {
  paymentIntentId: string;
  vehicle_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  start_date: string;
  end_date: string;
  terms_accepted: boolean;
}

// ---------- Create PaymentIntent ----------

async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<PaymentIntentResult> {
  if (isPaymentDemoMode() || !supabaseConfigured || !supabase) {
    // Demo mode: return mock data
    await new Promise((r) => setTimeout(r, 500));
    return {
      clientSecret: 'demo_secret_xxx',
      paymentIntentId: 'demo_pi_xxx',
      totalAmountCents: 100000,
      rentalAmountCents: 50000,
      securityDepositCents: 50000,
    };
  }

  const { data, error } = await supabase.functions.invoke(
    'create-payment-intent',
    { body: input },
  );

  if (error) throw new Error(error.message || 'Failed to create payment intent');
  return data as PaymentIntentResult;
}

export function useCreatePaymentIntent() {
  return useMutation<PaymentIntentResult, Error, CreatePaymentIntentInput>({
    mutationFn: createPaymentIntent,
  });
}

// ---------- Confirm Booking (after Stripe authorization) ----------

async function confirmBooking(
  input: ConfirmBookingInput,
): Promise<{ confirmation_code: string }> {
  if (isPaymentDemoMode() || !supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 800));
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return { confirmation_code: code };
  }

  const { data, error } = await supabase.functions.invoke('confirm-booking', {
    body: input,
  });

  if (error) throw new Error(error.message || 'Failed to confirm booking');
  return data as { confirmation_code: string };
}

export function useConfirmBooking() {
  return useMutation<{ confirmation_code: string }, Error, ConfirmBookingInput>({
    mutationFn: confirmBooking,
  });
}
