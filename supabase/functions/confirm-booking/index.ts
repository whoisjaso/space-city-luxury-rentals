import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      paymentIntentId,
      vehicle_id,
      guest_name,
      guest_email,
      guest_phone,
      start_date,
      end_date,
      terms_accepted,
    } = await req.json();

    // Verify the PaymentIntent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'requires_capture') {
      return new Response(
        JSON.stringify({
          error: `Payment not authorized. Status: ${paymentIntent.status}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Insert booking with payment data
    const supabase = getSupabaseAdmin();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        vehicle_id,
        guest_name,
        guest_email,
        guest_phone,
        start_date,
        end_date,
        terms_accepted,
        status: 'pending',
        admin_notes: null,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: 'authorized',
        total_amount_cents: paymentIntent.amount,
        security_deposit_cents: 50000,
        captured_amount_cents: null,
        refunded_amount_cents: 0,
      })
      .select('confirmation_code')
      .single();

    if (bookingError) {
      return new Response(
        JSON.stringify({ error: bookingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Log the authorization event
    await supabase.from('payment_events').insert({
      booking_id: booking.id ?? booking.confirmation_code,
      event_type: 'authorized',
      amount_cents: paymentIntent.amount,
      stripe_event_id: paymentIntentId,
      metadata: { start_date, end_date, vehicle_id },
    });

    return new Response(
      JSON.stringify({ confirmation_code: booking.confirmation_code }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
