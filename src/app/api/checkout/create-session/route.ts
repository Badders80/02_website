import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';
import { getLiveInventory } from '@/lib/google-sheets';
import {
  checkPurchaseEligibility,
  eligibilityHttpStatus,
  findStaticHlt,
} from '@/lib/purchase-eligibility';

// Load HLT data statically (baked at build for api route)
import hltsModule from '@/data/hlts.json';

const hlts = (hltsModule as any).default || (hltsModule as any);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id: bodyUserId, hlt_id, shares_to_buy, user_email } = body;
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

    const staticHlt = findStaticHlt(hlts, hlt_id);

    // Live inventory for stock/price when sales enabled; eligibility still runs if null
    let liveInventory: Awaited<ReturnType<typeof getLiveInventory>> = null;
    try {
      liveInventory = await getLiveInventory(hlt_id);
    } catch (err: any) {
      console.warn(`[checkout] getLiveInventory failed for ${hlt_id}:`, err?.message);
      liveInventory = null;
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
    const pricePerShareNzd = Number(liveInventory!.price_per_share_nzd);
    const horseName = liveInventory!.name || staticHlt?.horse_name || hlt_id;
    const leasePeriodMonths = liveInventory!.leasePeriodMonths || 36;
    const investorReturnPct = liveInventory!.investorReturnPct || 80;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: sharesQty,
          price_data: {
            currency: 'nzd',
            unit_amount: Math.round(pricePerShareNzd * 100),
            product_data: {
              name: `${horseName} — Share${sharesQty > 1 ? 's' : ''}`,
              description: `Syndication share${sharesQty > 1 ? 's' : ''} in ${horseName}. ${leasePeriodMonths}-month lease, ${investorReturnPct}% return to investors.`,
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
      },
      success_url: `${appUrl}/mystable?success=true`,
      cancel_url: `${appUrl}/marketplace/${hlt_id}`,
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
