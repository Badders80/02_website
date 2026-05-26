import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

const KYC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';

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

    // If calling the deployed Cloud Function, obtain a local gcloud identity token
    if (KYC_API_BASE.includes('cloudfunctions.net')) {
      try {
        const token = execSync('gcloud auth print-identity-token', { encoding: 'utf-8' }).trim();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err: any) {
        console.warn('Failed to obtain gcloud identity token:', err.message);
      }
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
