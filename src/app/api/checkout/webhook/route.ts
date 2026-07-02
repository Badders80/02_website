import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { appendToSheet } from '@/lib/sheets-write';

const WEBHOOK_SECRET = process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    if (!sigHeader) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'STRIPE_CHECKOUT_WEBHOOK_SECRET not configured' },
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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        const record = {
          user_email: meta.user_email || '',
          hlt_id: meta.hlt_id || '',
          shares_owned: parseInt(meta.shares_to_buy || '0', 10),
          purchase_date: new Date().toISOString().split('T')[0],
          kyc_status: 'verified',
          stripe_session_id: session.id,
          horse_microchip: meta.horse_microchip || '',
        };

        console.log('Payment completed:', record);

        // Fire-and-forget write to Google Sheet Holdings tab
        appendToSheet('Holdings', [
          record.user_email,
          record.hlt_id,
          record.shares_owned,
          record.purchase_date,
          record.kyc_status,
          record.stripe_session_id,
          record.horse_microchip,
        ]).catch((e) => console.error('Sheets write failed:', e));
        break;
      }

      case 'checkout.session.expired':
        console.log('Checkout session expired:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled checkout event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Checkout webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process checkout webhook' },
      { status: 500 }
    );
  }
}