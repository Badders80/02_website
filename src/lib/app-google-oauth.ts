/**
 * App-mediated Google OAuth for the live site (02_website).
 *
 * Why: GoTrue-mediated signInWithOAuth makes Google's consent screen say
 * "to continue to coqtijrftaklcwgbnqef.supabase.co" — investor-facing ugly.
 * Here OUR app drives the OAuth round-trip, so consent names our client
 * ("Evolution Stables"). Supabase GoTrue remains the identity store: the
 * bridge route exchanges the code and mints a GoTrue session via
 * signInWithIdToken, then hands off through the standard
 * #access_token=... fragment that /auth/callback already ingests
 * (detectSessionInUrl) — zero changes to session plumbing.
 *
 * Flow (prod): /api/auth/google (cookies + 302 to Google)
 *   → https://www.evolutionstables.nz/auth/callback?code&state   (registered URI)
 *   → page forwards code+state → /api/auth/google/bridge
 *   → token exchange + signInWithIdToken → redirect back with #access_token
 *   → /auth/callback establishes the session, forwards to ?next.
 *
 * Env (Vercel production / .env.local):
 *   GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET — creds (inherited
 *     from the GoTrue provider config; sync via Supabase config or Management API)
 *   GOOGLE_OAUTH_REDIRECT_URI — MUST equal the URI registered on the client.
 *     Prod: https://www.evolutionstables.nz/auth/callback
 *   NEXT_PUBLIC_APP_MEDIATED_GOOGLE=1 — login/mystable buttons use this flow.
 *     Unset → buttons keep the legacy GoTrue signInWithOAuth behaviour.
 */

import { createHash, randomUUID, timingSafeEqual } from "crypto";

export const GOOGLE_CSRF_COOKIE = "evo_g_csrf";
export const GOOGLE_NONCE_COOKIE = "evo_g_nonce";

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  /** Absolute redirect-URI override; empty string = derive from request origin. */
  redirectUriOverride: string;
}

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUriOverride: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "",
  };
}

export function resolveRedirectUri(config: GoogleOAuthConfig, origin: string): string {
  // Site-registered URI first (set in Vercel env); then request-derived
  // (non-prod/dev); bare module default LAST (audit finding 3: never present
  // the evo_02-style app route to Google on this site).
  if (config.redirectUriOverride) return config.redirectUriOverride;
  if (process.env.GOOGLE_OAUTH_REDIRECT_URI) return process.env.GOOGLE_OAUTH_REDIRECT_URI;
  return `${origin}/auth/callback`;
}

export function newNoncePair(): { raw: string; hashed: string } {
  const raw = randomUUID();
  return { raw, hashed: createHash("sha256").update(raw).digest("hex") };
}

/** Constant-time string compare; false on length mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * OAuth `state` = "<csrfHash>.<next>". Google echoes state byte-exact; the
 * hash prefix is the CSRF proof (vs the httpOnly cookie), the suffix is the
 * post-login destination (re-sanitized on read).
 */
export function buildOAuthState(csrfHash: string, nextPath: string): string {
  return `${csrfHash}.${nextPath}`;
}

export function parseOAuthState(state: string): { csrfHash: string; next: string | null } {
  const dot = state.indexOf(".");
  if (dot === -1) return { csrfHash: state, next: null };
  return { csrfHash: state.slice(0, dot), next: state.slice(dot + 1) };
}

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
