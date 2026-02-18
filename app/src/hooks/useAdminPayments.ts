import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isDemoMode } from '../lib/supabase';

// ---------------------------------------------------------------
// Admin payment hooks — capture, cancel, and refund payments.
// Each calls a Supabase Edge Function that talks to Stripe
// server-side. Falls back to demo mode when Supabase/Stripe
// are not configured.
// ---------------------------------------------------------------

// ---------- Types ----------

interface CapturePaymentInput {
  booking_id: string;
  capture_amount_cents?: number;
}

interface RefundPaymentInput {
  booking_id: string;
  refund_amount_cents?: number;
}

// ---------- Capture Payment ----------

export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CapturePaymentInput) => {
      if (isDemoMode() || !supabase) {
        await new Promise((r) => setTimeout(r, 500));
        return {
          success: true,
          captured_amount_cents: input.capture_amount_cents ?? 100000,
        };
      }
      const { data, error } = await supabase.functions.invoke(
        'capture-payment',
        { body: input },
      );
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ---------- Cancel Payment (release hold) ----------

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { booking_id: string }) => {
      if (isDemoMode() || !supabase) {
        await new Promise((r) => setTimeout(r, 500));
        return { success: true };
      }
      const { data, error } = await supabase.functions.invoke(
        'cancel-payment',
        { body: input },
      );
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

// ---------- Refund Payment ----------

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RefundPaymentInput) => {
      if (isDemoMode() || !supabase) {
        await new Promise((r) => setTimeout(r, 500));
        return {
          success: true,
          refunded_amount_cents: input.refund_amount_cents ?? 100000,
        };
      }
      const { data, error } = await supabase.functions.invoke(
        'refund-payment',
        { body: input },
      );
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
