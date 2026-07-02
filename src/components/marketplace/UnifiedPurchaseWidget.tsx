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

interface UnifiedPurchaseWidgetProps {
  hlt: HltData;
  horseName: string;
}

export function UnifiedPurchaseWidget({ hlt, horseName }: UnifiedPurchaseWidgetProps) {
  const { user, kycStatus, loading } = useAuth();
  const { purchase, isRedirecting, errorMsg } = usePurchaseFlow();

  // Dialog states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  
  // Purchase form states
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [checkedPds, setCheckedPds] = useState(false);
  const [checkedSa, setCheckedSa] = useState(false);
  const [checkedTermSheet, setCheckedTermSheet] = useState(false);
  
  // Enquiry form states
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryName, setEnquiryName] = useState("");

  // Allow toggling sold-out status in sandbox for testing
  const [forceSoldOut, setForceSoldOut] = useState(false);

  const sharesAvailable = forceSoldOut ? 0 : (hlt.shares_total - hlt.shares_sold);
  const pricePerShareNzd = hlt.share_price_cents / 100;
  const totalPriceNzd = pricePerShareNzd * sharesToBuy;
  const percentPerShare = hlt.fractional_interest_per_share || (100.0 / hlt.shares_total);
  const totalPercentOwned = percentPerShare * sharesToBuy;

  const allDocumentsChecked = checkedPds && checkedSa && checkedTermSheet;

  const getDocUrl = (docType: "pds" | "sa" | "term_sheet") => {
    const gcsUrl = hlt.documents?.[docType]?.gcs_url;
    if (!gcsUrl) return "#";
    if (gcsUrl.startsWith("gs://")) {
      return `https://storage.googleapis.com/${gcsUrl.substring(5)}`;
    }
    return gcsUrl;
  };

  const handleAcquireSubmit = () => {
    purchase({
      hltId: hlt.id,
      sharesToBuy,
      allDocumentsChecked,
      sharesAvailable,
    });
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Toggle Tool */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 flex items-center justify-between gap-4 text-[10px] text-white/40 font-mono">
        <span>PREVIEW STATE:</span>
        <button 
          onClick={() => {
            setForceSoldOut(!forceSoldOut);
            setShowPurchaseModal(false);
            setShowEnquiryModal(false);
          }}
          className="px-2.5 py-1 rounded bg-[#d4a964]/10 text-[#d4a964] border border-[#d4a964]/20 hover:bg-[#d4a964]/25 transition duration-300"
        >
          {forceSoldOut ? "TOGGLE TO ACTIVE" : "TOGGLE TO SOLD OUT"}
        </button>
      </div>

      {/* Main Single CTA Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-6 relative overflow-hidden masked-border">
        {sharesAvailable > 0 ? (
          /* ACTIVE PURCHASE STATE */
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-[20px] font-light text-white tracking-tight">
                Own a stake in {horseName}?
              </h3>
              <p className="text-[13px] font-light text-white/50 leading-relaxed">
                Leasehold units are currently available for purchase starting from 1.0% stake interest.
              </p>
            </div>
            
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full text-center py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98]"
            >
              Acquire Units
            </button>
          </div>
        ) : (
          /* SOLD OUT STATE */
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-[20px] font-light text-white/40 tracking-tight">
                Fully Subscribed
              </h3>
              <p className="text-[13px] font-light text-white/50 leading-relaxed">
                Sorry, unfortunately all leasehold units for {horseName} are currently fully subscribed.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setEnquirySubmitted(false);
                  setShowEnquiryModal(true);
                }}
                className="w-full text-center py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest border border-white/20 text-white hover:bg-white/5 transition-all duration-300 active:scale-[0.98]"
              >
                Enquire for New Stock
              </button>
              
              <a
                href="/sandbox/marketplace"
                className="block w-full text-center py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white/5 text-white/60 hover:text-white/80 transition-all duration-300 active:scale-[0.98]"
              >
                Consider Other Options
              </a>
            </div>
          </div>
        )}
      </div>

      {/* POPUP: ACQUIRE UNITS MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0A0A0F] p-8 max-w-md w-full relative space-y-6 shadow-2xl animate-fade-in">
            {/* Close button */}
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white text-lg transition duration-300"
            >
              ✕
            </button>

            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#d4a964] mb-1">Reserve Units</p>
              <h3 className="text-xl font-light text-white">{horseName} Syndication</h3>
            </div>

            {/* Slider Quantity Selector */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-light text-white/50">
                <span>Select Stakes Quantity</span>
                <span>Max {sharesAvailable} units</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max={sharesAvailable}
                  value={sharesToBuy}
                  onChange={(e) => setSharesToBuy(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d4a964]"
                />
                <span className="text-xl font-medium text-white min-w-[30px] text-right font-mono">
                  {sharesToBuy}%
                </span>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-white/[0.01] rounded-xl border border-white/[0.06] p-4 text-xs font-light space-y-2">
              <div className="flex justify-between">
                <span className="text-white/40">Acquisition Cost:</span>
                <span className="text-white font-medium">${totalPriceNzd.toLocaleString()} NZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Est. Monthly Upkeep (1%):</span>
                <span className="text-white">${(50 * sharesToBuy).toLocaleString()} NZD</span>
              </div>
            </div>

            {/* Document Checkboxes (Only if logged in & KYC) */}
            {user && kycStatus === "verified" ? (
              <div className="space-y-3 bg-[#d4a964]/5 border border-[#d4a964]/10 rounded-xl p-4">
                <p className="text-[9px] font-medium uppercase tracking-wider text-[#d4a964] mb-1">Required Documents</p>
                <label className="flex items-start gap-3 text-[11px] text-white/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkedTermSheet}
                    onChange={(e) => setCheckedTermSheet(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-black/40 accent-[#d4a964] focus:ring-0"
                  />
                  <span>I accept the <a href={getDocUrl("term_sheet")} target="_blank" className="text-[#d4a964] underline">Term Sheet</a></span>
                </label>
                <label className="flex items-start gap-3 text-[11px] text-white/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkedPds}
                    onChange={(e) => setCheckedPds(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-black/40 accent-[#d4a964] focus:ring-0"
                  />
                  <span>I accept the <a href={getDocUrl("pds")} target="_blank" className="text-[#d4a964] underline">PDS Doc</a></span>
                </label>
                <label className="flex items-start gap-3 text-[11px] text-white/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkedSa}
                    onChange={(e) => setCheckedSa(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-black/40 accent-[#d4a964] focus:ring-0"
                  />
                  <span>I accept the <a href={getDocUrl("sa")} target="_blank" className="text-[#d4a964] underline">Syndicate Agreement</a></span>
                </label>
              </div>
            ) : null}

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-400/5 p-3 rounded-lg border border-red-400/10">{errorMsg}</p>
            )}

            <button
              onClick={handleAcquireSubmit}
              disabled={isButtonDisabled()}
              className="w-full text-center py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Loading..." : 
               isRedirecting ? "Redirecting..." : 
               !user ? "Sign In to Purchase" : 
               kycStatus !== "verified" ? "Verify KYC to Purchase" : 
               `Acquire Units · $${totalPriceNzd.toLocaleString()} NZD`}
            </button>
          </div>
        </div>
      )}

      {/* POPUP: ENQUIRE NEW STOCK MODAL */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0A0A0F] p-8 max-w-md w-full relative space-y-6 shadow-2xl animate-fade-in">
            {/* Close button */}
            <button 
              onClick={() => setShowEnquiryModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white text-lg transition duration-300"
            >
              ✕
            </button>

            {!enquirySubmitted ? (
              <form onSubmit={handleEnquirySubmit} className="space-y-5">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#d4a964] mb-1">Waitlist & Inquiry</p>
                  <h3 className="text-xl font-light text-white">Enquire New Stock</h3>
                  <p className="text-xs text-white/50 mt-2 leading-relaxed font-light">
                    Register your details to receive early priority notifications when new bloodstock options or additional lease percentages are released.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/45 tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/45 tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-center py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all duration-300"
                >
                  Submit Priority Request
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <div>
                  <h4 className="text-md font-medium text-white">Priority Logged</h4>
                  <p className="text-xs text-white/50 mt-2 leading-relaxed font-light">
                    Thank you, {enquiryName}. We have registered your waitlist status. You will receive priority notifications at <span className="text-white">{enquiryEmail}</span>.
                  </p>
                </div>
                <button
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-6 py-2.5 rounded-full text-[10px] font-medium uppercase tracking-widest bg-white/5 text-white/80 hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function isButtonDisabled() {
    if (loading || isRedirecting) return true;
    if (sharesAvailable <= 0) return true;
    return false;
  }
}
