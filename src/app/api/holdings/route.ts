import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { readHoldingsByEmail } from "@/lib/google-sheets";

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
    return NextResponse.json({ holdings });
  } catch (error: any) {
    console.error("[API Holdings] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch holdings" },
      { status: 500 }
    );
  }
}