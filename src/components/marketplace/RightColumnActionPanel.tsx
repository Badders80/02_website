"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { InvestmentTermsModal } from "./InvestmentTermsModal";
import { RegistrationGate } from "./RegistrationGate";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { STATUS_INFO, getCampaignStatus, type CampaignStatus } from "@/lib/campaign-status";

interface StaticTerms {
  price_per_share_nzd: number;
  totalLeasePercent: number | string;
  leasePeriodMonths: number | string;
  leaseStartDate: string;
  investorReturnPct: number | string;
  shares_total: number;
  shares_sold: number;
  ownerRatePer1PctMonth?: number | null;
  platformFeePct?: number | null;
}

interface RightColumnActionPanelProps {
  horseSlug: string;
  horseName: string;
  initialListingStatus?: string;
  /** First-class campaign lifecycle from server (live or static). */
  initialCampaignStatus?: string | null;
  marketplaceVisible?: boolean | string | null;
  hasTermsSheet?: boolean;
  staticTerms?: StaticTerms;
}

interface LiveInventory {
  shares_total: number;
  shares_sold: number;
  shares_available: number;
  listing_status: string;
  campaign_status?: string | null;
  marketplace_visible?: boolean | string | null;
  price_per_share_nzd: number | null;
  totalLeasePercent: number | string | null;
  leasePeriodMonths: number | string | null;
  leaseStartDate: string;
  investorReturnPct: number | string | null;
  owner_rate_per_1pct_month?: number | null;
  platform_fee_pct?: number | null;
}

const TERMS_SKELETON_LABELS = [
  "Price",
  "Minimum investment",
  "Lease period",
  "Lease start date",
  "Units available",
  "Syndicate stake",
  "Investor returns",
  "Capital calls",
];

// Helper: determine if user tier can see real terms
type UserTier = "guest" | "auth" | "kyc";

function getUserTier(user: any, kycStatus: string): UserTier {
  if (!user) return "guest";
  if (kycStatus === "verified") return "kyc";
  return "auth";
}

