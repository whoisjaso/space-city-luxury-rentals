import { loadStripe, type Stripe } from '@stripe/stripe-js';

// ---------------------------------------------------------------
// Stripe is optional — when the publishable key is missing or
// still a placeholder, payment features are skipped and the app
// falls back to the existing booking flow without payment.
// ---------------------------------------------------------------

const stripePublishableKey = String(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
).replace(/\s/g, '');

export const stripeConfigured = Boolean(
  stripePublishableKey &&
    stripePublishableKey !== 'your-stripe-publishable-key'
);

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripeConfigured) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
}

/**
 * Returns true when Stripe is not configured and the payment step
 * should be skipped. Works in tandem with isDemoMode() from supabase.ts.
 */
export function isPaymentDemoMode(): boolean {
  return !stripeConfigured;
}
