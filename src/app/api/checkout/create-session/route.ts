import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';
import { getLiveInventory } from '@/lib/google-sheets';

// Load HLT data statically (baked at build for api route) — used as fallback only
import hltsModule from '@/data/hlts.json';

const hlts = (hltsModule as any).default || (hltsModule as any);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id: bodyUserId, hlt_id, shares_to_buy, bypass_kyc, user_email } = body;

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

    if (!userId || !hlt_id || !shares_to_buy) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id, hlt_id, shares_to_buy' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // --- Live inventory check (Phase 3: concurrency control) ---
    // Attempt live read from Google Sheets; fall back to static JSON if Sheets unavailable
    let pricePerShareNzd: number;
    let sharesAvailable: number | null = null;
    let horseName: string;
    let leasePeriodMonths: number;
    let investorReturnPct: number;

    const liveInventory = await getLiveInventory(hlt_id);

    if (liveInventory) {
      // Price from Sheets (authoritative — prevents client-side price tampering)
      pricePerShareNzd = liveInventory.price_per_share_nzd;
      sharesAvailable = liveInventory.shares_available;
      horseName = liveInventory.name || hlt_id;
      leasePeriodMonths = liveInventory.leasePeriodMonths || 36;
      investorReturnPct = liveInventory.investorReturnPct || 80;

      // Concurrency check: reject if not enough shares
      if (sharesAvailable !== null && shares_to_buy > sharesAvailable) {
        return NextResponse.json(
          {
            error: 'Insufficient shares available',
            shares_available: sharesAvailable,
            shares_requested: shares_to_buy,
          },
          { status: 409 }
        );
      }
    } else {
      // Fallback: static JSON (Sheets unavailable)
      console.warn(`[checkout] Google Sheets unavailable, falling back to static JSON for ${hlt_id}`);
      const hlt = hlts.find((h: any) => (h.horse_slug || h.id) === hlt_id);
      if (!hlt) {
        return NextResponse.json({ error: 'HLT not found' }, { status: 404 });
      }
      pricePerShareNzd = hlt.price_per_share_nzd || 1500;
      horseName = hlt.horse_name || hlt_id;
      leasePeriodMonths = hlt.lease_period_months || 36;
      investorReturnPct = hlt.investor_return_pct || 80;
      // No live shares_available — skip concurrency check (Sheets is down)
    }

    // Create Stripe Checkout session with authoritative price from Sheets
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: shares_to_buy,
          price_data: {
            currency: 'nzd',
            unit_amount: Math.round(pricePerShareNzd * 100), // per share in cents (Math.round prevents float errors)
            product_data: {
              name: `${horseName} — Share${shares_to_buy > 1 ? 's' : ''}`,
              description: `Syndication share${shares_to_buy > 1 ? 's' : ''} in ${horseName}. ${leasePeriodMonths}-month lease, ${investorReturnPct}% return to investors.`,
            },
          },
        },
      ],
      metadata: {
        user_id: userId,
        user_email: verifiedEmail || user_email || '',
        hlt_id,
        shares_to_buy: String(shares_to_buy),
        price_per_share_nzd: String(pricePerShareNzd),
        horse_microchip: body.horse_microchip || '',
        bypass_kyc: String(bypass_kyc || false),
      },
      success_url: `${appUrl}/mystable?success=true`,
      cancel_url: `${appUrl}/marketplace/${hlt_id}`,
    });

    return NextResponse.json({ session_url: session.url, session_id: session.id });
  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}