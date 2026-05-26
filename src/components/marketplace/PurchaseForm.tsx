"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface HltData {
  id: string;
  shares_total: number;
  shares_sold: number;
  share_price_cents: number;
  fractional_interest_per_share?: number;
  documents?: {
    term_sheet?: { status: string; gcs_url: string | null };
    pds?: { status: string; gcs_url: string | null };
    sa?: { status: string; gcs_url: string | null };
  };
}

interface PurchaseFormProps {
  hlt: HltData;
  horseName: string;
}

export function PurchaseForm({ hlt, horseName }: PurchaseFormProps) {
  const { user, kycStatus, loading } = useAuth();
  const router = useRouter();

  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [checkedPds, setCheckedPds] = useState(false);
  const [checkedSa, setCheckedSa] = useState(false);
  const [checkedTermSheet, setCheckedTermSheet] = useState(false);
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sharesAvailable = hlt.shares_total - hlt.shares_sold;
  const pricePerShareNzd = hlt.share_price_cents / 100;
  const totalPriceNzd = pricePerShareNzd * sharesToBuy;
  const percentPerShare = hlt.fractional_interest_per_share || (100.0 / hlt.shares_total);
  const totalPercentOwned = percentPerShare * sharesToBuy;

  const allDocumentsChecked = checkedPds && checkedSa && checkedTermSheet;

  const getDocUrl = (docType: "pds" | "sa" | "term_sheet") => {
    return hlt.documents?.[docType]?.gcs_url || "#";
  };

  const handleAction = async () => {
    if (loading) return;

    if (!user) {
      // Gate 1: Login required
      router.push(`/auth/login?redirect=/marketplace/${hlt.id}`);
      return;
    }

    if (kycStatus !== "verified") {
      // Gate 2: KYC required
      router.push("/auth/verify");
      return;
    }

    if (!allDocumentsChecked) {
      setErrorMsg("Please read and accept all three legal documents before purchasing.");
      return;
    }

    if (sharesToBuy <= 0 || sharesToBuy > sharesAvailable) {
      setErrorMsg(`Please select a quantity between 1 and ${sharesAvailable}.`);
      return;
    }

    setIsRedirecting(true);
    setErrorMsg("");

    try {
      // Call local Next.js proxy route to create Stripe checkout session
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          hlt_id: hlt.id,
          shares_to_buy: sharesToBuy,
          bypass_kyc: true, // Allow test mode bypass for dev purposes
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Checkout error: ${res.status}` }));
        throw new Error(errorData.error || `Checkout failed: ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout URL not returned");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to start checkout. Please try again.");
      setIsRedirecting(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    if (isRedirecting) return "Redirecting to Stripe...";
    if (!user) return "Sign In to Buy Stake";
    if (kycStatus !== "verified") return "Complete KYC to Purchase";
    if (sharesAvailable <= 0) return "Sold Out";
    return `Buy ${sharesToBuy} Stake Unit${sharesToBuy > 1 ? "s" : ""} · $${totalPriceNzd.toLocaleString()} NZD`;
  };

  const isButtonDisabled = () => {
    if (loading || isRedirecting) return true;
    if (sharesAvailable <= 0) return true;
    // Ticking documents is required to buy, but we let them click so we can show validation message
    return false; 
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 space-y-6">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#d4a964] mb-2">
          Reserve Stake
        </p>
        <h3 className="text-[20px] font-light text-white mb-2">
          Buy Ownership Stake
        </h3>
        <p className="text-[13px] font-light text-white/50 leading-relaxed">
          Acquire a direct fractional interest in {horseName}. Every unit represents {percentPerShare}% leasehold interest.
        </p>
      </div>

      {sharesAvailable > 0 && (
        <div className="space-y-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between border border-white/[0.06] bg-black/40 rounded-xl p-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Select Units</p>
              <p className="text-[12px] font-light text-white/30">
                Max {sharesAvailable} unit{sharesAvailable > 1 ? "s" : ""} left
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 1))}
                className="w-8 h-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                disabled={sharesToBuy <= 1}
              >
                -
              </button>
              <span className="text-lg font-medium text-white min-w-[20px] text-center">
                {sharesToBuy}
              </span>
              <button
                type="button"
                onClick={() => setSharesToBuy(Math.min(sharesAvailable, sharesToBuy + 1))}
                className="w-8 h-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                disabled={sharesToBuy >= sharesAvailable}
              >
                +
              </button>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="bg-white/[0.01] rounded-xl border border-white/[0.06] p-4 text-sm font-light space-y-2">
            <div className="flex justify-between">
              <span className="text-white/40">Total Stake %:</span>
              <span className="text-white font-medium">{totalPercentOwned.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Price Per Unit:</span>
              <span className="text-white">${pricePerShareNzd.toLocaleString()} NZD</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2 font-medium">
              <span className="text-white/50">Total NZD:</span>
              <span className="text-[#d4a964]">${totalPriceNzd.toLocaleString()} NZD</span>
            </div>
          </div>
        </div>
      )}

      {/* Document Checks */}
      {user && kycStatus === "verified" && sharesAvailable > 0 && (
        <div className="space-y-3 bg-[#d4a964]/5 border border-[#d4a964]/10 rounded-xl p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#d4a964] mb-1">
            Required Documents
          </p>
          
          <label className="flex items-start gap-3 text-xs text-white/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checkedTermSheet}
              onChange={(e) => setCheckedTermSheet(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-black/40 accent-[#d4a964] focus:ring-0"
            />
            <span>
              I accept the{" "}
              <a
                href={getDocUrl("term_sheet")}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#d4a964] hover:underline"
              >
                HLT Term Sheet
              </a>
            </span>
          </label>

          <label className="flex items-start gap-3 text-xs text-white/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checkedPds}
              onChange={(e) => setCheckedPds(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-black/40 accent-[#d4a964] focus:ring-0"
            />
            <span>
              I accept the{" "}
              <a
                href={getDocUrl("pds")}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#d4a964] hover:underline"
              >
                Product Disclosure Statement
              </a>
            </span>
          </label>

          <label className="flex items-start gap-3 text-xs text-white/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checkedSa}
              onChange={(e) => setCheckedSa(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-black/40 accent-[#d4a964] focus:ring-0"
            />
            <span>
              I accept the{" "}
              <a
                href={getDocUrl("sa")}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#d4a964] hover:underline"
              >
                Syndicate Agreement
              </a>
            </span>
          </label>
        </div>
      )}

      {/* Message Output */}
      {errorMsg && (
        <p className="text-xs font-light text-red-400 bg-red-400/5 border border-red-400/10 rounded-lg p-3">
          {errorMsg}
        </p>
      )}

      {/* Gated CTA */}
      <button
        type="button"
        onClick={handleAction}
        disabled={isButtonDisabled()}
        className="w-full text-center py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
      >
        {getButtonText()}
      </button>
    </div>
  );
}
