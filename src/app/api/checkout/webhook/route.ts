import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
  checkHoldingExists,
  appendHolding,
  appendCommunication,
  readInventoryBySlug,
  updateInventorySharesSold,
} from '@/lib/google-sheets';

const WEBHOOK_SECRET =
  process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    if (!sigHeader) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'STRIPE_CHECKOUT_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET) not configured' },
        { status: 500 }
      );
    }

    // Verify Stripe signature
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, sigHeader, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Stripe signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const result = await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        return NextResponse.json({ received: true, ...result });
      }

      case 'checkout.session.expired':
        console.log('Checkout session expired:', (event.data.object as any).id);
        break;

      default:
        console.log(`Unhandled checkout event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Checkout webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process checkout webhook' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Main handler: checkout.session.completed
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<{ duplicate?: boolean }> {
  const meta = session.metadata || {};
  const sessionId = session.id;
  const userEmail = meta.user_email || '';
  const hltId = meta.hlt_id || '';
  const sharesToBuy = parseInt(meta.shares_to_buy || '0', 10);
  const pricePerShareFromMeta = parseFloat(meta.price_per_share_nzd || '0');

  console.log(`[webhook] Processing checkout.session.completed: ${sessionId}`, {
    userEmail,
    hltId,
    sharesToBuy,
  });

  // Step 1: Idempotency check — skip if already processed
  // -------------------------------------------------------------------------
  try {
    const alreadyExists = await checkHoldingExists(sessionId);
    if (alreadyExists) {
      console.log(`[webhook] Duplicate webhook delivery for ${sessionId} — skipping (idempotent)`);
      return { duplicate: true };
    }
  } catch (err: any) {
    console.error(`[webhook] Idempotency check failed for ${sessionId}:`, err.message);
    // Fail safe: continue processing — better to risk a duplicate than lose payment data
  }

  // Step 2: Amount validation — verify session.amount_total matches expected
  // -------------------------------------------------------------------------
  let amountMismatch = false;
  let expectedTotalCents = 0;
  let pricePerShareNzd = pricePerShareFromMeta;
  let horseDisplayName = hltId; // fallback to slug, upgraded to display name if inventory read succeeds

  try {
    // Read authoritative price from Inventory sheet
    const inventory = await readInventoryBySlug(hltId);
    if (inventory) {
      pricePerShareNzd = inventory.price_per_share_nzd;
      if (inventory.name) {
        horseDisplayName = inventory.name;
      }
    } else {
      console.warn(`[webhook] Could not read inventory for ${hltId} — using metadata price`);
    }

    expectedTotalCents = Math.round(sharesToBuy * pricePerShareNzd * 100);
    const actualTotalCents = session.amount_total || 0;

    if (expectedTotalCents !== actualTotalCents) {
      amountMismatch = true;
      console.error(
        `[webhook] CRITICAL: Amount mismatch for ${sessionId} — expected ${expectedTotalCents} cents, got ${actualTotalCents} cents. Flagging for manual review.`
      );
    }
  } catch (err: any) {
    console.error(`[webhook] Amount validation failed for ${sessionId}:`, err.message);
    // Continue — we'll still record the holding with whatever data we have
  }

  // Step 3: Record holding to Google Sheets
  // -------------------------------------------------------------------------
  const purchasePriceTotalNzd = (session.amount_total || 0) / 100;
  const timestamp = new Date().toISOString();

  const holdingRow = {
    purchase_id: sessionId,
    timestamp,
    user_email: userEmail,
    horse_slug: hltId,
    shares_owned: sharesToBuy,
    purchase_price_total_nzd: purchasePriceTotalNzd,
    signed_pds_url: '', // PDF pipeline deferred to post-Stage 1
    signed_sa_url: '',
    kyc_status: 'verified',
    utm_source: 'pending', // Attribution engine deferred
    utm_campaign: 'pending',
  };

  try {
    await appendHolding(holdingRow);
    console.log(`[webhook] ✅ Holding recorded for ${sessionId}`);
  } catch (err: any) {
    console.error(`[webhook] CRITICAL: Failed to record holding for ${sessionId}:`, err.message);
    // The holding is the canonical payment record. If we can't record it,
    // do not update inventory or send email — that would create orphaned state.
    // Re-throw to halt processing. Stripe will retry the webhook.
    throw new Error(`Holding record failed for ${sessionId}: ${err.message}`);
  }

  // Step 4: Update inventory shares_sold
  // -------------------------------------------------------------------------
  try {
    const inventory = await readInventoryBySlug(hltId);
    if (inventory) {
      const currentSold = inventory.shares_sold;
      const newSold = currentSold + sharesToBuy;
      const sharesTotal = inventory.shares_total;

      await updateInventorySharesSold(hltId, newSold);

      if (newSold > sharesTotal) {
        console.error(
          `[webhook] CRITICAL OVERSELL ALERT: ${hltId} — shares_sold ${newSold} exceeds shares_total ${sharesTotal}. Session ${sessionId}. Manual reconciliation/refund required.`
        );
      }

      console.log(`[webhook] ✅ Inventory updated for ${hltId}: ${currentSold} → ${newSold}`);
    } else {
      console.warn(`[webhook] Could not update inventory — slug ${hltId} not found in Sheets`);
    }
  } catch (err: any) {
    console.error(`[webhook] Failed to update inventory for ${hltId}:`, err.message);
    // Non-fatal — holding is already recorded
  }

  // Step 5: Send welcome email via nodemailer/SMTP
  // -------------------------------------------------------------------------
  let emailHtml = '';
  let emailSubject = '';
  let emailSnippet = '';

  try {
    emailSubject = `Welcome to the ${horseDisplayName} Syndicate!`;
    emailSnippet = `Your ${sharesToBuy} share${sharesToBuy > 1 ? 's' : ''} in ${horseDisplayName} ${sharesToBuy > 1 ? 'have' : 'has'} been confirmed.`;
    emailHtml = buildWelcomeEmailHtml({
      horseName: horseDisplayName,
      sharesOwned: sharesToBuy,
      purchasePriceTotalNzd,
    });

    await sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`[webhook] ✅ Welcome email sent to ${userEmail}`);
  } catch (err: any) {
    console.error(`[webhook] Failed to send welcome email to ${userEmail}:`, err.message);
    // Non-fatal — holding + inventory already processed
  }

  // Step 5b: Send admin notification email
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
        subject: `[Acquisition] ${sharesToBuy} share${sharesToBuy > 1 ? 's' : ''} in ${horseDisplayName} — ${userEmail}`,
        html: adminHtml,
      });
      console.log(`[webhook] ✅ Admin notification sent to ${adminEmail}`);
    }
  } catch (err: any) {
    console.error(`[webhook] Failed to send admin notification:`, err.message);
    // Non-fatal
  }

  // Step 6: Log communication to Google Sheets
  // -------------------------------------------------------------------------
  try {
    await appendCommunication({
      timestamp,
      recipient_email: userEmail,
      subject: emailSubject || `Welcome to the ${horseDisplayName} Syndicate!`,
      snippet: emailSnippet || 'Syndication share purchase confirmed.',
      body_html: emailHtml || '',
      category: 'welcome',
    });
    console.log(`[webhook] ✅ Communication logged for ${sessionId}`);
  } catch (err: any) {
    console.error(`[webhook] Failed to log communication for ${sessionId}:`, err.message);
    // Non-fatal — holding + inventory already processed
  }

  // Log final status
  if (amountMismatch) {
    console.error(
      `[webhook] ⚠️ Session ${sessionId} completed with amount mismatch — needs manual review`
    );
  }
  console.log(`[webhook] Processing complete for ${sessionId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Email helpers
// ---------------------------------------------------------------------------

interface WelcomeEmailData {
  horseName: string;
  sharesOwned: number;
  purchasePriceTotalNzd: number;
}

function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const { horseName, sharesOwned, purchasePriceTotalNzd } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://evolutionstables.co.nz';

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

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(params: SendEmailParams): Promise<void> {
  // Dynamic import so nodemailer doesn't affect bundle when SMTP not configured
  const nodemailer = await import('nodemailer');

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[webhook] SMTP not configured — skipping email send (SMTP_HOST/USER/PASS missing)');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: parseInt(SMTP_PORT || '587', 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Evolution Stables <noreply@evolutionstables.co.nz>',
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}