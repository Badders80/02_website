import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const PAYMENTS_API_BASE = process.env.PAYMENTS_API_BASE || 
  (process.env.NEXT_PUBLIC_API_BASE 
    ? `${process.env.NEXT_PUBLIC_API_BASE.replace(/\/ssot|\/assets|\/kyc/g, '')}/payments`
    : 'http://localhost:8083');

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    if (!sigHeader) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Stripe-Signature': sigHeader,
    };

    // Get GCP identity token via WIF (Vercel OIDC → GCP STS → SA identity token)
    const gcpToken = await getGcpIdentityToken(null, PAYMENTS_API_BASE);
    if (gcpToken) {
      headers['Authorization'] = `Bearer ${gcpToken}`;
    }

    const response = await fetch(`${PAYMENTS_API_BASE}/webhook`, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Backend webhook error: ${error}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process webhook proxy' }, { status: 500 });
  }
}
