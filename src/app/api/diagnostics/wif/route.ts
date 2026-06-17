import { NextResponse } from "next/server";
import { getGcpIdentityToken } from "@/lib/gcp-auth";

/**
 * Diagnostic endpoint: Check WIF auth status.
 * GET /api/diagnostics/wif
 */
export async function GET() {
  const results: Record<string, unknown> = {
    vercel_env: !!process.env.VERCEL,
    oidc_direct_set: !!process.env.VERCEL_OIDC_TOKEN,
    oidc_direct_preview: process.env.VERCEL_OIDC_TOKEN
      ? `${(process.env.VERCEL_OIDC_TOKEN as string).substring(0, 20)}...`
      : null,
    oidc_url_set: !!process.env.ACTIONS_ID_TOKEN_REQUEST_URL,
    oidc_token_set: !!process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
    oidc_url_preview: process.env.ACTIONS_ID_TOKEN_REQUEST_URL
      ? `${(process.env.ACTIONS_ID_TOKEN_REQUEST_URL as string).substring(0, 60)}...`
      : null,
  };

  // Try to get a GCP token
  const start = Date.now();
  const token = await getGcpIdentityToken();
  results.token_obtained = !!token;
  results.token_preview = token ? `${token.substring(0, 20)}...` : null;
  results.token_ms = Date.now() - start;

  return NextResponse.json(results);
}
