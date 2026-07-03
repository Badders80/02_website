import { createRequire } from 'module';
import { createVerify } from 'crypto';

const require = createRequire(import.meta.url);

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'evolution-engine';
const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

type DecodedToken = {
  uid: string;
  email?: string;
  [key: string]: unknown;
};

let cachedCerts: Record<string, string> | null = null;
let cacheExpiry = 0;

function parseServiceAccount() {
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured');
  }
  return JSON.parse(keyJson) as {
    client_email: string;
    private_key: string;
    private_key_id: string;
    project_id: string;
  };
}

async function getFirebasePublicKeys(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && now < cacheExpiry) return cachedCerts;

  const res = await fetch(FIREBASE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Firebase public keys: ${res.status}`);
  }

  const maxAge = res.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1];
  cacheExpiry = now + (maxAge ? Number(maxAge) * 1000 : 3600_000);
  cachedCerts = (await res.json()) as Record<string, string>;
  return cachedCerts;
}

function decodeJwt(idToken: string) {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString()) as { kid?: string; alg?: string };
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as Record<string, unknown> & {
    sub?: string;
    aud?: string;
    iss?: string;
    exp?: number;
    email?: string;
  };

  return {
    header,
    payload,
    signed: `${parts[0]}.${parts[1]}`,
    signature: parts[2],
  };
}

export async function verifyIdToken(idToken: string): Promise<DecodedToken> {
  const { header, payload, signed, signature } = decodeJwt(idToken);

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported JWT header');
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    throw new Error('Token expired');
  }

  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error('Invalid audience');
  }

  const expectedIssuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error('Invalid issuer');
  }

  const keys = await getFirebasePublicKeys();
  const pem = keys[header.kid];
  if (!pem) {
    throw new Error('Unknown signing key');
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(signed);
  verifier.end();

  if (!verifier.verify(pem, signature, 'base64url')) {
    throw new Error('Invalid signature');
  }

  if (!payload.sub) {
    throw new Error('Missing subject');
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    ...payload,
  };
}

async function getIdentityToolkitAccessToken(): Promise<string> {
  const key = parseServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT', kid: key.private_key_id };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/identitytoolkit',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const crypto = require('crypto') as typeof import('crypto');
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedPayload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const jwt = `${signInput}.${signer.sign(key.private_key, 'base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Identity Toolkit token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

export async function setCustomClaims(uid: string, claims: Record<string, unknown>) {
  const accessToken = await getIdentityToolkitAccessToken();
  const projectId = parseServiceAccount().project_id || FIREBASE_PROJECT_ID;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        localId: uid,
        customAttributes: JSON.stringify(claims),
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to set custom claims: ${res.status} ${await res.text()}`);
  }

  console.log(`[firebase-admin] setCustomClaims for ${uid}:`, claims);
}