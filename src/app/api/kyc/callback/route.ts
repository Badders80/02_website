import { NextRequest, NextResponse } from 'next/server';
import { getGcpIdentityToken } from '@/lib/gcp-auth';

const KYC_API_BASE = `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082'}/kyc`;

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

    // Obtain GCP identity token to call the private Cloud Function
    const gcpToken = await getGcpIdentityToken(null, KYC_API_BASE);
    if (gcpToken) {
      headers['Authorization'] = `Bearer ${gcpToken}`;
    }

    const response = await fetch(`${KYC_API_BASE}/webhook`, {
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
    return NextResponse.json({ error: error.message || 'Failed to process KYC webhook proxy' }, { status: 500 });
  }
}
