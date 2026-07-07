import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { readCommunicationsByEmail } from "@/lib/google-sheets";

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
    return NextResponse.json({ communications });
  } catch (error: any) {
    console.error("[API Communications] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch communications" },
      { status: 500 }
    );
  }
}