export function RightColumnActionPanel({
  horseSlug,
  horseName,
  initialListingStatus,
  initialCampaignStatus,
  marketplaceVisible,
  hasTermsSheet,
  staticTerms,
}: RightColumnActionPanelProps) {
  const { user, loading, kycStatus } = useAuth();
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

  // Prefer live stock; server-passed staticTerms is first paint fallback
  const sharesTotal = inventory?.shares_total ?? staticTerms?.shares_total ?? 0;
  const sharesSold = inventory?.shares_sold ?? staticTerms?.shares_sold ?? 0;
  const sharesAvailable = Math.max(0, sharesTotal - sharesSold);
  const status: CampaignStatus = getCampaignStatus({
    campaign_status: inventory?.campaign_status || initialCampaignStatus,
    listing_status: inventory?.listing_status || initialListingStatus || "draft",
    shares_total: sharesTotal,
    shares_sold: sharesSold,
    has_terms_sheet: hasTermsSheet,
    marketplace_visible:
      inventory?.marketplace_visible ?? marketplaceVisible,
  });
  const tier: UserTier = getUserTier(user, kycStatus);

  const handleSignInRedirect = () => {
    const targetUrl = `/marketplace/${horseSlug}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(targetUrl)}`);
  };

  const handleVerifyRedirect = () => {
    router.push(`/auth/verify?redirect=${encodeURIComponent(`/marketplace/${horseSlug}`)}`);
  };

  // Live inventory wins field-by-field when present; no invented prices.
  const termsSource =
    inventory || staticTerms
      ? {
          price_per_share_nzd:
            inventory != null
              ? inventory.price_per_share_nzd ?? 0
              : staticTerms?.price_per_share_nzd ?? 0,
          totalLeasePercent:
            inventory?.totalLeasePercent ??
            staticTerms?.totalLeasePercent ??
            "",
          leasePeriodMonths:
            inventory?.leasePeriodMonths ??
            staticTerms?.leasePeriodMonths ??
            "",
          leaseStartDate:
            inventory?.leaseStartDate ?? staticTerms?.leaseStartDate ?? "",
          investorReturnPct:
            inventory?.investorReturnPct ??
            staticTerms?.investorReturnPct ??
            "",
          shares_total: sharesTotal,
          shares_sold: sharesSold,
          shares_available: sharesAvailable,
          ownerRatePer1PctMonth:
            inventory?.owner_rate_per_1pct_month ??
            staticTerms?.ownerRatePer1PctMonth ??
            null,
          platformFeePct:
            inventory?.platform_fee_pct ??
            staticTerms?.platformFeePct ??
            null,
        }
      : null;

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

  // ─── GUEST: Show registration gate popup ───
  if (tier === "guest") {
    return (
      <>
        <RegistrationGate horseName={horseName} onSignIn={handleSignInRedirect} />
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
          <CampaignStatusBadge status={status} />
        </div>
      </>
    );
  }

  // ─── AUTH (not KYC'd) ───
  if (tier === "auth") {
    const statusInfo = STATUS_INFO[status];

    // Coming Soon (no details) — even auth users see the Notify Me card
    if (status === "coming_soon") {
      return (
        <div className="space-y-4">
          <ComingSoonTermsModal horseName={horseName} horseSlug={horseSlug} />
        </div>
      );
    }

    // Coming Soon (with details) — show blurred terms + verify CTA
    if (status === "coming_soon_details") {
      return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 border rounded-full px-3 py-1.5 ${statusInfo.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              <span className="text-[9px] uppercase tracking-widest font-medium">
                {statusInfo.label}
              </span>
            </div>
          </div>
          {/* Blurred terms skeleton */}
          <div className="space-y-4 select-none pointer-events-none" aria-hidden="true">
            {TERMS_SKELETON_LABELS.map((label) => (
              <div key={label} className="flex justify-between border-b border-white/[0.04] pb-3">
                <span className="text-[12px] font-light text-white/40">{label}</span>
                <span className="h-4 bg-white/10 rounded w-20 blur-sm" />
              </div>
            ))}
          </div>
          {/* Verify overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="space-y-4 max-w-xs">
              <h4 className="text-[15px] font-medium tracking-wide text-white">
                Complete Verification
              </h4>
              <p className="text-[11px] leading-relaxed text-white/60 font-light">
                Verify your identity to view pricing, lease structures, and returns for {horseName}.
              </p>
              <button
                onClick={handleVerifyRedirect}
                className="w-full text-center py-3 rounded-full text-[11px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/40"
              >
                Start Verification
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Listed — same verify overlay, no terms visible
    if (status === "listed") {
      return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 border rounded-full px-3 py-1.5 ${statusInfo.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              <span className="text-[9px] uppercase tracking-widest font-medium">
                {statusInfo.label}
              </span>
            </div>
          </div>
          {/* Blurred terms skeleton */}
          <div className="space-y-4 select-none pointer-events-none" aria-hidden="true">
            {TERMS_SKELETON_LABELS.map((label) => (
              <div key={label} className="flex justify-between border-b border-white/[0.04] pb-3">
                <span className="text-[12px] font-light text-white/40">{label}</span>
                <span className="h-4 bg-white/10 rounded w-20 blur-sm" />
              </div>
            ))}
          </div>
          {/* Verify overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="space-y-4 max-w-xs">
              <h4 className="text-[15px] font-medium tracking-wide text-white">
                Complete Verification
              </h4>
              <p className="text-[11px] leading-relaxed text-white/60 font-light">
                Verify your identity to view investment terms and acquire shares in {horseName}.
              </p>
              <button
                onClick={handleVerifyRedirect}
                className="w-full text-center py-3 rounded-full text-[11px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/40"
              >
                Start Verification
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Fully Subscribed — closed campaign, register interest
    if (status === "fully_subscribed") {
      return (
        <ClosedCampaignPanel
          status={status}
          horseName={horseName}
          heading="Campaign Fully Subscribed"
          message={`All shares in ${horseName} have been acquired. This horse is in active campaign.`}
          ctaLabel={`I'm keen to hear about horses like ${horseName}`}
          horseSlug={horseSlug}
        />
      );
    }

    // Completed — lease concluded, register interest
    if (status === "completed") {
      return (
        <ClosedCampaignPanel
          status={status}
          horseName={horseName}
          message={`The lease period for ${horseName} has concluded. Register your interest for future campaigns.`}
          ctaLabel={`I'm keen to hear about horses like ${horseName}`}
          horseSlug={horseSlug}
        />
      );
    }
  }

  // ─── KYC'D — fully subscribed / completed (no terms sheet) ───
  if (status === "fully_subscribed") {
    return (
      <ClosedCampaignPanel
        status={status}
        horseName={horseName}
        heading="Campaign Fully Subscribed"
        message="All shares have been acquired. This horse is in active campaign."
        ctaLabel={`I'm keen to hear about horses like ${horseName}`}
        horseSlug={horseSlug}
      />
    );
  }

  if (status === "completed") {
    return (
      <ClosedCampaignPanel
        status={status}
        horseName={horseName}
        message={`The lease period for ${horseName} has concluded.`}
        ctaLabel={`I'm keen to hear about horses like ${horseName}`}
        horseSlug={horseSlug}
      />
    );
  }

  // ─── KYC'D USER — eligible horses with terms ───
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
      </div>

      {status === "listed" && termsSource && (
        <InvestmentTermsModal
          horseName={horseName}
          horseSlug={horseSlug}
          pricePerShareNzd={termsSource.price_per_share_nzd}
          totalLeasePercent={termsSource.totalLeasePercent}
          leasePeriodMonths={termsSource.leasePeriodMonths}
          leaseStartDate={termsSource.leaseStartDate}
          investorReturnPct={termsSource.investorReturnPct}
          sharesTotal={termsSource.shares_total}
          sharesAvailable={termsSource.shares_available}
          ownerRatePer1PctMonth={termsSource.ownerRatePer1PctMonth}
          platformFeePct={termsSource.platformFeePct}
        />
      )}

      {status === "coming_soon" && (
        <ComingSoonTermsModal horseName={horseName} horseSlug={horseSlug} />
      )}

      {status === "coming_soon_details" && termsSource && (
        <InvestmentTermsModal
          horseName={horseName}
          horseSlug={horseSlug}
          pricePerShareNzd={termsSource.price_per_share_nzd}
          totalLeasePercent={termsSource.totalLeasePercent}
          leasePeriodMonths={termsSource.leasePeriodMonths}
          leaseStartDate={termsSource.leaseStartDate}
          investorReturnPct={termsSource.investorReturnPct}
          sharesTotal={termsSource.shares_total}
          sharesAvailable={termsSource.shares_available}
          ownerRatePer1PctMonth={termsSource.ownerRatePer1PctMonth}
          platformFeePct={termsSource.platformFeePct}
          readOnly
        />
      )}

    </div>
  );
}

// ─── Closed Campaign Panel (fully_subscribed / completed) ───
function ClosedCampaignPanel({
  status,
  horseName,
  horseSlug,
  heading,
  message,
  ctaLabel,
}: {
  status: CampaignStatus;
  horseName: string;
  horseSlug: string;
  heading?: string;
  message: string;
  ctaLabel: string;
}) {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegisterInterest = async () => {
    if (!user) return;
    setLoading(true);
    try {
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
          action_type: "similar_horses",
          user_email: user.email,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Register interest failed:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
      <CampaignStatusBadge status={status} />
      <div className="space-y-3">
        {heading && (
          <h4 className="text-[15px] font-medium tracking-wide text-white">
            {heading}
          </h4>
        )}
        <p className="text-[12px] font-light text-white/50 leading-relaxed">
          {message}
        </p>
      </div>
      {submitted ? (
        <p className="text-[12px] font-light text-white/50 text-center py-2">
          You&apos;re registered. We&apos;ll notify you about similar opportunities.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleRegisterInterest}
          disabled={loading}
          className="w-full text-center py-3.5 px-4 rounded-full text-[12px] font-medium normal-case tracking-normal leading-snug bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Submitting..." : ctaLabel}
        </button>
      )}
    </div>
  );
}

// ─── Coming Soon Terms Modal — "View Investment Terms" button + glassmorphic modal ───
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

// ─── Coming Soon notification card ───
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