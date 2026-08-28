import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'module';
import { notifyAlexOfInterest } from '@/lib/notify-alex';

const require = createRequire(import.meta.url);

/**
 * Interest Signups — canonical lead sheet (CTA + waitlist).
 * Share Editor with: evolution-web-admin@evolution-engine.iam.gserviceaccount.com
 * Override via LEADS_SPREADSHEET_ID env if needed.
 */
const LEADS_SHEET_ID =
  process.env.LEADS_SPREADSHEET_ID ||
  '1r1tLSTKIrcjxfn6NPGIfnmmj9GGebKXat8EZXMTHEyk';

/** Legacy inventory sheet Waitlist tab — fallback only if primary write fails. */
const LEGACY_WAITLIST_SHEET_ID =
  process.env.LEGACY_WAITLIST_SHEET_ID ||
  '1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg';

/** Sheet1 columns (matches imported supabase/leads export). */
const LEADS_TAB = process.env.LEADS_SHEET_TAB || 'Sheet1';

/**
 * Get a Google OAuth access token using the Google service account key (Sheets API only — not user auth).
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

/** Match existing Sheet1 timestamps: DD/MM/YYYY HH:mm:ss */
function formatSheetTimestamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function appendRows(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<{ ok: boolean; error?: string }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
  if (!response.ok) {
    return { ok: false, error: `${response.status} ${await response.text()}` };
  }
  return { ok: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string | undefined = body.email;
    const horseSlug: string | undefined = body.horse_slug;
    const horseName: string | undefined = body.horse_name;
    const rawCampaign: string | undefined =
      body.campaign_key || body.campaignKey || body.utm_campaign;
    const rawSource: string | undefined = body.source || body.utm_source;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const sanitizeKey = (v: unknown) =>
      String(v || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .slice(0, 64);

    const ts = formatSheetTimestamp();
    // Attribution priority: horse waitlist > post/campaign param (e.g. linkedin) > default about CTA
    const campaignKey = horseSlug
      ? `marketplace_${horseSlug}`
      : sanitizeKey(rawCampaign) || 'about_join_evolution';
    const source = horseSlug
      ? 'marketplace'
      : sanitizeKey(rawSource) || sanitizeKey(rawCampaign) || 'about';

    // Sheet1: created_at | last_sign_in | email | name | image | provider | providerAccountId | campaignKey | source
    const leadRow = [
      ts,
      ts,
      trimmed,
      '',
      '',
      'email',
      '',
      campaignKey,
      source,
    ];

    let sheetWritten = false;
    let sheetTarget: string | null = null;

    try {
      const accessToken = await getAccessToken();

      // 1) Primary — Interest Signups / Sheet1
      const primary = await appendRows(
        accessToken,
        LEADS_SHEET_ID,
        `${LEADS_TAB}!A:I`,
        [leadRow]
      );

      if (primary.ok) {
        sheetWritten = true;
        sheetTarget = `leads:${LEADS_SHEET_ID}/${LEADS_TAB}`;
      } else {
        console.error('[Subscribe] Primary leads sheet write failed:', primary.error);
        console.error(
          '[Subscribe] Share Editor on Interest Signups with evolution-web-admin@evolution-engine.iam.gserviceaccount.com'
        );

        // 2) Fallback — legacy Waitlist so leads are never lost
        const legacy = await appendRows(
          accessToken,
          LEGACY_WAITLIST_SHEET_ID,
          'Waitlist!A:C',
          [[trimmed, new Date().toISOString(), horseSlug || '']]
        );
        if (legacy.ok) {
          sheetWritten = true;
          sheetTarget = `legacy_waitlist:${LEGACY_WAITLIST_SHEET_ID}`;
          console.warn('[Subscribe] Wrote to legacy Waitlist fallback');
        } else {
          console.error('[Subscribe] Legacy Waitlist write also failed:', legacy.error);
        }
      }
    } catch (sheetErr: any) {
      console.error('[Subscribe] Sheet write failed (non-blocking):', sheetErr.message);
    }

    // Horse waitlist only — notify Alex by email
    if (horseSlug && horseName) {
      try {
        await notifyAlexOfInterest({
          interestedEmail: trimmed,
          horseName,
          horseSlug,
          source: 'guest',
          sheetUrl: `https://docs.google.com/spreadsheets/d/${LEADS_SHEET_ID}/edit`,
        });
      } catch (emailErr: any) {
        console.error('[Subscribe] Email notification failed:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, sheetWritten, sheetTarget });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
