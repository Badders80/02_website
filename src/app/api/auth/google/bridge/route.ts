import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  GOOGLE_CSRF_COOKIE,
  GOOGLE_NONCE_COOKIE,
  GOOGLE_TOKEN_URL,
  getGoogleOAuthConfig,
  parseOAuthState,
  resolveRedirectUri,
  safeEqual,
} from "@/lib/app-google-oauth";

interface GoogleTokenResponse {
  id_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * Step 2 of app-mediated Google sign-in (02_website variant).
 *
 * Google lands on the REGISTERED redirect URI (www.evolutionstables.nz/auth/
 * callback?code&state). That client page forwards code+state here; we validate
 * CSRF, exchange the code (redirect_uri byte-matches authorize), mint a
 * GoTrue session via signInWithIdToken (nonce-checked), then redirect back to
 * /auth/callback with the session as an access-token fragment — the page's
 * existing detectSessionInUrl logic picks it up and forwards to ?next.
 * No changes to the site's session plumbing; Google never sees supabase.co.
 */
function sanitizeNext(raw: string | null): string {
  const fallback = "/mystable";
  if (!raw) return fallback;
  return raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("://") ? raw : fallback;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const debug = url.searchParams.get("debug") === "1";

  const fail = (code: string) =>
    NextResponse.redirect(`${origin}/auth/callback?auth_error=${code}${debug ? "&debug=1" : ""}`);

  const config = getGoogleOAuthConfig();
  if (!config) return fail("google_not_configured");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(GOOGLE_CSRF_COOKIE)?.value;
  const nonceCookie = cookieStore.get(GOOGLE_NONCE_COOKIE)?.value;

  if (!code || !state || !csrfCookie || !nonceCookie) return fail("google_callback_invalid");

  const { csrfHash, next: stateNext } = parseOAuthState(state);
  const expectedState = createHash("sha256").update(csrfCookie).digest("hex");
  if (!safeEqual(csrfHash, expectedState)) return fail("google_csrf");
  const next = sanitizeNext(stateNext);

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: resolveRedirectUri(config, origin),
      grant_type: "authorization_code",
    }),
  });

  const tokens = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokens.id_token) {
    if (debug) {
      return NextResponse.json({
        stage: "token_exchange",
        status: tokenRes.status,
        error: tokens.error ?? "no id_token",
        description: tokens.error_description ?? null,
      });
    }
    return fail("google_token_exchange");
  }

  // Mint the GoTrue session with a dedicated client: cookies live in this
  // route's response (fragment hand-off), not Next's cookie store.
  const supabase: SupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: tokens.id_token,
    nonce: nonceCookie,
  });

  if (error || !data?.session) {
    if (debug) {
      return NextResponse.json({
        stage: "sign_in_with_id_token",
        error: error?.message ?? "no session",
      });
    }
    return fail("google_signin_failed");
  }

  // Hand the session to /auth/callback: ?next for the destination, session
  // in the access-token fragment the page already ingests (never a query
  // string — tokens must not hit server logs). Cookies die with this response.
  const target = new URL(`${origin}/auth/callback`);
  target.searchParams.set("next", next);
  target.hash = [
    `access_token=${data.session.access_token}`,
    `refresh_token=${data.session.refresh_token}`,
    `expires_in=${data.session.expires_in ?? 3600}`,
    "token_type=bearer",
  ].join("&");
  const response = NextResponse.redirect(target.toString());
  response.cookies.delete(GOOGLE_CSRF_COOKIE);
  response.cookies.delete(GOOGLE_NONCE_COOKIE);
  return response;
}
