import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const APPLICATIONS_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';

export async function GET(request: NextRequest) {
  try {
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

    const response = await fetch(`${APPLICATIONS_API_BASE}/list`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      return NextResponse.json({ error: error.error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}
