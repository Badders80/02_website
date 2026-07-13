import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/checkout-fulfill";

const WEBHOOK_SECRET =
  process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET ||
  "";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get("stripe-signature");

    if (!sigHeader) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        {
          error:
            "STRIPE_CHECKOUT_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET) not configured",
        },
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(
        rawBody,
        sigHeader,
        WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Stripe signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const result = await fulfillCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
          "[webhook]"
        );
        return NextResponse.json({ received: true, ...result });
      }

      case "checkout.session.expired":
        console.log(
          "Checkout session expired:",
          (event.data.object as any).id
        );
        break;

      default:
        console.log(`Unhandled checkout event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Checkout webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout webhook" },
      { status: 500 }
    );
  }
}
