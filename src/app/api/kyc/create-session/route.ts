import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const KYC_API_BASE = `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082'}/kyc`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get GCP identity token (WIF on Vercel, gcloud on local dev)
    // Auto-resolved from x-vercel-oidc-token request header via next/headers
    const audience = process.env.NEXT_PUBLIC_API_BASE || 'https://australia-southeast1-evolution-engine.cloudfunctions.net';
    const gcpToken = await getGcpIdentityToken(null, audience);
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

    const response = await fetch(`${KYC_API_BASE}/create-session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        user_id, 
        email, 
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'}/auth/verify` 
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      return NextResponse.json({ error: error.error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create KYC session' }, { status: 500 });
  }
}
