import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil' as any,
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    if (!sigHeader) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'STRIPE_WEBHOOK_SECRET not configured' },
        { status: 500 }
      );
    }

    // Verify Stripe signature directly (no GCP)
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sigHeader, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Stripe signature verification failed:', err.message);
      return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'identity.verification_session.verified':
        const session = event.data.object as Stripe.Identity.VerificationSession;
        console.log('KYC verified for user:', session.metadata?.user_id);
        // TODO: Update user's KYC status (Firebase custom claims or local record)
        break;
      case 'identity.verification_session.requires_attention':
        console.log('KYC requires attention for user:', event.data.object.metadata?.user_id);
        break;
      default:
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