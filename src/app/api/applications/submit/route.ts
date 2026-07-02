import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/sheets-write';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, hlt_id, email, name, units_requested, message } = body;

    if (!hlt_id || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: hlt_id, email, name' },
        { status: 400 }
      );
    }

    const record = {
      user_id: user_id || '',
      hlt_id,
      email,
      name,
      units_requested: units_requested ?? 1,
      message: message || '',
      submitted_at: new Date().toISOString(),
    };

    // Fire-and-forget write to Google Sheet Applications tab
    appendToSheet('Applications', [
      record.submitted_at,
      record.user_id,
      record.hlt_id,
      record.email,
      record.name,
      record.units_requested,
      record.message,
    ]).catch((e) => console.error('Sheets write failed:', e));

    return NextResponse.json({ success: true, application: record });
  } catch (error: any) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}