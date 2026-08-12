import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { appendLead } from "@/lib/google-sheets";
import { appendLead as appendLeadSupabase } from "@/lib/supabase";
import { notifyAlexOfInterest } from "@/lib/notify-alex";

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
    const { horse_slug, horse_name, action_type, user_name, user_email } = body;

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

    // Dual-write: mirror to Supabase after Sheets write succeeds.
    if (process.env.DUAL_WRITE_ENABLED === 'true') {
      try {
        await appendLeadSupabase({
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
        console.log('[dual-write] Supabase lead append succeeded');
      } catch (e: any) {
        console.error('[dual-write] Supabase lead append failed:', e.message);
      }
    }

    // Send Alex an email notification for waitlist signups
    if (action_type === "waitlist") {
      try {
        await notifyAlexOfInterest({
          interestedEmail: user_email || decoded.email || "(unknown)",
          horseName: horse_name || horse_slug.replace(/-/g, " "),
          horseSlug: horse_slug,
          source: "logged-in",
        });
      } catch (emailErr: any) {
        console.error("[API Leads] Email notification failed:", emailErr.message);
        // Don't fail the request — the lead was still recorded
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Leads] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit lead" },
      { status: 500 }
    );
  }
}