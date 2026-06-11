import { NextRequest, NextResponse } from "next/server";
import { getGcpIdentityToken } from "@/lib/gcp-auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://australia-southeast1-evolution-engine.cloudfunctions.net";

/**
 * Generic API proxy for Cloud Functions.
 *
 * Browser → Next.js API route (adds GCP identity token) → Cloud Function
 *
 * Routes:
 *   POST /api/proxy/ssot/*   → SSOT Cloud Function
 *   POST /api/proxy/assets/* → Assets Cloud Function
 *   POST /api/proxy/kyc/*    → KYC Cloud Function
 *
 * Also supports GET for read operations.
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

    // Get GCP identity token (WIF on Vercel, gcloud on local dev)
    const gcpToken = await getGcpIdentityToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (gcpToken) {
      headers["Authorization"] = `Bearer ${gcpToken}`;
    }

    // Forward Firebase user token if present
    const firebaseToken = request.headers.get("x-firebase-token");
    if (firebaseToken) {
      headers["X-Firebase-Token"] = firebaseToken;
    }

    const body = request.method !== "GET" ? await request.text() : undefined;

    const res = await fetch(`${API_BASE}${path}`, {
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
