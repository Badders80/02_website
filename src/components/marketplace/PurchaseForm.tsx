"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePurchaseFlow } from "@/lib/usePurchaseFlow";

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
  const { purchase, isRedirecting, errorMsg } = usePurchaseFlow();

  const sharesAvailable = hlt.shares_total - hlt.shares_sold;
  const initialShares = sharesAvailable > 0 ? 1 : 0;
  const [sharesToBuy, setSharesToBuy] = useState(initialShares);

  const pricePerShareNzd = hlt.share_price_cents / 100;
  const totalPriceNzd = pricePerShareNzd * sharesToBuy;
  const percentPerShare = hlt.fractional_interest_per_share || (100.0 / hlt.shares_total);
  const totalPercentOwned = percentPerShare * sharesToBuy;

  const handleAction = () => {
    purchase({
      hltId: hlt.id,
      sharesToBuy,
      allDocumentsChecked: true,
      sharesAvailable,
    });
  };

  const getDocUrl = (docType: "pds" | "sa" | "term_sheet") => {
    return hlt.documents?.[docType]?.gcs_url || "#";
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    if (isRedirecting) return "Redirecting...";
    if (sharesAvailable <= 0) return "Fully subscribed";
    return "Acquire stake";
  };

  const isButtonDisabled = () => {
    if (loading || isRedirecting) return true;
    if (sharesAvailable <= 0) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Main Widget Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
        
        {/* Price & Availability */}
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-medium text-[#d4a964]">
            ${pricePerShareNzd.toLocaleString()} NZD
          </span>
          <span className="text-[13px] font-light text-white/50">
            {sharesAvailable} / {hlt.shares_total} units available
          </span>
        </div>

        {sharesAvailable > 0 ? (
          <div className="space-y-6">
            {/* Stepper Quantity Selector */}
            <div className="flex items-center justify-between border border-white/[0.06] bg-black/40 rounded-xl p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/30 mb-0.5">Quantity</p>
                <p className="text-[12px] font-light text-white/50">
                  {totalPercentOwned.toFixed(2)}% total stake
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 1))}
                  className="w-11 h-11 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition-all text-lg select-none"
                  disabled={sharesToBuy <= 1}
                >
                  −
                </button>
                <span className="text-md font-medium text-white min-w-[28px] text-center select-none">
                  {sharesToBuy}
                </span>
                <button
                  type="button"
                  onClick={() => setSharesToBuy(Math.min(sharesAvailable, sharesToBuy + 1))}
                  className="w-11 h-11 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition-all text-lg select-none"
                  disabled={sharesToBuy >= sharesAvailable}
                >
                  +
                </button>
              </div>
            </div>

            {/* Live-Calculated Total */}
            <div className="flex justify-between items-baseline border-t border-white/[0.06] pt-4">
              <span className="text-[13px] font-light text-white/50">Total stake price</span>
              <span className="text-[18px] font-medium text-[#d4a964]">
                ${totalPriceNzd.toLocaleString()} NZD
              </span>
            </div>
          </div>
        ) : null}

        {/* Error Message */}
        {errorMsg && (
          <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
            {errorMsg}
          </p>
        )}

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleAction}
          disabled={isButtonDisabled()}
          className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:border disabled:border-white/10 disabled:text-white/30 disabled:bg-transparent disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
        >
          {getButtonText()}
        </button>

        {/* Exemption Microcopy */}
        <p className="text-[10px] font-light leading-relaxed text-white/20 text-center">
          All acquisitions are subject to NZTR syndication rules and FMA equine exemptions.
        </p>
      </div>

      {/* Compliance / Legal Links (Bottom) */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] tracking-wider text-white/30">
        <a
          href={getDocUrl("sa")}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/60 transition"
        >
          Syndication Agreement
        </a>
        <span>·</span>
        <a
          href={getDocUrl("term_sheet")}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/60 transition"
        >
          Terms of Acquisition
        </a>
        <span>·</span>
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/60 transition"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
