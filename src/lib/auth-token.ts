/**
 * Firebase Auth Token Management
 *
 * Provides a cached Firebase ID token for API calls.
 * Uses anonymous sign-in for public browsing, or the current user's token.
 *
 * The token is cached and auto-refreshed before expiry.
 */

import { auth } from "./firebase";
import { signInAnonymously, type User } from "firebase/auth";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;
let anonymousUser: User | null = null;

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

/**
 * Get a valid Firebase ID token for API calls.
 *
 * - If a user is signed in, uses their token.
 * - If no user is signed in, signs in anonymously (for public browsing).
 * - Caches the token and auto-refreshes before expiry.
 */
export async function getAuthToken(): Promise<string | null> {
  // Return cached token if still fresh
  if (cachedToken && Date.now() < tokenExpiry - TOKEN_REFRESH_MARGIN_MS) {
    return cachedToken;
  }

  try {
    // Use existing user if available
    let user = auth?.currentUser;

    // Sign in anonymously if no user
    if (!user && auth && typeof window !== "undefined") {
      if (!anonymousUser) {
        const cred = await signInAnonymously(auth);
        anonymousUser = cred.user;
      }
      user = anonymousUser;
    }

    if (!user) return null;

    const tokenResult = await user.getIdTokenResult();
    cachedToken = tokenResult.token;
    tokenExpiry = new Date(tokenResult.expirationTime).getTime();
    return cachedToken;
  } catch (err) {
    console.warn("Failed to get auth token:", err);
    cachedToken = null;
    return null;
  }
}

/**
 * Clear the cached token (e.g., on sign out).
 */
export function clearAuthToken(): void {
  cachedToken = null;
  tokenExpiry = 0;
  anonymousUser = null;
}
