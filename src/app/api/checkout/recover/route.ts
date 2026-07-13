/**
 * Ops recovery: fulfill a paid Checkout Session without waiting for Stripe webhook.
 *
 * POST /api/checkout/recover
 * Headers: Authorization: Bearer <PAYMENT_RECOVER_SECRET>
 * Body: { "session_id": "cs_live_..." }
 *
 * Uses live STRIPE_SECRET_KEY to retrieve the session, then same fulfill path as webhook.
 * Idempotent via holdings purchase_id check.
 */

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/checkout-fulfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: NextRequest): boolean {
  const secret = process.env.PAYMENT_RECOVER_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  if (auth === `Bearer ${secret}`) return true;
  // Also accept x-recover-secret header
  const header = request.headers.get("x-recover-secret") || "";
  return header === secret;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.PAYMENT_RECOVER_SECRET) {
      return NextResponse.json(
        { error: "PAYMENT_RECOVER_SECRET not configured" },
        { status: 503 }
      );
    }

    if (!authorize(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = String(body.session_id || body.sessionId || "").trim();
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "session_id required (cs_live_… or cs_test_…)" },
        { status: 400 }
      );
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        {
          error: "Session is not paid/complete — refusing fulfill",
          payment_status: session.payment_status,
          status: session.status,
          session_id: sessionId,
        },
        { status: 409 }
      );
    }

    const result = await fulfillCheckoutSession(session, "[recover]");

    return NextResponse.json({
      ok: true,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
      ...result,
    });
  } catch (error: any) {
    console.error("[recover] error:", error);
    return NextResponse.json(
      { error: error.message || "Recover failed" },
      { status: 500 }
    );
  }
}
