import { NextRequest, NextResponse } from "next/server";
import { getLiveInventory } from "@/lib/google-sheets";
import { getCampaignStatus } from "@/lib/campaign-status";
import {
  checkPurchaseEligibility,
  findStaticHlt,
  isPurchasesEnabled,
} from "@/lib/purchase-eligibility";
import hltsModule from "@/data/hlts.json";

export const dynamic = "force-dynamic";

const hlts = (hltsModule as any).default || (hltsModule as any);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const staticHlt = findStaticHlt(hlts, slug);

    let live: Awaited<ReturnType<typeof getLiveInventory>> = null;
    try {
      live = await getLiveInventory(slug);
    } catch (err: any) {
      console.warn(`[API Inventory] live read failed for ${slug}:`, err?.message);
    }

    // Prefer live campaign_status / listing when present; static fallback
    const campaignStatus = getCampaignStatus({
      campaign_status: live?.campaign_status || staticHlt?.campaign_status,
      listing_status: live?.listing_status || staticHlt?.listing_status,
      shares_total: live?.shares_total ?? staticHlt?.shares_total,
      shares_sold: live?.shares_sold ?? staticHlt?.shares_sold,
      has_terms_sheet: staticHlt?.has_terms_sheet,
      marketplace_visible:
        live?.marketplace_visible ?? staticHlt?.marketplace_visible,
    });

    // Eligibility for UI: do not require live inventory just to show closed state
    const eligibility = checkPurchaseEligibility(
      slug,
      staticHlt,
      live
        ? {
            campaign_status: live.campaign_status,
            listing_status: live.listing_status,
            shares_total: live.shares_total,
            shares_sold: live.shares_sold,
            shares_available: live.shares_available,
            price_per_share_nzd: live.price_per_share_nzd,
            marketplace_visible: live.marketplace_visible,
          }
        : null,
      1,
      {
        purchasesEnabled: isPurchasesEnabled(),
        // UI probe: static closed is enough; live only matters if sales are on
        requireLiveInventory: false,
      }
    );

    // Prefer live ops numbers when present; fall back to static for display fields
    const sharesTotal = live
      ? Number(live.shares_total)
      : Number(staticHlt?.shares_total || 0);
    const sharesSold = live
      ? Number(live.shares_sold)
      : Number(staticHlt?.shares_sold || 0);
    let sharesAvailable = live
      ? Number(live.shares_available)
      : Math.max(0, sharesTotal - sharesSold);

    // Never advertise buyable stock for non-purchasable horses
    if (!eligibility.allowed) {
      sharesAvailable = 0;
    }

    if (!staticHlt && !live) {
      return NextResponse.json(
        { error: `Horse slug ${slug} not found in inventory` },
        { status: 404 }
      );
    }

    // Prefer live lot price (may be null); static only when no live row. Never invent 1500.
    let pricePerShare: number | null = null;
    if (live) {
      pricePerShare =
        live.price_per_share_nzd != null &&
        Number.isFinite(Number(live.price_per_share_nzd))
          ? Number(live.price_per_share_nzd)
          : null;
    } else if (
      staticHlt?.price_per_share_nzd != null &&
      staticHlt.price_per_share_nzd !== "" &&
      Number.isFinite(Number(staticHlt.price_per_share_nzd))
    ) {
      pricePerShare = Number(staticHlt.price_per_share_nzd);
    }

    return NextResponse.json({
      slug,
      name: live?.name || staticHlt?.horse_name || slug,
      shares_sold: sharesSold,
      shares_total: sharesTotal,
      shares_available: sharesAvailable,
      listing_status:
        live?.listing_status || staticHlt?.listing_status || "draft",
      marketplace_visible:
        live?.marketplace_visible ?? staticHlt?.marketplace_visible ?? null,
      price_per_share_nzd: pricePerShare,
      totalLeasePercent: live?.totalLeasePercent ?? null,
      leasePeriodMonths:
        live?.leasePeriodMonths ?? staticHlt?.lease_period_months ?? null,
      leaseStartDate: live?.leaseStartDate ?? staticHlt?.lease_start_date ?? null,
      investorReturnPct:
        live?.investorReturnPct ?? staticHlt?.investor_return_pct ?? null,
      // Explicit gate for PurchaseFlow — do not infer from shares alone
      purchasable: eligibility.allowed,
      purchases_enabled: isPurchasesEnabled(),
      // Canonical lifecycle from campaign-status module (not raw sheet only)
      campaign_status: campaignStatus ?? eligibility.campaignStatus ?? null,
      eligibility_code: eligibility.code,
      eligibility_reason: eligibility.reason,
    });
  } catch (err: any) {
    console.error(`[API Inventory] Error fetching live inventory:`, err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch live inventory" },
      { status: 500 }
    );
  }
}
