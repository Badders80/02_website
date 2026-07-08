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
  // For coming-soon horses, show "View Investment Terms" button → glassmorphic modal
  if (!user) {
    if (status === "coming-soon") {
      return (
        <div className="space-y-4">
          <ComingSoonTermsModal horseName={horseName} horseSlug={horseSlug} />
        </div>
      );
    }
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
        <ComingSoonTermsModal horseName={horseName} horseSlug={horseSlug} />
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

// --- Coming Soon Terms Modal — "View Investment Terms" button + glassmorphic modal ---
function ComingSoonTermsModal({ horseName, horseSlug }: { horseName: string; horseSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98]"
      >
        View Investment Terms
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-lg w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-xl"
            >
              ✕
            </button>

            {/* Title */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                Digital-Syndication Terms
              </p>
              <h3 className="text-[22px] font-light text-white tracking-tight">
                {horseName}
              </h3>
            </div>

            {/* Blurred investment terms — visible but locked */}
            <div className="space-y-4 text-[13px] font-light select-none pointer-events-none" aria-hidden="true">
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Price per share</span>
                <span className="text-white/50 blur-sm">— NZD</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Total lease percentage</span>
                <span className="text-white/50 blur-sm">—%</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Lease period</span>
                <span className="text-white/50 blur-sm">— months</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Lease start date</span>
                <span className="text-white/50 blur-sm">—</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Investor returns</span>
                <span className="text-white/50 blur-sm">—% of stakes won</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/40">Capital calls</span>
                <span className="text-white/50 blur-sm">None</span>
              </div>
            </div>

            {/* Coming Soon notification card inside the modal */}
            <div className="border-t border-white/[0.06] pt-6">
              <ComingSoonCard horseName={horseName} horseSlug={horseSlug} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Coming Soon notification card ---
function ComingSoonCard({ horseName, horseSlug }: { horseName: string; horseSlug: string }) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill email if logged in
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      if (user) {
        const token = await user.getIdToken();
        await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            horse_slug: horseSlug,
            horse_name: horseName,
            action_type: "waitlist",
            user_email: email.trim(),
          }),
        });
      } else {
        // Guest — use the subscribe endpoint which doesn't require auth
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            horse_slug: horseSlug,
            horse_name: horseName,
          }),
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Lead capture failed:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Coming Soon</p>
        <h4 className="text-[16px] font-light text-white leading-snug">
          Be the first to know when {horseName} goes live.
        </h4>
      </div>

      {submitted ? (
        <div className="py-3 text-center">
          <p className="text-[12px] font-light text-white/60 leading-relaxed">
            You&apos;re on the list. We&apos;ll contact you when {horseName} opens for acquisition.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="w-full text-center py-3 rounded-full text-[11px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
          >
            {loading ? "Submitting..." : "Notify Me"}
          </button>
        </div>
      )}
    </div>
  );
}