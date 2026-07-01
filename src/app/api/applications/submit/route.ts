import { NextRequest, NextResponse } from 'next/server';

const SHEETS_WEB_APP_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL || '';

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

    if (SHEETS_WEB_APP_URL) {
      try {
        const res = await fetch(SHEETS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'append_application',
            row: record,
          }),
        });

        if (!res.ok) {
          console.warn('Sheets web app responded', res.status, await res.text().catch(() => ''));
        } else {
          console.log('Application appended to sheets via web app');
        }
      } catch (e: any) {
        console.error('Failed to append application via sheets web app:', e.message);
      }
    } else {
      console.log('No GOOGLE_SHEETS_WEB_APP_URL — application record (sync manually):', record);
    }

    return NextResponse.json({ success: true, application: record });
  } catch (error: any) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
