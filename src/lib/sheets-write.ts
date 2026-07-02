/**
 * sheets-write.ts — Server-side Google Sheets write utility via OAuth.
 *
 * Uses raw fetch to Sheets API v4 (no googleapis dependency).
 * Token loaded from env (Vercel) or file (local dev).
 * Fire-and-forget: callers should wrap in try/catch and not block on failure.
 */

import { promises as fs } from 'fs';
import path from 'path';

const SHEET_ID = '1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const IS_VERCEL = !!process.env.VERCEL;

interface OAuthToken {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
  expiry?: string;
}

// Cache the token in memory to avoid re-reading per request
let cachedToken: OAuthToken | null = null;
// Refresh lock to prevent concurrent refresh races
let refreshPromise: Promise<string | null> | null = null;

async function loadToken(): Promise<OAuthToken | null> {
  if (cachedToken) return cachedToken;

  // Vercel: token from env var (JSON string)
  const envToken = process.env.GOOGLE_OAUTH_TOKEN;
  const envSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (envToken) {
    try {
      const token = JSON.parse(envToken);
      if (envSecret) {
        try {
          const secret = JSON.parse(envSecret);
          token.client_id = secret.installed?.client_id || secret.web?.client_id || token.client_id;
          token.client_secret = secret.installed?.client_secret || secret.web?.client_secret || token.client_secret;
        } catch {
          console.error('[sheets-write] Failed to parse GOOGLE_CLIENT_SECRET env var');
        }
      }
      if (!token.client_id || !token.client_secret) {
        console.error('[sheets-write] Missing client_id or client_secret in token config');
        return null;
      }
      cachedToken = token;
      return token;
    } catch {
      console.error('[sheets-write] Failed to parse GOOGLE_OAUTH_TOKEN env var');
      return null;
    }
  }

  // Local dev only: read from files (skip on Vercel)
  if (IS_VERCEL) {
    console.error('[sheets-write] No GOOGLE_OAUTH_TOKEN env var set on Vercel');
    return null;
  }

  try {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    const tokenData = await fs.readFile(path.join(scriptsDir, 'token.json'), 'utf-8');
    const token = JSON.parse(tokenData);
    if (!token.client_id || !token.client_secret) {
      console.error('[sheets-write] token.json missing client_id or client_secret');
      return null;
    }
    cachedToken = token;
    return cachedToken;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[sheets-write] No token.json found and no GOOGLE_OAUTH_TOKEN env var: ${msg}`);
    return null;
  }
}

async function refreshToken(token: OAuthToken): Promise<string> {
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: token.client_id,
      client_secret: token.client_secret,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  token.access_token = data.access_token;
  token.expiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
  cachedToken = token;

  return token.access_token;
}

async function getAccessToken(): Promise<string | null> {
  const token = await loadToken();
  if (!token) return null;

  // Check if token is expired (with 60s buffer)
  if (token.expiry) {
    const expiry = new Date(token.expiry).getTime();
    if (Date.now() > expiry - 60000) {
      // Use refresh lock to prevent concurrent refresh races
      if (!refreshPromise) {
        refreshPromise = refreshToken(token)
          .then((at) => { refreshPromise = null; return at; })
          .catch((e) => {
            console.error('[sheets-write] Token refresh failed:', e);
            refreshPromise = null;
            return null;
          });
      }
      return refreshPromise;
    }
  }

  return token.access_token;
}

/**
 * Append a row to a Google Sheet tab.
 * Fire-and-forget — returns true on success, false on failure.
 * Caller should not await this or block the response on it.
 */
export async function appendToSheet(
  tabName: string,
  values: (string | number)[]
): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.warn(`[sheets-write] No access token — skipping write to ${tabName}`);
    return false;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tabName)}!A:Z:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[sheets-write] Sheets API error (${res.status}): ${err}`);
      return false;
    }

    console.log(`[sheets-write] ✅ Appended row to ${tabName}`);
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[sheets-write] Failed to append to ${tabName}:`, msg);
    return false;
  }
}