import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, setCustomClaims } from '@/lib/supabase-admin-auth';
import { getStripe } from '@/lib/stripe';

/**
 * GET /api/kyc/status
 *
 * Lightweight server-side KYC status check. Verifies the caller, asks Stripe
 * for the latest Identity VerificationSession by client_reference_id, syncs
 * verified sessions to Supabase app_metadata claims, and returns the current status.
 *
 * Required Vercel env vars:
 * - STRIPE_SECRET_KEY
 * - SUPABASE_SERVICE_ROLE_KEY (service-role writes KYC claims to auth.users)
 * - GOOGLE_SERVICE_ACCOUNT (Sheets legacy) not required for claims
 * - NEXT_PUBLIC_APP_URL = https://www.evolutionstables.nz
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      console.error('[KYC status] missing Bearer token');
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let decoded: any = null;
    try {
      decoded = await verifyIdToken(token);
    } catch (e: any) {
      console.error('[KYC status] token verification failed:', e.message);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const uid = decoded.uid;
    console.log('[KYC status] checking Stripe status for uid', uid);

    let listRes: any = { data: [] };
    try {
      listRes = await getStripe().identity.verificationSessions.list({
        limit: 5,
        client_reference_id: uid,
      });
      console.log(
        '[KYC status] stripe list returned',
        listRes.data.map((s: any) => ({ id: s.id, status: s.status }))
      );
    } catch (listErr: any) {
      console.error('[KYC status] stripe list failed:', listErr.message);
      return NextResponse.json({ error: 'Failed to fetch Stripe status' }, { status: 502 });
    }

    const verified = listRes.data.find((s: any) => s.status === 'verified');
    if (verified) {
      console.log('[KYC status] verified session found', verified.id, 'for uid', uid, 'syncing claims');
      try {
        await setCustomClaims(uid, { kyc_status: 'verified', role: 'investor' });
        console.log('[KYC status] synced verified claims for uid', uid);
        return NextResponse.json({ kyc_status: 'verified', session_id: verified.id });
      } catch (claimErr: any) {
        console.error('[KYC status] FAILED to sync verified claims for uid', uid, ':', claimErr.message);
        return NextResponse.json(
          { error: 'Verified by Stripe but failed to update KYC claims' },
          { status: 500 }
        );
      }
    }

    // Return the most recent session status from Stripe.
    const latest = listRes.data[0];
    const currentStatus = latest?.status || 'none';
    console.log('[KYC status] returning status', currentStatus, 'for uid', uid, 'session', latest?.id || 'none');

    return NextResponse.json({
      kyc_status: currentStatus,
      session_id: latest?.id || null,
    });
  } catch (error: any) {
    console.error('[KYC status] unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get KYC status' },
      { status: 500 }
    );
  }
}
