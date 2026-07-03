import { NextRequest, NextResponse } from 'next/server';

const SHEET_ID = '1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg';
const OAUTH_TOKEN = process.env.GOOGLE_OAUTH_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email validation
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!OAUTH_TOKEN) {
      console.error('GOOGLE_OAUTH_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server not configured for email capture' },
        { status: 503 }
      );
    }

    // Append to Google Sheet using the Sheets API directly
    const range = 'Waitlist!A:B';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OAUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[trimmed, new Date().toISOString()]],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);

      // If the sheet/tab doesn't exist, try creating it
      if (response.status === 400 || response.status === 404) {
        // Fallback: append to the first sheet (Sheet1)
        const fallbackRange = 'Sheet1!A:B';
        const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(fallbackRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OAUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [['Waitlist', trimmed, new Date().toISOString()]],
          }),
        });

        if (!fallbackRes.ok) {
          const fbError = await fallbackRes.text();
          console.error('Fallback sheet append also failed:', fallbackRes.status, fbError);
          return NextResponse.json(
            { error: 'Failed to save email — sheet configuration issue' },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to save email' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}