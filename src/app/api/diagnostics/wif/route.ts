import { NextRequest, NextResponse } from "next/server";
import { getGcpIdentityToken } from "@/lib/gcp-auth";

/**
 * Diagnostic endpoint: Check WIF auth status.
 * GET /api/diagnostics/wif
 */
export async function GET(request: NextRequest) {
  // Check all possible OIDC token sources
  const headerToken = request.headers.get("x-vercel-oidc-token");
  const allHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (key.toLowerCase().includes("oidc") || key.toLowerCase().includes("vercel") || key.toLowerCase().includes("auth")) {
      allHeaders[key] = value.substring(0, 30) + "...";
    }
  });

  const results: Record<string, unknown> = {
    vercel_env: !!process.env.VERCEL,
    // Env var sources
    oidc_direct_set: !!process.env.VERCEL_OIDC_TOKEN,
    oidc_direct_preview: process.env.VERCEL_OIDC_TOKEN
      ? `${(process.env.VERCEL_OIDC_TOKEN as string).substring(0, 20)}...`
      : null,
    oidc_url_set: !!process.env.ACTIONS_ID_TOKEN_REQUEST_URL,
    oidc_token_set: !!process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
    // Header sources
    oidc_header_set: !!headerToken,
    oidc_header_preview: headerToken ? `${headerToken.substring(0, 20)}...` : null,
    relevant_headers: allHeaders,
    // All env vars containing OIDC/VERCEL/AUTH (sanitized)
    oidc_env_vars: Object.keys(process.env).filter(k =>
      k.includes("OIDC") || k.includes("VERCEL") || k.includes("TOKEN")
    ),
  };

  // Try to get a GCP token using the OIDC token from request header
  const start = Date.now();
  const oidcToken = request.headers.get("x-vercel-oidc-token");
  const token = await getGcpIdentityToken(oidcToken);
  results.token_obtained = !!token;
  results.token_preview = token ? `${token.substring(0, 20)}...` : null;
  results.token_ms = Date.now() - start;

  return NextResponse.json(results);
}
