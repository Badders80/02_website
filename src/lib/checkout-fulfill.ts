/**
 * Shared checkout fulfillment — used by Stripe webhook + ops recover.
 * Records holding, bumps shares_sold, sends welcome/admin email, logs communications.
 */

import type Stripe from "stripe";
import {
  checkHoldingExists,
  appendHolding,
  appendCommunication,
  readInventoryBySlug,
  updateInventorySharesSold,
  invalidateHoldingsCache,
} from "@/lib/google-sheets";
import { fulfillPurchase, logEvent } from "@/lib/supabase";
import { captureServerError, captureServerEvent } from "@/lib/posthog-server";

export type FulfillResult = {
  duplicate?: boolean;
  fulfilled?: boolean;
  session_id?: string;
  user_email?: string;
  hlt_id?: string;
  shares?: number;
  amount_mismatch?: boolean;
};

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  logPrefix = "[checkout-fulfill]"
): Promise<FulfillResult> {
  const meta = session.metadata || {};
  const sessionId = session.id;
  const userEmail =
    meta.user_email ||
    session.customer_details?.email ||
    session.customer_email ||
    "";
  const hltId = meta.hlt_id || "";
  const sharesToBuy = parseInt(meta.shares_to_buy || "0", 10);
  const pricePerShareFromMeta = parseFloat(meta.price_per_share_nzd || "0");

  console.log(`${logPrefix} Processing session=${sessionId}`, {
    userEmail,
    hltId,
    sharesToBuy,
    payment_status: session.payment_status,
  });

  if (!hltId || !sharesToBuy || sharesToBuy < 1) {
    throw new Error(
      `Session ${sessionId} missing metadata hlt_id/shares_to_buy (hlt_id=${hltId}, shares=${sharesToBuy})`
    );
  }

  // Step 1: Idempotency
  try {
    const alreadyExists = await checkHoldingExists(sessionId);
    if (alreadyExists) {
      console.log(
        `${logPrefix} Duplicate for ${sessionId} — skipping (idempotent)`
      );
      return {
        duplicate: true,
        session_id: sessionId,
        user_email: userEmail,
        hlt_id: hltId,
        shares: sharesToBuy,
      };
    }
  } catch (err: any) {
    console.error(
      `${logPrefix} Idempotency check failed for ${sessionId}:`,
      err.message
    );
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "idempotency_check",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
  }

  // Step 2: Amount validation
  let amountMismatch = false;
  let pricePerShareNzd = pricePerShareFromMeta;
  let horseDisplayName = hltId;

  try {
    const inventory = await readInventoryBySlug(hltId);
    if (inventory) {
      const sheetPrice = inventory.price_per_share_nzd;
      if (sheetPrice != null && Number(sheetPrice) > 0) {
        pricePerShareNzd = Number(sheetPrice);
      } else {
        console.warn(
          `${logPrefix} Inventory price missing/invalid for ${hltId} — using metadata price`
        );
      }
      if (inventory.name) {
        horseDisplayName = inventory.name;
      }
    } else {
      console.warn(
        `${logPrefix} Could not read inventory for ${hltId} — using metadata price`
      );
    }

    const expectedTotalCents = Math.round(sharesToBuy * pricePerShareNzd * 100);
    const actualTotalCents = session.amount_total || 0;

    if (expectedTotalCents !== actualTotalCents) {
      amountMismatch = true;
      console.error(
        `${logPrefix} CRITICAL: Amount mismatch for ${sessionId} — expected ${expectedTotalCents} cents, got ${actualTotalCents} cents.`
      );
    }
  } catch (err: any) {
    console.error(
      `${logPrefix} Amount validation failed for ${sessionId}:`,
      err.message
    );
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "amount_validation",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
  }

  // Step 3: Record holding
  const purchasePriceTotalNzd = (session.amount_total || 0) / 100;
  const timestamp = new Date().toISOString();

  const signedPdsUrl = meta.e_sign_pds === 'true' ? `/documents/${hltId}/pds.pdf` : "";
  const signedSaUrl = meta.e_sign_sa === 'true' ? `/documents/${hltId}/sa.pdf` : "";

  const holdingRow = {
    purchase_id: sessionId,
    timestamp,
    user_email: userEmail,
    horse_slug: hltId,
    shares_owned: sharesToBuy,
    purchase_price_total_nzd: purchasePriceTotalNzd,
    signed_pds_url: signedPdsUrl,
    signed_sa_url: signedSaUrl,
    kyc_status: "verified",
    utm_source: "pending",
    utm_campaign: "pending",
  };

  try {
    await appendHolding(holdingRow);
    invalidateHoldingsCache(userEmail);
    console.log(`${logPrefix} ✅ Holding recorded for ${sessionId}`);

    captureServerEvent("payment_succeeded", {
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
      shares: sharesToBuy,
      amount_nzd: purchasePriceTotalNzd,
      amount_mismatch: amountMismatch,
    });

    // Dual-write: mirror to Supabase after Sheets write succeeds.
    if (process.env.DUAL_WRITE_ENABLED === 'true') {
      try {
        await fulfillPurchase({
          purchase_id: sessionId,
          user_email: userEmail,
          horse_slug: hltId,
          shares: sharesToBuy,
          amount_nzd: purchasePriceTotalNzd,
          signed_pds_url: signedPdsUrl,
          signed_sa_url: signedSaUrl,
          kyc_status: "verified",
          utm_source: "pending",
          utm_campaign: "pending",
        });
        await logEvent({
          user_email: userEmail,
          event_type: 'holding_issued',
          entity_type: 'holding',
          entity_id: sessionId,
          metadata: { horse_slug: hltId, shares: sharesToBuy, amount_nzd: purchasePriceTotalNzd },
        });
        console.log(`${logPrefix} ✅ Supabase dual-write succeeded for ${sessionId}`);
      } catch (e: any) {
        console.error('[dual-write] Supabase write failed:', e.message);
      }
    }
  } catch (err: any) {
    console.error(
      `${logPrefix} CRITICAL: Failed to record holding for ${sessionId}:`,
      err.message
    );
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "record_holding",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
    throw new Error(`Holding record failed for ${sessionId}: ${err.message}`);
  }

  // Step 4: Update inventory shares_sold
  try {
    const inventory = await readInventoryBySlug(hltId);
    if (inventory) {
      const currentSold = inventory.shares_sold;
      const newSold = currentSold + sharesToBuy;
      const sharesTotal = inventory.shares_total;

      await updateInventorySharesSold(hltId, newSold);

      if (newSold > sharesTotal) {
        console.error(
          `${logPrefix} CRITICAL OVERSELL ALERT: ${hltId} — shares_sold ${newSold} exceeds shares_total ${sharesTotal}. Session ${sessionId}.`
        );
      }

      console.log(
        `${logPrefix} ✅ Inventory updated for ${hltId}: ${currentSold} → ${newSold}`
      );
    } else {
      console.warn(
        `${logPrefix} Could not update inventory — slug ${hltId} not found in Sheets`
      );
    }
  } catch (err: any) {
    console.error(
      `${logPrefix} Failed to update inventory for ${hltId}:`,
      err.message
    );
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "update_inventory",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
  }

  // Step 5: Welcome email
  let emailHtml = "";
  let emailSubject = "";
  let emailSnippet = "";

  try {
    emailSubject = `Welcome to the ${horseDisplayName} Syndicate!`;
    emailSnippet = `Your ${sharesToBuy} share${sharesToBuy > 1 ? "s" : ""} in ${horseDisplayName} ${sharesToBuy > 1 ? "have" : "has"} been confirmed.`;
    emailHtml = buildWelcomeEmailHtml({
      horseName: horseDisplayName,
      sharesOwned: sharesToBuy,
      purchasePriceTotalNzd,
    });

    await sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
      logPrefix,
    });

    console.log(`${logPrefix} ✅ Welcome email sent to ${userEmail}`);
  } catch (err: any) {
    console.error(
      `${logPrefix} Failed to send welcome email to ${userEmail}:`,
      err.message
    );
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "welcome_email",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
  }

  // Step 5b: Admin notification
  try {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM;
    if (adminEmail) {
      const adminHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
  <div style="border-bottom: 2px solid #0a0a0a; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 20px; font-weight: 700; margin: 0;">Evolution Stables — New Acquisition</h1>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Investor</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${userEmail}</td></tr>
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Horse</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${horseDisplayName}</td></tr>
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Shares</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${sharesToBuy}</td></tr>
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Total</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">NZ$${purchasePriceTotalNzd.toFixed(2)}</td></tr>
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Session ID</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right; font-family: monospace; font-size: 12px;">${sessionId}</td></tr>
  </table>
  <p style="font-size: 14px; color: #666;">Verify holding in Google Sheets and confirm signed PDF delivery.</p>
</body></html>`.trim();
      await sendEmail({
        to: adminEmail,
        subject: `[Acquisition] ${sharesToBuy} share${sharesToBuy > 1 ? "s" : ""} in ${horseDisplayName} — ${userEmail}`,
        html: adminHtml,
        logPrefix,
      });
      console.log(`${logPrefix} ✅ Admin notification sent to ${adminEmail}`);
    }
  } catch (err: any) {
    console.error(`${logPrefix} Failed to send admin notification:`, err.message);
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "admin_notification",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
  }

  // Step 6: Communications log
  try {
    await appendCommunication({
      timestamp,
      recipient_email: userEmail,
      subject: emailSubject || `Welcome to the ${horseDisplayName} Syndicate!`,
      snippet: emailSnippet || "Syndication share purchase confirmed.",
      body_html: emailHtml || "",
      category: "welcome",
    });
    console.log(`${logPrefix} ✅ Communication logged for ${sessionId}`);
  } catch (err: any) {
    console.error(
      `${logPrefix} Failed to log communication for ${sessionId}:`,
      err.message
    );
    captureServerError(err, {
      component: "checkout-fulfill",
      step: "communications_log",
      session_id: sessionId,
      user_email: userEmail,
      hlt_id: hltId,
    });
  }

  if (amountMismatch) {
    console.error(
      `${logPrefix} ⚠️ Session ${sessionId} completed with amount mismatch — needs manual review`
    );
  }

  console.log(`${logPrefix} Processing complete for ${sessionId}`);
  return {
    fulfilled: true,
    session_id: sessionId,
    user_email: userEmail,
    hlt_id: hltId,
    shares: sharesToBuy,
    amount_mismatch: amountMismatch,
  };
}

function buildWelcomeEmailHtml(data: {
  horseName: string;
  sharesOwned: number;
  purchasePriceTotalNzd: number;
}): string {
  const { horseName, sharesOwned, purchasePriceTotalNzd } = data;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.evolutionstables.nz";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6;">
  <div style="border-bottom: 2px solid #0a0a0a; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Evolution Stables</h1>
  </div>

  <h2 style="font-size: 20px; font-weight: 600;">Welcome to the ${horseName} Syndicate!</h2>

  <p>You're now part of the syndicate. Here's a summary of your acquisition:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Horse</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${horseName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Shares Acquired</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${sharesOwned}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Total Investment</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">NZ$${purchasePriceTotalNzd.toFixed(2)}</td>
    </tr>
  </table>

  <h3 style="font-size: 16px; font-weight: 600; margin-top: 24px;">What happens next?</h3>
  <ul style="padding-left: 20px;">
    <li>Your investment is now recorded in your <a href="${appUrl}/mystable" style="color: #0a0a0a; text-decoration: underline;">MyStable portal</a></li>
    <li>You'll receive updates on ${horseName}'s training and racing schedule</li>
    <li>Race entries and results will appear in your stable feed</li>
  </ul>

  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      <strong>Note:</strong> Your official signed agreements (PDS and Syndicate Agreement) are being processed and will appear in your MyStable portal shortly.
    </p>
  </div>

  <p style="margin-top: 32px;">
    <a href="${appUrl}/mystable" style="display: inline-block; background: #0a0a0a; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 4px;">
      View MyStable →
    </a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
  <p style="font-size: 12px; color: #999;">
    Evolution Stables — Digital thoroughbred syndication.<br>
    This email was sent to confirm your syndicate acquisition.
  </p>
</body>
</html>
  `.trim();
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  logPrefix?: string;
}): Promise<void> {
  const nodemailer = await import("nodemailer");
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const logPrefix = params.logPrefix || "[checkout-fulfill]";

  if (!params.to) {
    console.warn(`${logPrefix} No recipient — skipping email`);
    return;
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      `${logPrefix} SMTP not configured — skipping email send (SMTP_HOST/USER/PASS missing)`
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: parseInt(SMTP_PORT || "587", 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      "Evolution Stables <noreply@evolutionstables.co.nz>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
