import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { appendLead } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

/**
 * POST /api/leads
 * Auth-required. Appends a lead to the Leads sheet.
 * Used by the KYC processing screen for "kyc_failed" manual assistance requests.
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { horse_slug, action_type, user_name, user_email } = body;

    if (!horse_slug || !action_type) {
      return NextResponse.json({ error: "Missing required fields: horse_slug, action_type" }, { status: 400 });
    }

    await appendLead({
      timestamp: new Date().toISOString(),
      user_email: user_email || decoded.email || "",
      user_name: user_name || "",
      horse_slug,
      action_type,
      utm_source: "",
      utm_campaign: "",
      referrer_url: "",
      status: "New",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Leads] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit lead" },
      { status: 500 }
    );
  }
}