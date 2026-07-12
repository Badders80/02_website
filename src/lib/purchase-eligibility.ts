/**
 * Purchase eligibility — single gate for create-session + purchase UI.
 *
 * Policy (closed catalog phase):
 * - PURCHASES_ENABLED must be exactly "true" (default: off)
 * - Static hlts.json + getCampaignStatus is SSOT for "is this open?"
 * - Live Inventory cannot open a closed campaign; it only validates stock/price when open
 */

import { getCampaignStatus, type CampaignStatus } from "./campaign-status";

export type EligibilityCode =
  | "PURCHASES_DISABLED"
  | "INVALID_SLUG"
  | "CAMPAIGN_CLOSED"
  | "PRICE_INVALID"
  | "STOCK_EXHAUSTED"
  | "INVENTORY_UNAVAILABLE"
  | "ELIGIBLE";

export interface EligibilityResult {
  allowed: boolean;
  reason: string;
  code: EligibilityCode;
  campaignStatus?: CampaignStatus;
}

/** Minimal static HLT shape used for campaign status + price. */
export type StaticHlt = {
  horse_slug?: string;
  id?: string;
  horse_name?: string;
  listing_status?: string;
  shares_total?: number | string;
  shares_sold?: number | string;
  has_terms_sheet?: boolean;
  price_per_share_nzd?: number | string;
  lease_period_months?: number | string;
  lease_start_date?: string;
  investor_return_pct?: number | string;
};

export type LiveInventorySnapshot = {
  listing_status?: string;
  shares_available?: number | string;
  price_per_share_nzd?: number | string;
};

/** Server kill-switch. Unset/false = purchases closed. */
export function isPurchasesEnabled(
  envValue: string | undefined = process.env.PURCHASES_ENABLED
): boolean {
  return envValue === "true";
}

/** Map eligibility codes to HTTP status for API responses. */
export function eligibilityHttpStatus(code: EligibilityCode): number {
  if (code === "STOCK_EXHAUSTED") return 409;
  if (code === "ELIGIBLE") return 200;
  // Policy / closed / missing / unconfigured / ops unavailable
  return 403;
}

/**
 * Deterministic purchase gate.
 * Pass `purchasesEnabled` when calling from client or tests (server defaults to env).
 */
export function checkPurchaseEligibility(
  slug: string,
  staticHltData: StaticHlt | null | undefined,
  liveInventory?: LiveInventorySnapshot | null,
  sharesToBuy: number = 1,
  options?: { purchasesEnabled?: boolean; requireLiveInventory?: boolean }
): EligibilityResult {
  const purchasesEnabled =
    options?.purchasesEnabled ?? isPurchasesEnabled();
  // When opening sales, create-session must not charge without live stock (fail closed).
  const requireLive =
    options?.requireLiveInventory ?? purchasesEnabled;

  // 1. Global kill-switch
  if (!purchasesEnabled) {
    return {
      allowed: false,
      reason: "Public share applications are currently closed.",
      code: "PURCHASES_DISABLED",
    };
  }

  // 2. Static registry
  if (!staticHltData) {
    return {
      allowed: false,
      reason: "Asset registry entry not found.",
      code: "INVALID_SLUG",
      campaignStatus: undefined,
    };
  }

  // 3. Campaign status (static SSOT — live sheet cannot open a closed campaign)
  const campaignStatus = getCampaignStatus(staticHltData);
  if (campaignStatus !== "become-an-owner") {
    return {
      allowed: false,
      reason: `This syndicate is not accepting allocations (Current status: ${campaignStatus}).`,
      code: "CAMPAIGN_CLOSED",
      campaignStatus,
    };
  }

  // 4. Static price
  const staticPrice = Number(staticHltData.price_per_share_nzd || 0);
  if (!(staticPrice > 0)) {
    return {
      allowed: false,
      reason: "Syndicate application asset pricing is unconfigured.",
      code: "PRICE_INVALID",
      campaignStatus,
    };
  }

  // 5. Live ops (required for checkout when purchases enabled)
  if (requireLive && !liveInventory) {
    return {
      allowed: false,
      reason: "Operational inventory is unavailable. Checkout is closed until inventory is reachable.",
      code: "INVENTORY_UNAVAILABLE",
      campaignStatus,
    };
  }

  if (liveInventory) {
    const liveStatus = (liveInventory.listing_status || "").toLowerCase();
    const liveShares = Number(liveInventory.shares_available ?? 0);
    const livePrice = Number(liveInventory.price_per_share_nzd ?? 0);

    if (
      liveStatus === "draft" ||
      liveStatus === "retired" ||
      liveStatus === "completed"
    ) {
      return {
        allowed: false,
        reason: "Syndicate allocations are not active in operational inventory.",
        code: "CAMPAIGN_CLOSED",
        campaignStatus,
      };
    }

    if (!(livePrice > 0)) {
      return {
        allowed: false,
        reason: "Operational inventory transaction price is invalid.",
        code: "PRICE_INVALID",
        campaignStatus,
      };
    }

    if (liveShares < sharesToBuy) {
      return {
        allowed: false,
        reason: "Requested share count exceeds remaining available balance.",
        code: "STOCK_EXHAUSTED",
        campaignStatus,
      };
    }
  }

  return {
    allowed: true,
    reason: "Asset is ready for allocation application.",
    code: "ELIGIBLE",
    campaignStatus,
  };
}

/** Find static HLT row by horse slug. */
export function findStaticHlt(
  hlts: StaticHlt[],
  slug: string
): StaticHlt | undefined {
  return hlts.find((h) => (h.horse_slug || h.id) === slug);
}
