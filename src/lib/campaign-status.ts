export type CampaignStatus = "coming-soon" | "become-an-owner" | "fully-subscribed" | "term-completed";

export interface StatusInfo {
  label: string;
  badgeClass: string;
  dotClass: string;
  canPurchase: boolean;
  showPrice: boolean;
}

export function getCampaignStatus(hlt: {
  listing_status?: string;
  shares_total?: number | string;
  shares_sold?: number | string;
}): CampaignStatus {
  const sharesTotal = Number(hlt.shares_total || 0);
  const sharesSold = Number(hlt.shares_sold || 0);

  if (hlt.listing_status === "retired") return "term-completed";
  if (sharesSold >= sharesTotal && sharesTotal > 0) return "fully-subscribed";
  if (hlt.listing_status === "active" && sharesSold < sharesTotal) return "become-an-owner";
  return "coming-soon";
}

export const STATUS_INFO: Record<CampaignStatus, StatusInfo> = {
  "coming-soon": {
    label: "Coming Soon",
    badgeClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    canPurchase: false,
    showPrice: false,
  },
  "become-an-owner": {
    label: "Become An Owner",
    badgeClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    canPurchase: true,
    showPrice: false, // No price on the card — emotional entry
  },
  "fully-subscribed": {
    label: "Fully Subscribed",
    badgeClass: "bg-zinc-900/60 border-zinc-100/40 text-zinc-100",
    dotClass: "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]",
    canPurchase: false,
    showPrice: false,
  },
  "term-completed": {
    label: "Term Completed",
    badgeClass: "bg-blue-600/20 border-blue-400/40 text-blue-200",
    dotClass: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
    canPurchase: false,
    showPrice: false,
  },
};