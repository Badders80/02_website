import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const WIF_POOL = "projects/851430309148/locations/global/workloadIdentityPools/vercel-pool";
const WIF_PROVIDER = "vercel-oidc-team";
const SERVICE_ACCOUNT = "website-api@evolution-engine.iam.gserviceaccount.com";
const AUDIENCE = "https://evolution-api-proxy-ydhxz42mra-ts.a.run.app";

/**
 * Detailed WIF diagnostics — performs the STS exchange step by step
 * and reports the actual error at each stage.
 */
export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {
    vercel_env: !!process.env.VERCEL,
    oidc_header_set: false,
    oidc_header_preview: null,
    sts_exchange: null,
    id_token_generation: null,
    final_token: null,
  };

  // Step 1: Resolve OIDC token
  let oidcToken: string | null = null;

  // Try next/headers
  try {
    const headersList = await headers();
    oidcToken = headersList.get("x-vercel-oidc-token");
  } catch (e: unknown) {
    results.next_headers_error = e instanceof Error ? e.message : String(e);
  }

  // Fallback to direct request header
  if (!oidcToken) {
    oidcToken = request.headers.get("x-vercel-oidc-token");
  }

  results.oidc_header_set = !!oidcToken;
  results.oidc_header_preview = oidcToken ? `${oidcToken.substring(0, 30)}...` : null;

  if (!oidcToken) {
    results.error = "No OIDC token found in request headers";
    return NextResponse.json(results);
  }

  // Step 2: Exchange OIDC token for GCP STS access token
  try {
    const stsRes = await fetch("https://sts.googleapis.com/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
        audience: `//iam.googleapis.com/${WIF_POOL}/providers/${WIF_PROVIDER}`,
        requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
        subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
        subjectToken: oidcToken,
        scope: "https://www.googleapis.com/auth/cloud-platform",
      }),
    });

    const stsBody = await stsRes.text();
    results.sts_exchange = {
      status: stsRes.status,
      ok: stsRes.ok,
      body: stsBody.substring(0, 500),
    };

    if (!stsRes.ok) {
      results.error = "STS token exchange failed";
      return NextResponse.json(results);
    }

    const stsData = JSON.parse(stsBody);
    const accessToken = stsData.access_token;

    // Step 3: Exchange access token for SA identity token
    const idRes = await fetch(
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateIdToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          audience: AUDIENCE,
          includeEmail: true,
        }),
      }
    );

    const idBody = await idRes.text();
    results.id_token_generation = {
      status: idRes.status,
      ok: idRes.ok,
      body: idBody.substring(0, 500),
    };

    if (!idRes.ok) {
      results.error = "ID token generation failed";
      return NextResponse.json(results);
    }

    const idData = JSON.parse(idBody);
    results.final_token = idData.token ? `${(idData.token as string).substring(0, 30)}...` : null;
    results.success = true;
  } catch (e: unknown) {
    results.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}
