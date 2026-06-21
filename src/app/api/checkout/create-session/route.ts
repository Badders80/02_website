import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const PAYMENTS_API_BASE = process.env.PAYMENTS_API_BASE || 
  (process.env.NEXT_PUBLIC_API_BASE 
    ? `${process.env.NEXT_PUBLIC_API_BASE.replace(/\/ssot|\/assets|\/kyc/g, '')}/payments`
    : 'http://localhost:8083');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, hlt_id, shares_to_buy, bypass_kyc } = body;

    if (!user_id || !hlt_id || !shares_to_buy) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get GCP identity token via WIF (Vercel OIDC → GCP STS → SA identity token)
    const gcpToken = await getGcpIdentityToken(null, PAYMENTS_API_BASE);
    if (gcpToken) {
      headers['Authorization'] = `Bearer ${gcpToken}`;
    }

    // Forward Firebase user token from the browser request
    let firebaseToken = request.headers.get('x-firebase-token');
    if (!firebaseToken) {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        firebaseToken = authHeader.split('Bearer ')[1];
      }
    }
    if (firebaseToken) {
      headers['X-Firebase-Token'] = firebaseToken;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';

    const response = await fetch(`${PAYMENTS_API_BASE}/create-session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        user_id, 
        hlt_id, 
        shares_to_buy,
        bypass_kyc: bypass_kyc || false,
        success_url: `${appUrl}/mystable?success=true`, 
        cancel_url: `${appUrl}/marketplace/${hlt_id}` 
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      return NextResponse.json({ error: error.error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to initiate Stripe Checkout session' }, { status: 500 });
  }
}
