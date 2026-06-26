import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  stripeClient = new Stripe(key, {
    apiVersion: '2025-06-30.basil' as any,
  });

  return stripeClient;
}