/**
 * GCP Authentication Utility
 *
 * Gets identity tokens for calling Cloud Functions.
 *
 * - On Vercel (production): Uses Workload Identity Federation (OIDC)
 *   The OIDC token is injected by Vercel as the x-vercel-oidc-token request header.
 *   Automatically resolved via next/headers — no manual extraction needed.
 * - On local dev: Uses gcloud auth print-identity-token
 *
 * The token is cached and auto-refreshed before expiry.
 */

import { execSync } from "child_process";
import { headers } from "next/headers";

const WIF_POOL = "projects/851430309148/locations/global/workloadIdentityPools/vercel-pool";
const WIF_PROVIDER = "vercel-oidc-team";
const SERVICE_ACCOUNT = "website-api@evolution-engine.iam.gserviceaccount.com";
const AUDIENCE = "https://australia-southeast1-evolution-engine.cloudfunctions.net";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

/**
 * Get a GCP identity token for calling Cloud Functions.
 * Uses WIF on Vercel, gcloud CLI on local dev.
 *
 * The OIDC token is automatically resolved from the active request context
 * via next/headers — no manual extraction needed in route handlers.
 */
export async function getGcpIdentityToken(): Promise<string | null> {
  // Return cached token if still fresh
  if (cachedToken && Date.now() < tokenExpiry - TOKEN_REFRESH_MARGIN_MS) {
    return cachedToken;
  }

  try {
    // Vercel production: use WIF OIDC
    if (process.env.VERCEL) {
      const token = await getWifToken();
      if (token) {
        cachedToken = token;
        // WIF tokens typically last 1 hour
        tokenExpiry = Date.now() + 55 * 60 * 1000;
        return token;
      }
    }

    // Local dev: use gcloud CLI
    const token = execSync("gcloud auth print-identity-token", {
      encoding: "utf-8",
      timeout: 10000,
    }).trim();

    if (token) {
      cachedToken = token;
      tokenExpiry = Date.now() + 55 * 60 * 1000;
      return token;
    }
  } catch (err: any) {
    console.warn("Failed to get GCP identity token:", err.message);
  }

  return null;
}

/**
 * Exchange a Vercel OIDC token for a GCP service account identity token.
 *
 * Flow: OIDC token → GCP STS (federated access token) → IAM (SA identity token)
 *
 * Resolves the OIDC token from (in order):
 *   1. next/headers — active request context (Vercel serverless functions)
 *   2. VERCEL_OIDC_TOKEN env var (legacy / local dev pull)
 *   3. ACTIONS_ID_TOKEN_REQUEST_URL + TOKEN (GitHub Actions)
 */
async function getWifToken(): Promise<string | null> {
  try {
    // Resolve OIDC token from multiple possible sources
    let resolvedToken: string | null = null;

    // Source 1: Extract automatically from active request headers via next/headers
    if (!resolvedToken) {
      try {
        const headersList = await headers();
        resolvedToken = headersList.get("x-vercel-oidc-token");
      } catch {
        // Safe fallback if called outside of a request context
        // (e.g., build-time, local dev CLI, or test environment)
      }
    }

    // Source 2: Vercel Functions — token injected as env var (legacy)
    if (!resolvedToken && process.env.VERCEL_OIDC_TOKEN) {
      resolvedToken = process.env.VERCEL_OIDC_TOKEN;
    }

    // Source 3: GitHub Actions — fetch from Vercel's OIDC broker
    if (!resolvedToken && process.env.ACTIONS_ID_TOKEN_REQUEST_URL && process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
      const oidcRes = await fetch(
        `${process.env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=sts.googleapis.com`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`,
          },
        }
      );

      if (!oidcRes.ok) {
        const err = await oidcRes.text();
        throw new Error(`OIDC token fetch failed (${oidcRes.status}): ${err}`);
      }

      const oidcData = await oidcRes.json();
      resolvedToken = oidcData.value;
    }

    if (!resolvedToken) {
      console.warn(
        "No OIDC token available — WIF auth unavailable. " +
        "Ensure OIDC is enabled in Vercel project settings → Security → OpenID Connect."
      );
      return null;
    }

    // Exchange OIDC token for GCP federated access token
    const stsRes = await fetch("https://sts.googleapis.com/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
        audience: `//iam.googleapis.com/${WIF_POOL}/providers/${WIF_PROVIDER}`,
        requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
        subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
        subjectToken: resolvedToken,
        scope: "https://www.googleapis.com/auth/cloud-platform",
      }),
    });

    if (!stsRes.ok) {
      const err = await stsRes.text();
      throw new Error(`STS token exchange failed (${stsRes.status}): ${err}`);
    }

    const stsData = await stsRes.json();
    const accessToken = stsData.access_token;
    if (!accessToken) {
      throw new Error("STS response missing 'access_token'");
    }

    // Exchange access token for service account identity token
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

    if (!idRes.ok) {
      const err = await idRes.text();
      throw new Error(`ID token generation failed (${idRes.status}): ${err}`);
    }

    const idData = await idRes.json();
    return idData.token;
  } catch (err: any) {
    console.warn("WIF token exchange failed:", err.message);
    return null;
  }
}

/**
 * Clear the cached token.
 */
export function clearGcpToken(): void {
  cachedToken = null;
  tokenExpiry = 0;
}
