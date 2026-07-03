import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, setCustomClaims } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id: bodyUserId, email, return_url } = body;

    // Verify caller via Firebase ID token (sent as Bearer)
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let verifiedUid: string;
    let decoded: any = null;
    try {
      decoded = await verifyIdToken(token);
      verifiedUid = decoded.uid;
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = bodyUserId || verifiedUid;
    if (userId !== verifiedUid) {
      return NextResponse.json({ error: 'user_id mismatch with token' }, { status: 403 });
    }

    // Robust resume logic (addresses handoff / "new session every click" loops in Stripe hosted flow):
    // 1. Fast path: if claims have kyc_session_id from prior create/webhook, try retrieve.
    // 2. Authoritative fallback: list recent sessions filtered by client_reference_id (Stripe-side index by user).
    // This works even if custom claims update is delayed or the setCustomClaims call had issues.
    // We will also set client_reference_id on creation below.
    let reusedSession: any = null;

    // Fast path from claims
    const existingSessionId: string | undefined = decoded ? (decoded as any).kyc_session_id : undefined;
    if (existingSessionId) {
      try {
        const existing = await getStripe().identity.verificationSessions.retrieve(existingSessionId);
        if (existing && (existing.status === 'processing' || existing.status === 'requires_input')) {
          reusedSession = existing;
        }
      } catch (retrieveErr: any) {
        console.warn('KYC reuse retrieve by id failed (will try list):', retrieveErr.message);
      }
    }

    // Robust list-based resume (always authoritative)
    if (!reusedSession) {
      try {
        const listRes = await getStripe().identity.verificationSessions.list({
          limit: 5,
          client_reference_id: userId,
        });
        const open = listRes.data.find((s: any) => s.status === 'processing' || s.status === 'requires_input');
        if (open) {
          reusedSession = open;
        }
      } catch (listErr: any) {
        console.warn('KYC list resume by client_reference_id failed:', listErr.message);
      }
    }

    if (reusedSession) {
      console.log('KYC resuming existing session for user', userId, 'session', reusedSession.id);
      return NextResponse.json({
        session_url: reusedSession.url,
        url: reusedSession.url,
        session_id: reusedSession.id,
        reused: true,
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'https://www.evolutionstables.nz';
    const finalReturnUrl = return_url || `${appUrl}/auth/verify?from=stripe`;

    // Create Stripe Identity verification session directly
    // client_reference_id enables reliable list({client_reference_id}) resume above.
    const session = await getStripe().identity.verificationSessions.create({
      type: 'document',
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        email: email || '',
      },
      return_url: finalReturnUrl,
    });

    // Immediately set pending + session id in claims (UI shows progress; enables fast resume on next CTA click)
    try {
      await setCustomClaims(userId, { kyc_status: 'pending', kyc_session_id: session.id });
    } catch (claimErr: any) {
      console.warn('KYC create: failed to set pending claim (non-fatal). Verify FIREBASE_SERVICE_ACCOUNT_KEY has identitytoolkit scope + Firebase Auth Admin role:', claimErr.message);
    }

    return NextResponse.json({
      session_url: session.url,
      url: session.url,
      session_id: session.id,
    });
  } catch (error: any) {
    console.error('KYC session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create KYC session' },
      { status: 500 }
    );
  }
}