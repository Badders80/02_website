import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  GOOGLE_AUTH_URL,
  GOOGLE_CSRF_COOKIE,
  GOOGLE_NONCE_COOKIE,
  buildOAuthState,
  getGoogleOAuthConfig,
  newNoncePair,
  resolveRedirectUri,
} from "@/lib/app-google-oauth";

/**
 * Step 1 of app-mediated Google sign-in: plant CSRF+nonce httpOnly cookies,
 * 302 to Google from OUR OAuth client. Consent shows our client name —
 * never *.supabase.co. The presented redirect_uri is the registered one
 * (GOOGLE_OAUTH_REDIRECT_URI) so Google needs no new Console registration.
 */
export async function GET(request: Request) {
  const config = getGoogleOAuthConfig();
  const origin = new URL(request.url).origin;
  // Server-side gate mirrors the client buttons: when the feature flag is
  // off, this route must not enter the app-mediated flow even if creds are
  // present (audit follow-up: creds can be set-but-invalid during founder
  // key rotation; buttons alone don't guard direct URL hits).
  if (process.env.NEXT_PUBLIC_APP_MEDIATED_GOOGLE !== "1") {
    return NextResponse.redirect(`${origin}/auth/login`);
  }
  if (!config) {
    return NextResponse.redirect(`${origin}/auth/login?error=google_not_configured`);
  }

  const { searchParams } = new URL(request.url);
  const rawNext = searchParams.get("next") || "/mystable";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("://")
      ? rawNext
      : "/mystable";

  const { raw: csrf, hashed: csrfHash } = newNoncePair();
  const { raw: nonce, hashed: nonceHash } = newNoncePair();

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", resolveRedirectUri(config, origin));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", buildOAuthState(csrfHash, next));
  authUrl.searchParams.set("nonce", nonceHash);
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  };
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(GOOGLE_CSRF_COOKIE, csrf, cookieOptions);
  response.cookies.set(GOOGLE_NONCE_COOKIE, nonce, cookieOptions);
  return response;
}
