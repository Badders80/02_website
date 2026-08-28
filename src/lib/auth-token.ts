/**
 * Supabase client-side auth token access.
 *
 * Replaces Firebase ID-token management. Returns the current session's
 * Supabase access token for `Authorization: Bearer ...` API calls —
 * the same wire format the app's API routes already speak.
 */

import { createBrowserClient } from '@/lib/supabase';

/**
 * Get a valid Supabase access token for API calls.
 * Returns null when signed out (callers already handle the 401 path).
 * supabase-js caches and auto-refreshes the session.
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const supabase = createBrowserClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch (err) {
    console.warn('[auth-supabase] failed to get access token:', err);
    return null;
  }
}

/** Clear cached token (on sign out) — supabase-js owns the session lifecycle. */
export function clearAuthToken(): void {
  // Intentional no-op: supabase.auth.signOut() invalidates the session.
}