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
    const campaignStatus = staticHlt
      ? getCampaignStatus(staticHlt)
      : undefined;

    let live: Awaited<ReturnType<typeof getLiveInventory>> = null;
    try {
      live = await getLiveInventory(slug);
    } catch (err: any) {
      console.warn(`[API Inventory] live read failed for ${slug}:`, err?.message);
    }

    // Eligibility for UI: do not require live inventory just to show closed state
    const eligibility = checkPurchaseEligibility(
      slug,
      staticHlt,
      live
        ? {
            listing_status: live.listing_status,
            shares_available: live.shares_available,
            price_per_share_nzd: live.price_per_share_nzd,
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

    return NextResponse.json({
      slug,
      name: live?.name || staticHlt?.horse_name || slug,
      shares_sold: sharesSold,
      shares_total: sharesTotal,
      shares_available: sharesAvailable,
      listing_status:
        live?.listing_status || staticHlt?.listing_status || "draft",
      price_per_share_nzd: live
        ? live.price_per_share_nzd
        : Number(staticHlt?.price_per_share_nzd || 0),
      totalLeasePercent: live?.totalLeasePercent ?? null,
      leasePeriodMonths:
        live?.leasePeriodMonths ?? staticHlt?.lease_period_months ?? null,
      leaseStartDate: live?.leaseStartDate ?? staticHlt?.lease_start_date ?? null,
      investorReturnPct:
        live?.investorReturnPct ?? staticHlt?.investor_return_pct ?? null,
      // Explicit gate for PurchaseFlow — do not infer from shares alone
      purchasable: eligibility.allowed,
      purchases_enabled: isPurchasesEnabled(),
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
