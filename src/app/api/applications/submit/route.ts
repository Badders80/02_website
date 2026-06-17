import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const APPLICATIONS_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, hlt_id, email, name, units_requested, message } = body;

    if (!user_id || !hlt_id || !email || !name || !units_requested) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get GCP identity token (WIF on Vercel, gcloud on local dev)
    // Auto-resolved from x-vercel-oidc-token request header via next/headers
    const gcpToken = await getGcpIdentityToken();
    if (gcpToken) {
      headers['Authorization'] = `Bearer ${gcpToken}`;
    }

    // Forward Firebase user token from the browser request
    const firebaseToken = request.headers.get('x-firebase-token');
    if (firebaseToken) {
      headers['X-Firebase-Token'] = firebaseToken;
    }

    const response = await fetch(`${APPLICATIONS_API_BASE}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        user_id,
        hlt_id,
        email,
        name,
        units_requested,
        message: message || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      return NextResponse.json({ error: error.error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 });
  }
}
