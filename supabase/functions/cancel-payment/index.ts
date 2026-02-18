import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();

    const supabase = getSupabaseAdmin();
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('stripe_payment_intent_id')
      .eq('id', booking_id)
      .single();

    if (fetchError || !booking?.stripe_payment_intent_id) {
      return new Response(
        JSON.stringify({ error: 'Booking or payment intent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const cancelled = await stripe.paymentIntents.cancel(
      booking.stripe_payment_intent_id,
    );

    // Update booking
    await supabase
      .from('bookings')
      .update({ payment_status: 'cancelled' })
      .eq('id', booking_id);

    // Audit log
    await supabase.from('payment_events').insert({
      booking_id,
      event_type: 'cancelled',
      amount_cents: null,
      stripe_event_id: cancelled.id,
      metadata: {},
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
