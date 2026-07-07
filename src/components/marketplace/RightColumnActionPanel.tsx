"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { InvestmentTermsModal } from "./InvestmentTermsModal";
import { STATUS_INFO, getCampaignStatus, type CampaignStatus } from "@/lib/campaign-status";

interface RightColumnActionPanelProps {
  horseSlug: string;
  horseName: string;
}

interface LiveInventory {
  shares_total: number;
  shares_sold: number;
  shares_available: number;
  listing_status: string;
  price_per_share_nzd: number;
  totalLeasePercent: number | string;
  leasePeriodMonths: number | string;
  leaseStartDate: string;
  investorReturnPct: number | string;
}

export function RightColumnActionPanel({
  horseSlug,
  horseName,
}: RightColumnActionPanelProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [inventory, setInventory] = useState<LiveInventory | null>(null);

  // Only fetch live inventory when user is authenticated
  useEffect(() => {
    if (!user) return;
    async function fetchLive() {
      try {
        const res = await fetch(`/api/inventory/${encodeURIComponent(horseSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setInventory(data);
        }
      } catch (err) {
        console.error("Failed to fetch live inventory:", err);
      }
    }
    fetchLive();
  }, [horseSlug, user]);

  const sharesTotal = inventory?.shares_total ?? 0;
  const sharesAvailable = inventory?.shares_available ?? 0;
  const sharesSold = inventory ? inventory.shares_sold : 0;
  const status: CampaignStatus = inventory
    ? getCampaignStatus({
        listing_status: inventory.listing_status,
        shares_total: inventory.shares_total,
        shares_sold: inventory.shares_sold,
      })
    : "coming-soon";

  const handleSignInRedirect = () => {
    const targetUrl = `/marketplace/${horseSlug}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(targetUrl)}`);
  };

  // While loading auth state, show a subtle loading skeleton
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-5/6" />
          <div className="h-4 bg-white/5 rounded w-2/3" />
        </div>
        <div className="h-12 bg-white/10 rounded-full w-full" />
      </div>
    );
  }

  // Guest view: Render a premium skeleton overlay — NO investment data in DOM
  if (!user) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
        {/* Visual Skeleton placeholders */}
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <div className="h-5 bg-white/10 rounded w-24" />
          <div className="h-4 bg-white/5 rounded w-16" />
        </div>

        <div className="space-y-4 py-2">
          <div className="flex justify-between border-b border-white/[0.04] pb-3">
            <div className="h-4 bg-white/5 rounded w-28" />
            <div className="h-4 bg-white/10 rounded w-20" />
          </div>
          <div className="flex justify-between border-b border-white/[0.04] pb-3">
            <div className="h-4 bg-white/5 rounded w-36" />
            <div className="h-4 bg-white/10 rounded w-12" />
          </div>
          <div className="flex justify-between border-b border-white/[0.04] pb-3">
            <div className="h-4 bg-white/5 rounded w-24" />
            <div className="h-4 bg-white/10 rounded w-16" />
          </div>
        </div>

        {/* Premium Blur Overlay + CTA */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center z-10 transition-all duration-300">
          <div className="space-y-4 max-w-xs">
            <h4 className="text-[15px] font-medium tracking-wide text-white">
              Investment Terms Locked
            </h4>
            <p className="text-[11px] leading-relaxed text-white/60 font-light">
              Sign in with your verified investor profile to view pricing, lease structures, and returns.
            </p>
            <button
              onClick={handleSignInRedirect}
              className="w-full text-center py-3 rounded-full text-[11px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/40"
            >
              Sign In to View Terms
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated User view: Render the real data from live inventory
  const statusInfo = STATUS_INFO[status];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 border rounded-full px-3 py-1.5 ${statusInfo.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
          <span className="text-[9px] uppercase tracking-widest font-medium">
            {statusInfo.label}
          </span>
        </div>
        {status === "become-an-owner" && sharesTotal > 0 && (
          <span className="text-[12px] font-light text-white/40">
            {Math.round((sharesSold / sharesTotal) * 100)}% subscribed
          </span>
        )}
      </div>

      {status === "become-an-owner" && inventory && (
        <InvestmentTermsModal
          horseName={horseName}
          horseSlug={horseSlug}
          pricePerShareNzd={inventory.price_per_share_nzd}
          totalLeasePercent={inventory.totalLeasePercent}
          leasePeriodMonths={inventory.leasePeriodMonths}
          leaseStartDate={inventory.leaseStartDate}
          investorReturnPct={inventory.investorReturnPct}
          sharesTotal={sharesTotal}
          sharesAvailable={sharesAvailable}
        />
      )}

      {status === "coming-soon" && (
        <p className="text-[13px] font-light text-white/40 leading-relaxed">
          This offering is being prepared. Check back soon for details.
        </p>
      )}

      {status === "fully-subscribed" && (
        <p className="text-[13px] font-light text-white/40 leading-relaxed">
          All shares have been acquired. This horse is in active campaign.
        </p>
      )}

      {status === "term-completed" && (
        <p className="text-[13px] font-light text-white/40 leading-relaxed">
          The lease period for this horse has concluded.
        </p>
      )}
    </div>
  );
}