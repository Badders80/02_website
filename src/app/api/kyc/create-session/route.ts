import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, setCustomClaims } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';

/**
 * KYC session creation / resume / sync endpoint.
 *
 * Required Vercel env vars for this route to work in production:
 * - STRIPE_SECRET_KEY
 * - FIREBASE_SERVICE_ACCOUNT_KEY (JSON; service account must have Firebase Authentication Admin role)
 * - FIREBASE_PROJECT_ID (must match NEXT_PUBLIC_FIREBASE_CONFIG)
 * - NEXT_PUBLIC_APP_URL = https://www.evolutionstables.nz (used for return_url)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id: bodyUserId, email, return_url } = body;

    // Verify caller via Firebase ID token (sent as Bearer)
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      console.error('[KYC create-session] Missing Authorization Bearer token');
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let verifiedUid: string;
    let decoded: any = null;
    try {
      decoded = await verifyIdToken(token);
      verifiedUid = decoded.uid;
      console.log('[KYC create-session] Token verified for uid:', verifiedUid);
    } catch (e: any) {
      console.error('[KYC create-session] Invalid or expired token:', e.message);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = bodyUserId || verifiedUid;
    if (userId !== verifiedUid) {
      console.error('[KYC create-session] user_id mismatch: body=', bodyUserId, 'token=', verifiedUid);
      return NextResponse.json({ error: 'user_id mismatch with token' }, { status: 403 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[KYC create-session] STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    // Robust list for resume or verified sync (fixes missed webhooks / stale claims)
    // List recent sessions and filter client-side by metadata.user_id or client_reference_id
    // (catches both old sessions that only had metadata and new ones with client_reference_id)
    let listRes: any = { data: [] };
    try {
      console.log('[KYC create-session] Listing recent Stripe sessions for uid:', userId);
      listRes = await getStripe().identity.verificationSessions.list({
        limit: 10,  // small list, filter client-side to be robust for historical sessions
      });
      console.log(`[KYC create-session] Stripe returned ${listRes.data.length} recent session(s)`);
    } catch (listErr: any) {
      console.error('[KYC create-session] Stripe list failed:', listErr.message);
      return NextResponse.json(
        { error: `Stripe list failed: ${listErr.message}` },
        { status: 502 }
      );
    }

    const matching = listRes.data.filter((s: any) =>
      (s.metadata && s.metadata.user_id === userId) || s.client_reference_id === userId
    );
    console.log(`[KYC create-session] ${matching.length} session(s) matched uid ${userId}`);

    // Resume open session (handoff loop fix) - most recent first from the list
    const open = matching.find((s: any) => s.status === 'processing' || s.status === 'requires_input');
    if (open) {
      console.log('[KYC create-session] Resuming existing session for uid:', userId, 'session:', open.id, 'status:', open.status);
      return NextResponse.json({
        session_url: open.url,
        url: open.url,
        session_id: open.id,
        status: open.status,
        reused: true,
      });
    }

    // Sync verified if found (handles past webhook fail due to secret or lag)
    const verified = matching.find((s: any) => s.status === 'verified');
    if (verified) {
      try {
        await setCustomClaims(userId, { kyc_status: 'verified', role: 'investor' });
        console.log('[KYC create-session] Synced verified claims from Stripe session for uid:', userId, 'session:', verified.id);
        return NextResponse.json({
          verified: true,
          session_id: verified.id,
        });
      } catch (claimErr: any) {
        console.error('[KYC create-session] Failed to sync verified claims for uid:', userId, 'error:', claimErr.message);
        return NextResponse.json(
          { error: `Failed to set verified claims: ${claimErr.message}` },
          { status: 500 }
        );
      }
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'https://www.evolutionstables.nz';
    const finalReturnUrl = return_url || `${appUrl}/auth/verify?from=stripe`;

    // Create Stripe Identity verification session directly
    // client_reference_id enables reliable list({client_reference_id}) resume above.
    console.log('[KYC create-session] Creating new Stripe Identity session for uid:', userId);
    const session = await getStripe().identity.verificationSessions.create({
      type: 'document',
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        email: email || '',
      },
      return_url: finalReturnUrl,
    });
    console.log('[KYC create-session] Created session:', session.id, 'for uid:', userId);

    // Immediately set pending + session id in claims (UI shows progress; enables fast resume on next CTA click)
    try {
      await setCustomClaims(userId, { kyc_status: 'pending', kyc_session_id: session.id });
      console.log('[KYC create-session] Set pending claims for uid:', userId, 'session:', session.id);
    } catch (claimErr: any) {
      console.warn('[KYC create-session] Failed to set pending claim (non-fatal). Verify FIREBASE_SERVICE_ACCOUNT_KEY has identitytoolkit scope + Firebase Auth Admin role:', claimErr.message);
    }

    return NextResponse.json({
      session_url: session.url,
      url: session.url,
      session_id: session.id,
      status: 'pending',
    });
  } catch (error: any) {
    console.error('[KYC create-session] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create KYC session' },
      { status: 500 }
    );
  }
}
