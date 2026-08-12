import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { readCommunicationsByEmail } from "@/lib/google-sheets";
import { readCommunicationsByEmail as readCommunicationsByEmailSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/communications
 * Auth-required. Returns communications for the authenticated user.
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

    const communications = await readCommunicationsByEmail(email);

    // Shadow-read Supabase for reconciliation (Sheets remains primary).
    if (process.env.DUAL_WRITE_ENABLED === 'true') {
      try {
        const supabaseData = await readCommunicationsByEmailSupabase(email);
        if (supabaseData.length !== communications.length) {
          console.warn('[dual-write] Communications count mismatch:', communications.length, 'vs', supabaseData.length);
        }
      } catch (e: any) {
        console.error('[dual-write] Supabase shadow read failed:', e.message);
      }
    }

    return NextResponse.json({ communications });
  } catch (error: any) {
    console.error("[API Communications] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch communications" },
      { status: 500 }
    );
  }
}