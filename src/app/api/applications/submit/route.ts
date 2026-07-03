import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const SHEET_ID = '1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg';

/**
 * Get a Google OAuth access token using the Firebase service account key.
 */
async function getAccessToken(): Promise<string> {
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured');
  }

  const key = JSON.parse(keyJson);
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT', kid: key.private_key_id };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  };

  const crypto = require('crypto');
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = signer.sign(key.private_key, 'base64url');

  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${tokenRes.status} ${err}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, hlt_id, email, name, units_requested, message } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (e: any) {
      console.error('Failed to get access token:', e.message);
      return NextResponse.json(
        { error: 'Server not configured for applications' },
        { status: 503 }
      );
    }

    // Ensure the "Applications" tab exists
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!metaRes.ok) {
      console.error('Cannot access spreadsheet:', metaRes.status);
      return NextResponse.json(
        { error: 'Cannot access spreadsheet' },
        { status: 502 }
      );
    }

    const meta = await metaRes.json();
    const tabNames = (meta.sheets || []).map((s: any) => s.properties?.title);
    const hasApplications = tabNames.includes('Applications');

    if (!hasApplications) {
      // Create the Applications tab
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              { addSheet: { properties: { title: 'Applications' } } },
            ],
          }),
        }
      );

      // Add headers
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Applications!A1:G1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [['Timestamp', 'User ID', 'HLT ID', 'Email', 'Name', 'Units', 'Message']],
          }),
        }
      );
    }

    // Append the application row
    const range = 'Applications!A:G';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[
          new Date().toISOString(),
          user_id || '',
          hlt_id || '',
          email,
          name || '',
          units_requested || 0,
          message || '',
        ]],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to save application' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}