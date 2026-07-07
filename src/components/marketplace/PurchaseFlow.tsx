"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

interface PurchasePageProps {
  horseName: string;
  horseSlug: string;
  horseImage: string;
  hasPds: boolean;
  hasSa: boolean;
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

export default function PurchasePage(props: PurchasePageProps) {
  const { user, loading: authLoading, kycStatus } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [pdsAgreed, setPdsAgreed] = useState(false);
  const [pdsScrolled, setPdsScrolled] = useState(false);
  const [saAgreed, setSaAgreed] = useState(false);
  const [saScrolled, setSaScrolled] = useState(false);
  const [agreementSubStep, setAgreementSubStep] = useState<1 | 2>(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inventory, setInventory] = useState<LiveInventory | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  const signatureName = user?.displayName || user?.email?.split("@")[0] || "Verified Investor";

  // Redirect to login if not authenticated or verification page if unverified
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/auth/login?redirect=/marketplace/${props.horseSlug}/purchase`);
      } else if (kycStatus !== "verified") {
        router.push(`/marketplace/${props.horseSlug}`);
      }
    }
  }, [authLoading, user, kycStatus, router, props.horseSlug]);

  // Fetch live inventory only when authenticated
  useEffect(() => {
    if (!user) return;
    async function fetchLive() {
      try {
        setInventoryLoading(true);
        const res = await fetch(`/api/inventory/${encodeURIComponent(props.horseSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setInventory(data);
        }
      } catch (err) {
        console.error("Failed to fetch live inventory in purchase flow:", err);
      } finally {
        setInventoryLoading(false);
      }
    }
    fetchLive();
  }, [props.horseSlug, user]);

  if (authLoading || !user || kycStatus !== "verified") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]"></div>
      </div>
    );
  }

  const sharesTotal = inventory?.shares_total ?? 0;
  const sharesAvailable = inventory?.shares_available ?? 0;
  const pricePerShareNzd = inventory?.price_per_share_nzd ?? 0;
  const totalLeasePercent = inventory?.totalLeasePercent ?? 0;
  const leasePeriodMonths = inventory?.leasePeriodMonths ?? 0;
  const leaseStartDate = inventory?.leaseStartDate ?? "TBD";
  const investorReturnPct = inventory?.investorReturnPct ?? 0;

  const totalPriceNzd = sharesToBuy * pricePerShareNzd;
  const percentStake = ((sharesToBuy / sharesTotal) * Number(totalLeasePercent)).toFixed(2);

  const handleStripeCheckout = async () => {
    setIsRedirecting(true);
    setErrorMsg("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hlt_id: props.horseSlug,
          shares_to_buy: sharesToBuy,
          success_url: `${window.location.origin}/marketplace/${props.horseSlug}/confirm?success=true`,
          cancel_url: `${window.location.origin}/marketplace/${props.horseSlug}/purchase`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create checkout session" }));
        throw new Error(err.error || "Failed to create checkout session");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Failed to start checkout. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-white font-sans pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
            <Link href="/marketplace" className="hover:text-white/60 transition">Marketplace</Link>
            <span>/</span>
            <Link href={`/marketplace/${props.horseSlug}`} className="hover:text-white/60 transition">{props.horseName}</Link>
            <span>/</span>
            <span className="text-white/60">Acquire</span>
          </div>

          {/* Horse header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/[0.06] overflow-hidden relative flex-shrink-0">
              {props.horseImage && (
                <img src={props.horseImage} alt={props.horseName} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-[24px] font-light text-white tracking-tight">{props.horseName}</h1>
              <p className="text-[12px] text-white/40">
                {inventoryLoading ? "Loading..." : `${sharesAvailable} shares available`}
              </p>
            </div>
          </div>

          {/* Loading state for inventory */}
          {inventoryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]"></div>
            </div>
          ) : sharesAvailable === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 text-center space-y-4">
              <p className="text-lg font-light text-white/60">Fully Subscribed</p>
              <p className="text-sm font-light text-white/40 max-w-md mx-auto leading-relaxed">
                All shares have been acquired. This horse is in active campaign.
              </p>
              <Link
                href={`/marketplace/${props.horseSlug}`}
                className="inline-block rounded-full border border-white/10 text-white hover:bg-white/5 transition px-8 py-3 text-[11px] font-medium uppercase tracking-widest"
              >
                ← Back to {props.horseName}
              </Link>
            </div>
          ) : (
          <>
          {/* Step indicator */}
          <div className="flex items-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium ${
                  step >= s ? "bg-[#d4a964] text-black" : "bg-white/[0.04] text-white/30 border border-white/[0.06]"
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-[1px] ${step > s ? "bg-[#d4a964]" : "bg-white/[0.06]"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Amount selector */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-[18px] font-light text-white">How many shares?</h2>

              <div className="flex items-center justify-between border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Quantity</p>
                  <p className="text-[12px] font-light text-white/50">
                    {percentStake}% of the horse
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 1))}
                    className="w-11 h-11 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition text-lg"
                    disabled={sharesToBuy <= 1}
                  >
                    −
                  </button>
                  <span className="text-[20px] font-medium text-white min-w-[32px] text-center">{sharesToBuy}</span>
                  <button
                    type="button"
                    onClick={() => setSharesToBuy(Math.min(sharesAvailable, sharesToBuy + 1))}
                    className="w-11 h-11 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition text-lg"
                    disabled={sharesToBuy >= sharesAvailable}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline border-t border-white/[0.06] pt-4">
                <span className="text-[13px] font-light text-white/50">Total</span>
                <span className="text-[22px] font-medium text-[#d4a964]">
                  ${totalPriceNzd.toLocaleString()} NZD
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Summary */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-[18px] font-light text-white">Summary</h2>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4 text-[14px] font-light">
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Shares</span>
                  <span className="text-white font-medium">{sharesToBuy}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Purchase amount</span>
                  <span className="text-white font-medium">${totalPriceNzd.toLocaleString()} NZD</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Percentage stake</span>
                  <span className="text-white font-medium">{percentStake}%</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Return on stakes won</span>
                  <span className="text-[#34D399] font-medium">{investorReturnPct}%</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-white/40">Length of ownership</span>
                  <span className="text-white font-medium">{leasePeriodMonths} months</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: T&C agreement */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-light text-white">
                  Agreement ({agreementSubStep === 1 ? "1/2 — PDS" : "2/2 — Syndicate Agreement"})
                </h2>
                <span className="text-[11px] text-white/40 uppercase tracking-wider">
                  Step 3.{agreementSubStep}
                </span>
              </div>

              {/* Sub-step 3.1: PDS Review */}
              {agreementSubStep === 1 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-white">Product Disclosure Statement</p>
                        <p className="text-[11px] text-white/40 mt-0.5">Please scroll to the bottom to acknowledge</p>
                      </div>
                      <a
                        href={`/documents/${props.horseSlug}/pds.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] uppercase tracking-wider text-white/60 hover:text-white transition"
                      >
                        Open ↗
                      </a>
                    </div>

                    {props.hasPds ? (
                      <div
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                            setPdsScrolled(true);
                          }
                        }}
                        className="h-64 overflow-y-auto bg-black/40 rounded-lg p-4 text-[11px] font-light text-white/50 leading-relaxed border border-white/[0.04] scroll-smooth"
                      >
                        <embed src={`/documents/${props.horseSlug}/pds.pdf`} type="application/pdf" className="w-full h-full" />
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-[12px] font-light text-white/30 bg-black/40 rounded-lg border border-white/[0.04]">
                        Document being prepared — purchasing will be available once disclosures are published.
                      </div>
                    )}

                    {/* Pre-populated Signature block */}
                    <div className="space-y-2.5 pt-2 border-t border-white/[0.04]">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                        Acknowledged by (KYC Auto-filled)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={signatureName}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 cursor-not-allowed select-none"
                      />
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        Your verified legal name has been recorded for this agreement.
                      </p>
                    </div>

                    {props.hasPds && (
                      <label className={`flex items-center gap-3 text-[12px] font-light pt-2 ${pdsScrolled ? "text-white/70" : "text-white/30 cursor-not-allowed"}`}>
                        <input
                          type="checkbox"
                          checked={pdsAgreed}
                          disabled={!pdsScrolled}
                          onChange={(e) => setPdsAgreed(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#d4a964]"
                        />
                        I have read and agree to the terms of the Product Disclosure Statement
                      </label>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setStep(2); setAgreementSubStep(1); }}
                      className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-white/10 text-white hover:bg-white/5 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!pdsAgreed || !props.hasPds}
                      onClick={() => setAgreementSubStep(2)}
                      className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Next: Syndicate Agreement
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-step 3.2: SA Review */}
              {agreementSubStep === 2 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-white">Syndicate Agreement</p>
                        <p className="text-[11px] text-white/40 mt-0.5">Please scroll to the bottom to acknowledge</p>
                      </div>
                      <a
                        href={`/documents/${props.horseSlug}/syndicate-agreement.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] uppercase tracking-wider text-white/60 hover:text-white transition"
                      >
                        Open ↗
                      </a>
                    </div>

                    {props.hasSa ? (
                      <div
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                            setSaScrolled(true);
                          }
                        }}
                        className="h-64 overflow-y-auto bg-black/40 rounded-lg p-4 text-[11px] font-light text-white/50 leading-relaxed border border-white/[0.04] scroll-smooth"
                      >
                        <embed src={`/documents/${props.horseSlug}/syndicate-agreement.pdf`} type="application/pdf" className="w-full h-full" />
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-[12px] font-light text-white/30 bg-black/40 rounded-lg border border-white/[0.04]">
                        Document being prepared — purchasing will be available once disclosures are published.
                      </div>
                    )}

                    {/* Pre-populated Signature block */}
                    <div className="space-y-2.5 pt-2 border-t border-white/[0.04]">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                        Acknowledged by (KYC Auto-filled)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={signatureName}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 cursor-not-allowed select-none"
                      />
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        Your verified legal name has been recorded for this agreement.
                      </p>
                    </div>

                    {props.hasSa && (
                      <label className={`flex items-center gap-3 text-[12px] font-light pt-2 ${saScrolled ? "text-white/70" : "text-white/30 cursor-not-allowed"}`}>
                        <input
                          type="checkbox"
                          checked={saAgreed}
                          disabled={!saScrolled}
                          onChange={(e) => setSaAgreed(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#d4a964]"
                        />
                        I have read and agree to the terms of the Syndicate Agreement
                      </label>
                    )}
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setAgreementSubStep(1)}
                      className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-white/10 text-white hover:bg-white/5 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStripeCheckout}
                      disabled={!pdsAgreed || !saAgreed || !props.hasPds || !props.hasSa || isRedirecting}
                      className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#d4a964]/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      {isRedirecting ? "Redirecting..." : "Continue to Payment"}
                    </button>
                  </div>

                  {/* Compliance Notice */}
                  <p className="text-[10.5px] font-light leading-relaxed text-white/45 text-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                    ℹ️ Compliance Notice: Copies of your signed documents will be emailed to you automatically after successful payment.
                  </p>
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}