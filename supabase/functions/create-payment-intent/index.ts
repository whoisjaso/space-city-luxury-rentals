import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { stripe } from '../_shared/stripe.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { vehicle_id, start_date, end_date, guest_name, guest_email, guest_phone } =
      await req.json();

    // Look up vehicle pricing
    const supabase = getSupabaseAdmin();
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('name, daily_price_cents')
      .eq('id', vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      return new Response(
        JSON.stringify({ error: 'Vehicle not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Calculate amounts
    const startMs = new Date(start_date).getTime();
    const endMs = new Date(end_date).getTime();
    const days = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
    const rentalAmountCents = vehicle.daily_price_cents * days;
    const securityDepositCents = 50000; // $500 default deposit
    const totalAmountCents = rentalAmountCents + securityDepositCents;

    // Create Stripe PaymentIntent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'usd',
      capture_method: 'manual',
      metadata: {
        vehicle_id,
        start_date,
        end_date,
        guest_name,
        guest_email,
      },
      description: `Space City Rentals - ${vehicle.name} (${start_date} to ${end_date})`,
      receipt_email: guest_email,
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        totalAmountCents,
        rentalAmountCents,
        securityDepositCents,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
