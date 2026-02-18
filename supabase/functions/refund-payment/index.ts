import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { booking_id, refund_amount_cents } = await req.json();

    const supabase = getSupabaseAdmin();
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('stripe_payment_intent_id, captured_amount_cents, refunded_amount_cents')
      .eq('id', booking_id)
      .single();

    if (fetchError || !booking?.stripe_payment_intent_id) {
      return new Response(
        JSON.stringify({ error: 'Booking or payment intent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const refundAmount =
      refund_amount_cents ?? (booking.captured_amount_cents! - (booking.refunded_amount_cents ?? 0));

    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      amount: refundAmount,
    });

    const newRefundedTotal = (booking.refunded_amount_cents ?? 0) + refundAmount;
    const isFullRefund = newRefundedTotal >= (booking.captured_amount_cents ?? 0);

    // Update booking
    await supabase
      .from('bookings')
      .update({
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        refunded_amount_cents: newRefundedTotal,
      })
      .eq('id', booking_id);

    // Audit log
    await supabase.from('payment_events').insert({
      booking_id,
      event_type: isFullRefund ? 'refunded' : 'partial_refund',
      amount_cents: refundAmount,
      stripe_event_id: refund.id,
      metadata: {},
    });

    return new Response(
      JSON.stringify({ success: true, refunded_amount_cents: refundAmount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
