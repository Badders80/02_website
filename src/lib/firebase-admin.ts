import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

type AdminApp = any;

let app: AdminApp | null = null;

function getApp(): AdminApp {
  if (app) return app;

  const existing = (admin as any).apps || [];
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }

  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (keyJson) {
    try {
      const serviceAccount = JSON.parse(keyJson);
      // firebase-admin v14: admin.cert() directly (not admin.credential.cert())
      app = (admin as any).initializeApp({
        credential: (admin as any).cert(serviceAccount),
      });
      return app;
    } catch (e) {
      console.error('[firebase-admin] Failed to init from FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  }

  // Fallback: application default credentials
  try {
    app = (admin as any).initializeApp({ credential: (admin as any).applicationDefault() });
  } catch (e) {
    console.error('[firebase-admin] Fallback failed. Set FIREBASE_SERVICE_ACCOUNT_KEY env.', e);
    throw new Error('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT_KEY = full service account JSON).');
  }

  return app;
}

export function getAdminAuth() {
  // firebase-admin v14: use getAuth() from firebase-admin/auth
  return getAuth(getApp());
}

export async function verifyIdToken(idToken: string) {
  const auth = getAdminAuth();
  return auth.verifyIdToken(idToken);
}

export async function setCustomClaims(uid: string, claims: Record<string, any>) {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, claims);
  console.log(`[firebase-admin] setCustomUserClaims for ${uid}:`, claims);
}