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
    badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-300/80",
    dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    canPurchase: false,
    showPrice: false,
  },
  "become-an-owner": {
    label: "Become An Owner",
    badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300/80",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    canPurchase: true,
    showPrice: false, // No price on the card — emotional entry
  },
  "fully-subscribed": {
    label: "Fully Subscribed",
    badgeClass: "bg-zinc-500/10 border-zinc-500/20 text-zinc-300/60",
    dotClass: "bg-zinc-500",
    canPurchase: false,
    showPrice: false,
  },
  "term-completed": {
    label: "Term Completed",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-300/60",
    dotClass: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.3)]",
    canPurchase: false,
    showPrice: false,
  },
};