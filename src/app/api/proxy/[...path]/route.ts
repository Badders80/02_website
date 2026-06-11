import { NextRequest, NextResponse } from "next/server";

const CLOUD_RUN_PROXY =
  process.env.CLOUD_RUN_PROXY_URL ||
  "https://evolution-api-proxy-851430309148.australia-southeast1.run.app";

/**
 * Generic API proxy for Cloud Functions.
 *
 * Browser → Vercel (forwards Firebase token) → Cloud Run (verifies + adds GCP token) → Cloud Function
 *
 * Routes:
 *   /api/proxy/ssot/*   → Cloud Run /ssot/*   → SSOT Cloud Function
 *   /api/proxy/assets/* → Cloud Run /assets/* → Assets Cloud Function
 *   /api/proxy/kyc/*    → Cloud Run /kyc/*    → KYC Cloud Function
 */
export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace("/api/proxy", ""); // e.g., /ssot/horses

    if (!path || path === "/") {
      return NextResponse.json({ error: "Missing proxy path" }, { status: 400 });
    }

    // Forward Firebase user token to Cloud Run proxy
    const firebaseToken = request.headers.get("x-firebase-token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (firebaseToken) {
      headers["X-Firebase-Token"] = firebaseToken;
    }

    const body = request.method !== "GET" ? await request.text() : undefined;

    const res = await fetch(`${CLOUD_RUN_PROXY}${path}`, {
      method: request.method,
      headers,
      body: body || undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || `API error: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Proxy error" },
      { status: 500 }
    );
  }
}
