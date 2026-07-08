import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'module';
import { notifyAlexOfInterest } from '@/lib/notify-alex';

const require = createRequire(import.meta.url);
const SHEET_ID = '1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg';

/**
 * Get a Google OAuth access token using the Firebase service account key.
 * The service account has been granted Firebase Admin role which includes
 * access to the Sheets API via the cloud-platform scope.
 */
async function getAccessToken(): Promise<string> {
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured');
  }

  const key = JSON.parse(keyJson);
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  // Create JWT
  const header = { alg: 'RS256', typ: 'JWT', kid: key.private_key_id };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  };

  // Encode JWT
  const crypto = require('crypto');
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = signer.sign(key.private_key, 'base64url');

  const jwt = `${signInput}.${signature}`;

  // Exchange JWT for access token
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
    const email: string | undefined = body.email;
    const horseSlug: string | undefined = body.horse_slug;
    const horseName: string | undefined = body.horse_name;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // --- Write to Google Sheet (best-effort, don't block email on this) ---
    let sheetWritten = false;
    try {
      const accessToken = await getAccessToken();

      // First, ensure the "Waitlist" tab exists by creating it if needed
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!metaRes.ok) {
        const metaErr = await metaRes.text();
        console.error('Cannot access spreadsheet:', metaRes.status, metaErr);
      } else {
        const meta = await metaRes.json();
        const tabNames = (meta.sheets || []).map((s: any) => s.properties?.title);
        const hasWaitlist = tabNames.includes('Waitlist');

        if (!hasWaitlist) {
          // Create the Waitlist tab
          const createTabRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                requests: [
                  {
                    addSheet: {
                      properties: { title: 'Waitlist' },
                    },
                  },
                ],
              }),
            }
          );

          if (!createTabRes.ok) {
            const createErr = await createTabRes.text();
            console.error('Failed to create Waitlist tab:', createErr);
          }

          // Add headers
          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Waitlist!A1:C1?valueInputOption=USER_ENTERED`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [['Email', 'Timestamp', 'Horse Slug']],
              }),
            }
          );
        }

        // Append to the Waitlist tab
        const range = 'Waitlist!A:C';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[trimmed, new Date().toISOString(), horseSlug || '']],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Google Sheets API error:', response.status, errorText);
        } else {
          sheetWritten = true;
        }
      }
    } catch (sheetErr: any) {
      console.error('[Subscribe] Sheet write failed (non-blocking):', sheetErr.message);
    }

    // --- Send Alex an email notification (always, regardless of sheet status) ---
    if (horseSlug && horseName) {
      try {
        await notifyAlexOfInterest({
          interestedEmail: trimmed,
          horseName,
          horseSlug,
          source: 'guest',
        });
      } catch (emailErr: any) {
        console.error('[Subscribe] Email notification failed:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, sheetWritten });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}