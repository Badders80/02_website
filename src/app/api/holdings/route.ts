import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/supabase-admin-auth";
import { readHoldingsByEmail } from "@/lib/google-sheets";
import { readHoldingsByEmail as readHoldingsByEmailSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/holdings
 * Auth-required. Returns live holdings for the authenticated user from Google Sheets.
 * Falls back to empty array on error (client-side uses static JSON as initial render).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = await verifyIdToken(token);
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ error: "No email associated with this account" }, { status: 400 });
    }

    const holdings = await readHoldingsByEmail(email);

    // Shadow-read Supabase for reconciliation (Sheets remains primary).
    if (process.env.DUAL_WRITE_ENABLED === 'true') {
      try {
        const supabaseData = await readHoldingsByEmailSupabase(email);
        if (supabaseData.length !== holdings.length) {
          console.warn('[dual-write] Holdings count mismatch:', holdings.length, 'vs', supabaseData.length);
        }
      } catch (e: any) {
        console.error('[dual-write] Supabase shadow read failed:', e.message);
      }
    }

    return NextResponse.json({ holdings });
  } catch (error: any) {
    console.error("[API Holdings] Error:", error);
    const msg = error?.message || "Failed to fetch holdings";
    const quota = /quota exceeded|rate limit|RESOURCE_EXHAUSTED/i.test(msg);
    return NextResponse.json(
      {
        error: msg,
        code: quota ? "SHEETS_QUOTA" : "HOLDINGS_FETCH_FAILED",
        holdings: null,
      },
      { status: quota ? 503 : 500 }
    );
  }
}