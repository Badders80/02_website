import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';
import { getLiveInventory } from '@/lib/google-sheets';
import { getLiveInventory as getLiveInventorySupabase } from '@/lib/supabase';
import {
  checkPurchaseEligibility,
  eligibilityHttpStatus,
  findStaticHlt,
} from '@/lib/purchase-eligibility';
import { roundUpListPriceNzd } from '@/lib/pricing';

// Load HLT data statically (baked at build for api route)
import hltsModule from '@/data/hlts.json';

const hlts = (hltsModule as any).default || (hltsModule as any);

/** Only allow return URLs on our app origin (open-redirect guard). */
function sameOriginUrl(candidate: unknown, appUrl: string): string | null {
  if (typeof candidate !== 'string' || !candidate.trim()) return null;
  try {
    const base = new URL(appUrl);
    const url = new URL(candidate, appUrl);
    if (url.origin !== base.origin) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Ensure Stripe can inject session id for post-pay confirm/recover. */
function ensureSessionIdPlaceholder(url: string): string {
  if (url.includes('{CHECKOUT_SESSION_ID}')) return url;
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}session_id={CHECKOUT_SESSION_ID}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id: bodyUserId, hlt_id, shares_to_buy, user_email, e_sign } = body;
    // Client bypass_kyc is ignored — never used to open sales or skip gates.

    // Verify caller via Firebase ID token (sent as Bearer)
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });
    }

    let verifiedUid: string;
    let verifiedEmail: string | undefined;
    try {
      const decoded = await verifyIdToken(token);
      verifiedUid = decoded.uid;
      verifiedEmail = decoded.email || '';
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = bodyUserId || verifiedUid;
    if (userId !== verifiedUid) {
      return NextResponse.json({ error: 'user_id mismatch with token' }, { status: 403 });
    }

    const sharesQty = Number(shares_to_buy);
    if (!userId || !hlt_id || !sharesQty || sharesQty < 1) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id, hlt_id, shares_to_buy' },
        { status: 400 }
      );
    }

    // Require sequential e-sign acknowledgements when client sends the e_sign block
    // (PurchaseFlow always sends it after PDS + SA steps).
    if (e_sign != null) {
      if (!e_sign.pds_agreed || !e_sign.sa_agreed) {
        return NextResponse.json(
          {
            error:
              'Product Disclosure Statement and Syndicate Agreement must both be e-signed before checkout.',
          },
          { status: 400 }
        );
      }
    }

    const staticHlt = findStaticHlt(hlts, hlt_id);

    // Live inventory for stock/price when sales enabled; eligibility still runs if null
    let liveInventory: Awaited<ReturnType<typeof getLiveInventory>> = null;
    try {
      liveInventory = await getLiveInventory(hlt_id);
    } catch (err: any) {
      console.warn(`[checkout] getLiveInventory failed for ${hlt_id}:`, err?.message);
      liveInventory = null;
    }

    // Shadow-read Supabase for reconciliation (Sheets remains primary).
    if (process.env.DUAL_WRITE_ENABLED === 'true') {
      try {
        const supabaseLive = await getLiveInventorySupabase(hlt_id);
        if ((supabaseLive ? 1 : 0) !== (liveInventory ? 1 : 0)) {
          console.warn('[dual-write] Inventory presence mismatch: Sheets=', !!liveInventory, 'Supabase=', !!supabaseLive);
        } else if (supabaseLive && liveInventory) {
          if (supabaseLive.shares_available !== liveInventory.shares_available) {
            console.warn('[dual-write] Inventory shares_available mismatch:', liveInventory.shares_available, 'vs', supabaseLive.shares_available);
          }
        }
      } catch (e: any) {
        console.error('[dual-write] Supabase shadow read failed:', e.message);
      }
    }

    const eligibility = checkPurchaseEligibility(
      hlt_id,
      staticHlt,
      liveInventory
        ? {
            campaign_status: liveInventory.campaign_status,
            listing_status: liveInventory.listing_status,
            shares_total: liveInventory.shares_total,
            shares_sold: liveInventory.shares_sold,
            shares_available: liveInventory.shares_available,
            price_per_share_nzd: liveInventory.price_per_share_nzd,
            marketplace_visible: liveInventory.marketplace_visible,
          }
        : null,
      sharesQty,
      { requireLiveInventory: true }
    );

    if (!eligibility.allowed) {
      console.warn(
        `[checkout] Rejected create-session slug=${hlt_id} uid=${verifiedUid} code=${eligibility.code} reason=${eligibility.reason}`
      );
      return NextResponse.json(
        {
          error: eligibility.reason,
          code: eligibility.code,
          campaign_status: eligibility.campaignStatus,
        },
        { status: eligibilityHttpStatus(eligibility.code) }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    // Eligibility passed ⇒ live inventory is present and valid
    const pricePerShareNzd = roundUpListPriceNzd(
      Number(liveInventory!.price_per_share_nzd)
    );
    if (!(pricePerShareNzd > 0)) {
      return NextResponse.json(
        { error: 'Live inventory price is invalid', code: 'PRICE_INVALID' },
        { status: 403 }
      );
    }
    const horseName = liveInventory!.name || staticHlt?.horse_name || hlt_id;
    // Prefer live lease fields; no invented 36mo / 80% commercial defaults
    const leasePeriodMonths = Number(liveInventory!.leasePeriodMonths || 0) || undefined;
    const investorReturnPct = Number(liveInventory!.investorReturnPct || 0) || undefined;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
      /\/$/,
      ''
    );

    // Prefer client return URLs when same-origin; else confirm page (not bare mystable).
    // Stripe replaces {CHECKOUT_SESSION_ID} for recover/ops correlation.
    const defaultSuccess = `${appUrl}/marketplace/${hlt_id}/confirm?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancel = `${appUrl}/marketplace/${hlt_id}/purchase`;
    const successUrl = sameOriginUrl(body.success_url, appUrl) || defaultSuccess;
    const cancelUrl = sameOriginUrl(body.cancel_url, appUrl) || defaultCancel;

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: sharesQty,
          price_data: {
            currency: 'nzd',
            unit_amount: Math.round(pricePerShareNzd * 100),
            product_data: {
              name: `${horseName} — Unit${sharesQty > 1 ? 's' : ''}`,
              description: [
                `Syndication unit${sharesQty > 1 ? 's' : ''} in ${horseName}.`,
                leasePeriodMonths ? `${leasePeriodMonths}-month lease.` : null,
                investorReturnPct != null
                  ? `${investorReturnPct}% of gross stakes to investors (pro-rata).`
                  : null,
              ]
                .filter(Boolean)
                .join(' '),
            },
          },
        },
      ],
      metadata: {
        user_id: userId,
        user_email: verifiedEmail || user_email || '',
        hlt_id,
        shares_to_buy: String(sharesQty),
        price_per_share_nzd: String(pricePerShareNzd),
        horse_microchip: body.horse_microchip || '',
        // In-app e-sign (PDS then SA) — Stripe metadata values must be strings ≤500 chars
        e_sign_name: String(e_sign?.signature_name || '').slice(0, 200),
        e_sign_pds: e_sign?.pds_agreed ? 'true' : 'false',
        e_sign_sa: e_sign?.sa_agreed ? 'true' : 'false',
        e_sign_pds_at: String(e_sign?.pds_signed_at || '').slice(0, 40),
        e_sign_sa_at: String(e_sign?.sa_signed_at || '').slice(0, 40),
      },
      success_url: ensureSessionIdPlaceholder(successUrl),
      cancel_url: cancelUrl,
    });

    // Both keys: clients historically expect `url`; route previously returned session_url only
    return NextResponse.json({
      url: session.url,
      session_url: session.url,
      session_id: session.id,
    });
  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
