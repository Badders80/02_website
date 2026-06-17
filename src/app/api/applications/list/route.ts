import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const APPLICATIONS_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';

export async function GET(request: NextRequest) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get GCP identity token (WIF on Vercel, gcloud on local dev)
    const oidcToken = request.headers.get('x-vercel-oidc-token');
    const gcpToken = await getGcpIdentityToken(oidcToken);
    if (gcpToken) {
      headers['Authorization'] = `Bearer ${gcpToken}`;
    }

    // Forward Firebase user token from the browser request
    const firebaseToken = request.headers.get('x-firebase-token');
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
