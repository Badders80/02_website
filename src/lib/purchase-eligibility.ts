/**
 * Purchase eligibility — single gate for create-session + purchase UI.
 *
 * Policy:
 * - PURCHASES_ENABLED must be exactly "true" (default: off) — global kill-switch
 * - Campaign must be `listed` (legacy become-an-owner normalizes to listed)
 * - Price valid; stock sufficient for sharesToBuy
 * - Prefer live inventory for campaign status + stock/price when provided;
 *   static registry is fallback for identity + missing live fields
 * - Live ops refine stock/price; kill-switch still wins
 */

import {
  getCampaignStatus,
  canPurchase as isListedStatus,
  normalizeCampaignStatus,
  type CampaignStatus,
  type CampaignStatusInput,
} from "./campaign-status";

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
  campaign_status?: string | null;
  listing_status?: string;
  shares_total?: number | string;
  shares_sold?: number | string;
  has_terms_sheet?: boolean;
  marketplace_visible?: boolean | string | null;
  price_per_share_nzd?: number | string | null;
  lease_period_months?: number | string;
  lease_start_date?: string;
  investor_return_pct?: number | string;
};

export type LiveInventorySnapshot = {
  campaign_status?: string | null;
  listing_status?: string;
  shares_total?: number | string;
  shares_sold?: number | string;
  shares_available?: number | string;
  price_per_share_nzd?: number | string | null;
  has_terms_sheet?: boolean;
  marketplace_visible?: boolean | string | null;
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

function resolveStatusSource(
  staticHlt: StaticHlt,
  live?: LiveInventorySnapshot | null
): CampaignStatusInput {
  if (!live) {
    return {
      campaign_status: staticHlt.campaign_status,
      listing_status: staticHlt.listing_status,
      shares_total: staticHlt.shares_total,
      shares_sold: staticHlt.shares_sold,
      has_terms_sheet: staticHlt.has_terms_sheet,
      marketplace_visible: staticHlt.marketplace_visible,
    };
  }

  // Prefer live ops for status signals; static fills gaps
  const liveSold =
    live.shares_sold != null
      ? live.shares_sold
      : live.shares_total != null && live.shares_available != null
        ? Number(live.shares_total) - Number(live.shares_available)
        : staticHlt.shares_sold;

  return {
    // Empty string from sheet must not block static/inference fallback
    campaign_status: live.campaign_status || staticHlt.campaign_status,
    listing_status: live.listing_status || staticHlt.listing_status,
    shares_total: live.shares_total ?? staticHlt.shares_total,
    shares_sold: liveSold ?? staticHlt.shares_sold,
    has_terms_sheet: live.has_terms_sheet ?? staticHlt.has_terms_sheet,
    marketplace_visible:
      live.marketplace_visible ?? staticHlt.marketplace_visible,
  };
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

  // 3. Campaign status — prefer live ops when provided; static fallback
  const campaignStatus = getCampaignStatus(
    resolveStatusSource(staticHltData, liveInventory)
  );

  if (!isListedStatus(campaignStatus)) {
    return {
      allowed: false,
      reason: `This syndicate is not accepting allocations (Current status: ${campaignStatus}).`,
      code: "CAMPAIGN_CLOSED",
      campaignStatus,
    };
  }

  // 4. Price — prefer live when present
  const staticPrice = Number(staticHltData.price_per_share_nzd || 0);
  const livePrice =
    liveInventory != null
      ? Number(liveInventory.price_per_share_nzd ?? 0)
      : null;
  const effectivePrice =
    livePrice != null && livePrice > 0 ? livePrice : staticPrice;

  if (!(effectivePrice > 0)) {
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
      reason:
        "Operational inventory is unavailable. Checkout is closed until inventory is reachable.",
      code: "INVENTORY_UNAVAILABLE",
      campaignStatus,
    };
  }

  if (liveInventory) {
    const liveShares = Number(liveInventory.shares_available ?? 0);
    const priceFromLive = Number(liveInventory.price_per_share_nzd ?? 0);

    // Explicit non-purchasable signals from live ops (do not re-infer from incomplete rows)
    const liveCanonical = normalizeCampaignStatus(liveInventory.campaign_status);
    if (liveCanonical && !isListedStatus(liveCanonical)) {
      return {
        allowed: false,
        reason:
          "Syndicate allocations are not active in operational inventory.",
        code: "CAMPAIGN_CLOSED",
        campaignStatus: liveCanonical,
      };
    }

    const liveListing = String(liveInventory.listing_status || "")
      .trim()
      .toLowerCase();
    if (
      liveListing === "draft" ||
      liveListing === "retired" ||
      liveListing === "completed"
    ) {
      return {
        allowed: false,
        reason:
          "Syndicate allocations are not active in operational inventory.",
        code: "CAMPAIGN_CLOSED",
        campaignStatus,
      };
    }

    if (!(priceFromLive > 0)) {
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
        reason:
          "Requested share count exceeds remaining available balance.",
        code: "STOCK_EXHAUSTED",
        campaignStatus,
      };
    }
  } else {
    // Static-only path (UI probe with requireLiveInventory: false)
    const total = Number(staticHltData.shares_total || 0);
    const sold = Number(staticHltData.shares_sold || 0);
    const available = Math.max(0, total - sold);
    if (available < sharesToBuy) {
      return {
        allowed: false,
        reason:
          "Requested share count exceeds remaining available balance.",
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
