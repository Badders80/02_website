import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { setCustomClaims } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';

const WEBHOOK_SECRET = process.env.STRIPE_KYC_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    if (!sigHeader) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'STRIPE_KYC_WEBHOOK_SECRET not configured' },
        { status: 500 }
      );
    }

    // Verify Stripe signature directly (no GCP)
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, sigHeader, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Stripe signature verification failed:', err.message);
      return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
    }

    // Handle the event + set claims (this is what gates the purchase flow)
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const uid = session.metadata?.user_id;

    if (uid) {
      try {
        if (event.type === 'identity.verification_session.verified') {
          await setCustomClaims(uid, { kyc_status: 'verified', role: 'investor' });
          console.log('KYC verified + claims set for user:', uid);
        } else if (event.type === 'identity.verification_session.requires_input') {
          await setCustomClaims(uid, { kyc_status: 'requires_input' });
          console.log('KYC requires_input + claims set for user:', uid);
        } else if (event.type === 'identity.verification_session.canceled') {
          await setCustomClaims(uid, { kyc_status: 'canceled' });
          console.log('KYC canceled + claims set for user:', uid);
        }
      } catch (claimErr: any) {
        console.error('Failed to set KYC claims (admin key missing?):', claimErr.message);
      }
    } else {
      console.warn('KYC webhook event missing user_id in metadata');
    }

    if (!['identity.verification_session.verified', 'identity.verification_session.requires_input', 'identity.verification_session.canceled'].includes(event.type)) {
      console.log(`Unhandled KYC event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('KYC webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process KYC webhook' },
      { status: 500 }
    );
  }
}