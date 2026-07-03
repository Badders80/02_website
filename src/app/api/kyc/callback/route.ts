import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { setCustomClaims } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';

/**
 * Stripe Identity webhook handler.
 *
 * Required Vercel env vars for this route to work in production:
 * - STRIPE_KYC_WEBHOOK_SECRET (must match Stripe Dashboard → Developers → Webhooks → Identity endpoint secret)
 *   Falls back to STRIPE_WEBHOOK_SECRET if STRIPE_KYC_WEBHOOK_SECRET is not set.
 * - FIREBASE_SERVICE_ACCOUNT_KEY (JSON; service account must have Firebase Authentication Admin role)
 * - FIREBASE_PROJECT_ID (must match NEXT_PUBLIC_FIREBASE_CONFIG)
 */

const WEBHOOK_SECRET = process.env.STRIPE_KYC_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    console.log('[KYC callback] Received webhook. Signature present:', !!sigHeader, 'Secret configured:', !!WEBHOOK_SECRET);

    if (!sigHeader) {
      console.error('[KYC callback] Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      console.error('[KYC callback] STRIPE_KYC_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET) not configured');
      return NextResponse.json(
        { error: 'STRIPE_KYC_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET) not configured' },
        { status: 500 }
      );
    }

    // Verify Stripe signature directly (no GCP)
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, sigHeader, WEBHOOK_SECRET);
      console.log('[KYC callback] Stripe event verified:', event.type, 'id:', event.id);
    } catch (err: any) {
      console.error('[KYC callback] Stripe signature verification failed:', err.message);
      return NextResponse.json({ error: `Signature verification failed: ${err.message}` }, { status: 400 });
    }

    // Handle the event + set claims (this is what gates the purchase flow)
    const session = event.data.object as Stripe.Identity.VerificationSession;

    // Fallback: metadata.user_id is preferred, but client_reference_id is also set in create-session.
    const uid = session.metadata?.user_id || session.client_reference_id;
    const uidSource = session.metadata?.user_id ? 'metadata.user_id' : session.client_reference_id ? 'client_reference_id' : 'none';

    console.log('[KYC callback] Resolved uid source:', uidSource, 'uid:', uid || 'MISSING', 'event:', event.type, 'session:', session.id);

    if (uid) {
      try {
        if (event.type === 'identity.verification_session.verified') {
          await setCustomClaims(uid, { kyc_status: 'verified', role: 'investor' });
          console.log('[KYC callback] Claims set to verified for uid:', uid);
        } else if (event.type === 'identity.verification_session.requires_input') {
          await setCustomClaims(uid, { kyc_status: 'requires_input', kyc_session_id: session.id });
          console.log('[KYC callback] Claims set to requires_input for uid:', uid, 'session:', session.id);
        } else if (event.type === 'identity.verification_session.canceled') {
          await setCustomClaims(uid, { kyc_status: 'canceled' });
          console.log('[KYC callback] Claims set to canceled for uid:', uid);
        } else if (event.type === 'identity.verification_session.processing' || event.type === 'identity.verification_session.created') {
          await setCustomClaims(uid, { kyc_status: 'pending', kyc_session_id: session.id });
          console.log(`[KYC callback] Claims set to pending for uid:`, uid, 'session:', session.id);
        }
      } catch (claimErr: any) {
        console.error('[KYC callback] Failed to set KYC claims for uid:', uid, 'error:', claimErr.message);
        console.error('[KYC callback] Verify the service account key (FIREBASE_SERVICE_ACCOUNT_KEY) has permission for identitytoolkit.googleapis.com (Firebase Authentication Admin role) and the Identity Toolkit API is enabled.');
        // Return 500 so Stripe retries the webhook — the claim update is the critical path.
        return NextResponse.json(
          { error: 'Failed to set Firebase custom claims. Verify FIREBASE_SERVICE_ACCOUNT_KEY has Firebase Authentication Admin role and identitytoolkit API is enabled.' },
          { status: 500 }
        );
      }
    } else {
      console.warn('[KYC callback] KYC webhook event missing user_id in metadata and client_reference_id. Session:', session.id);
    }

    const handled = ['identity.verification_session.verified', 'identity.verification_session.requires_input', 'identity.verification_session.canceled', 'identity.verification_session.processing', 'identity.verification_session.created'];
    if (!handled.includes(event.type)) {
      console.log(`[KYC callback] Unhandled KYC event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[KYC callback] Unexpected webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process KYC webhook' },
      { status: 500 }
    );
  }
}
