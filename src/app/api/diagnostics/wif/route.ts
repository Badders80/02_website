import { NextRequest, NextResponse } from 'next/server';

/**
 * DORMANT — GCP Cloud Functions retired (billing delinquent).
 * This route performed WIF/STS diagnostics for the retired GCP backend.
 * The backend is gone. Returns 410 Gone to signal the endpoint is permanently retired.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been retired. GCP backend is no longer active.' },
    { status: 410 }
  );
}
