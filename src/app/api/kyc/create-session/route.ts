import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
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
    try {
      const decoded = await verifyIdToken(token);
      verifiedUid = decoded.uid;
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = bodyUserId || verifiedUid;
    if (userId !== verifiedUid) {
      return NextResponse.json({ error: 'user_id mismatch with token' }, { status: 403 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalReturnUrl = return_url || `${appUrl}/auth/verify`;

    // Create Stripe Identity verification session directly
    const session = await getStripe().identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: userId,
        email: email || '',
      },
      return_url: finalReturnUrl,
    });

    return NextResponse.json({ session_url: session.url, session_id: session.id });
  } catch (error: any) {
    console.error('KYC session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create KYC session' },
      { status: 500 }
    );
  }
}