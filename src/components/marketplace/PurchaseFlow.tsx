"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

interface PurchasePageProps {
  horseName: string;
  horseSlug: string;
  horseImage: string;
  horseStory: string;
  pricePerShareNzd: number;
  totalLeasePercent: number | string;
  leasePeriodMonths: number | string;
  leaseStartDate: string;
  investorReturnPct: number | string;
  sharesTotal: number;
  sharesAvailable: number;
  hasPds: boolean;
  hasSa: boolean;
}

export default function PurchasePage(props: PurchasePageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [pdsAgreed, setPdsAgreed] = useState(false);
  const [pdsScrolled, setPdsScrolled] = useState(false);
  const [saAgreed, setSaAgreed] = useState(false);
  const [saScrolled, setSaScrolled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const totalPriceNzd = sharesToBuy * props.pricePerShareNzd;
  const percentStake = ((sharesToBuy / props.sharesTotal) * Number(props.totalLeasePercent)).toFixed(2);

  // Redirect to login if not authenticated
  if (!authLoading && !user && typeof window !== "undefined") {
    router.push(`/auth/login?redirect=/marketplace/${props.horseSlug}/purchase`);
  }

  const handlePdsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
      setPdsScrolled(true);
    }
  };

  const handleSaScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
      setSaScrolled(true);
    }
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/marketplace/${props.horseSlug}/purchase`);
      return;
    }

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
          horse_name: props.horseName,
          shares: sharesToBuy,
          price_per_share_cents: Math.round(props.pricePerShareNzd * 100),
          success_url: `${window.location.origin}/marketplace/${props.horseSlug}/confirm?success=true`,
          cancel_url: `${window.location.origin}/marketplace/${props.horseSlug}/purchase`,
          client_reference_id: `${user.uid}:${props.horseSlug}:${sharesToBuy}`,
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
              <p className="text-[12px] text-white/40">{props.sharesAvailable} shares available</p>
            </div>
          </div>

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
                    {percentStake}% total stake
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
                    onClick={() => setSharesToBuy(Math.min(props.sharesAvailable, sharesToBuy + 1))}
                    className="w-11 h-11 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition text-lg"
                    disabled={sharesToBuy >= props.sharesAvailable}
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
                  <span className="text-[#34D399] font-medium">{props.investorReturnPct}%</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-white/40">Length of ownership</span>
                  <span className="text-white font-medium">{props.leasePeriodMonths} months</span>
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
              <h2 className="text-[18px] font-light text-white">Agreement</h2>

              {/* PDS */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-white">Product Disclosure Statement</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Scroll to the bottom to acknowledge</p>
                  </div>
                  <a
                    href={`/documents/${props.horseSlug}/pds.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-wider text-[#d4a964] hover:text-white transition"
                  >
                    Open ↗
                  </a>
                </div>

                {props.hasPds ? (
                  <div
                    onScroll={handlePdsScroll}
                    className="h-48 overflow-y-auto bg-black/40 rounded-lg p-4 text-[11px] font-light text-white/50 leading-relaxed border border-white/[0.04]"
                  >
                    <embed src={`/documents/${props.horseSlug}/pds.pdf`} type="application/pdf" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-[12px] font-light text-white/30 bg-black/40 rounded-lg border border-white/[0.04]">
                    Document being prepared
                  </div>
                )}

                <label className={`flex items-center gap-3 text-[12px] font-light ${pdsScrolled || !props.hasPds ? "text-white/70" : "text-white/30 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    checked={pdsAgreed}
                    disabled={!pdsScrolled && props.hasPds}
                    onChange={(e) => setPdsAgreed(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#d4a964]"
                  />
                  I have read the Product Disclosure Statement
                </label>
              </div>

              {/* SA */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-white">Syndicate Agreement</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Scroll to the bottom to acknowledge</p>
                  </div>
                  <a
                    href={`/documents/${props.horseSlug}/syndicate-agreement.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-wider text-[#d4a964] hover:text-white transition"
                  >
                    Open ↗
                  </a>
                </div>

                {props.hasSa ? (
                  <div
                    onScroll={handleSaScroll}
                    className="h-48 overflow-y-auto bg-black/40 rounded-lg p-4 text-[11px] font-light text-white/50 leading-relaxed border border-white/[0.04]"
                  >
                    <embed src={`/documents/${props.horseSlug}/syndicate-agreement.pdf`} type="application/pdf" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-[12px] font-light text-white/30 bg-black/40 rounded-lg border border-white/[0.04]">
                    Document being prepared
                  </div>
                )}

                <label className={`flex items-center gap-3 text-[12px] font-light ${saScrolled || !props.hasSa ? "text-white/70" : "text-white/30 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    checked={saAgreed}
                    disabled={!saScrolled && props.hasSa}
                    onChange={(e) => setSaAgreed(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#d4a964]"
                  />
                  I have read the Syndicate Agreement
                </label>
              </div>

              {errorMsg && (
                <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={!pdsAgreed || !saAgreed || isRedirecting}
                  className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#d4a964]/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  {isRedirecting ? "Redirecting..." : "Continue to Payment"}
                </button>
              </div>

              <p className="text-[10px] font-light leading-relaxed text-white/20 text-center">
                You will be redirected to Stripe to complete your payment securely.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}