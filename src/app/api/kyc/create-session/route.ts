import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with server-side secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil' as any,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Identity verification session directly
    const session = await stripe.identity.VerificationSession.create({
      type: 'document',
      metadata: {
        user_id,
        email: email || '',
      },
      return_url: `${appUrl}/auth/verify`,
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