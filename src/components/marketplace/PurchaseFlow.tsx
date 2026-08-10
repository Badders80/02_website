"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { STATUS_INFO, type CampaignStatus } from "@/lib/campaign-status";

interface PurchasePageProps {
  horseName: string;
  horseSlug: string;
  horseImage: string;
  hasPds: boolean;
  hasSa: boolean;
  /** Server-computed: false unless PURCHASES_ENABLED and campaign open */
  purchasable?: boolean;
  campaignStatus?: CampaignStatus;
  closedReason?: string;
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
  purchasable?: boolean;
  campaign_status?: CampaignStatus | null;
  eligibility_reason?: string;
}

function closedCopy(status?: CampaignStatus): { title: string; body: string } {
  if (status === "fully_subscribed") {
    return {
      title: "Fully Subscribed",
      body: "All units in this syndicate have been allocated.",
    };
  }
  if (status === "completed") {
    return {
      title: "Completed",
      body: "This campaign has completed. New allocations are not available.",
    };
  }
  if (status === "coming_soon" || status === "coming_soon_details") {
    return {
      title: "Coming Soon",
      body: "Be first to know — this syndicate is not open for purchase yet. Check back or register interest from the horse page.",
    };
  }
  return {
    title: "Purchases Closed",
    body: "Units are not available for purchase on this horse right now.",
  };
}

export default function PurchasePage(props: PurchasePageProps) {
  const { user, loading: authLoading, kycStatus } = useAuth();
  const router = useRouter();
  const serverPurchasable = props.purchasable === true;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [pdsAgreed, setPdsAgreed] = useState(false);
  const [pdsScrolled, setPdsScrolled] = useState(false);
  const [pdsScrollable, setPdsScrollable] = useState(false);
  const [pdsSignedAt, setPdsSignedAt] = useState<string | null>(null);
  const [saAgreed, setSaAgreed] = useState(false);
  const [saScrolled, setSaScrolled] = useState(false);
  const [saScrollable, setSaScrollable] = useState(false);
  const [saSignedAt, setSaSignedAt] = useState<string | null>(null);
  const [agreementSubStep, setAgreementSubStep] = useState<1 | 2>(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inventory, setInventory] = useState<LiveInventory | null>(null);
  // If server already closed the path, skip waiting on inventory for the closed panel
  const [inventoryLoading, setInventoryLoading] = useState(serverPurchasable);

  const pdsScrollRef = useRef<HTMLDivElement>(null);
  const saScrollRef = useRef<HTMLDivElement>(null);

  // Track when PDS/SA containers become scrollable (PDF load / layout shifts).
  // Stage 1: missing docs or short/stub PDFs that don't overflow → treat as "scrolled"
  // so acknowledgment is never permanently locked.
  useEffect(() => {
    function isScrollable(el: HTMLElement) {
      return el.scrollHeight > el.clientHeight + 1;
    }

    function updateScrollable() {
      // Missing doc → no scroll gate
      if (!props.hasPds) {
        setPdsScrollable(false);
        setPdsScrolled(true);
      } else if (pdsScrollRef.current) {
        const canScroll = isScrollable(pdsScrollRef.current);
        setPdsScrollable(canScroll);
        if (!canScroll) setPdsScrolled(true);
      }

      if (!props.hasSa) {
        setSaScrollable(false);
        setSaScrolled(true);
      } else if (saScrollRef.current) {
        const canScroll = isScrollable(saScrollRef.current);
        setSaScrollable(canScroll);
        if (!canScroll) setSaScrolled(true);
      }
    }

    updateScrollable();
    // PDF embeds often finish layout after first paint
    const t1 = window.setTimeout(updateScrollable, 200);
    const t2 = window.setTimeout(updateScrollable, 800);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateScrollable);
      if (pdsScrollRef.current) observer.observe(pdsScrollRef.current);
      if (saScrollRef.current) observer.observe(saScrollRef.current);
    }

    window.addEventListener("resize", updateScrollable);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateScrollable);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [props.hasPds, props.hasSa, agreementSubStep]);

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

  // Fetch live inventory only when authenticated AND server says purchasable
  useEffect(() => {
    if (!user || !serverPurchasable) {
      setInventoryLoading(false);
      return;
    }
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
  }, [props.horseSlug, user, serverPurchasable]);

  // Closed catalog: show First to know / status without forcing login spinner forever
  const campaignStatus =
    inventory?.campaign_status || props.campaignStatus || "coming_soon";
  const purchasable =
    serverPurchasable && inventory?.purchasable !== false;
  const closed = closedCopy(campaignStatus);

  if (!serverPurchasable) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-black text-white font-sans pt-32 pb-24">
          <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-12">
            <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
              <Link href="/marketplace" className="hover:text-white/60 transition">
                Marketplace
              </Link>
              <span>/</span>
              <Link
                href={`/marketplace/${props.horseSlug}`}
                className="hover:text-white/60 transition"
              >
                {props.horseName}
              </Link>
              <span>/</span>
              <span className="text-white/60">Buy</span>
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/[0.06] overflow-hidden relative flex-shrink-0">
                {props.horseImage && (
                  <img
                    src={props.horseImage}
                    alt={props.horseName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h1 className="text-[24px] font-light text-white tracking-tight">
                  {props.horseName}
                </h1>
                <p className="text-[12px] text-white/40">
                  {STATUS_INFO[campaignStatus]?.label || "Coming Soon"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 text-center space-y-4">
              <p className="text-lg font-light text-white/60">{closed.title}</p>
              <p className="text-sm font-light text-white/40 max-w-md mx-auto leading-relaxed">
                {props.closedReason || closed.body}
              </p>
              <Link
                href={`/marketplace/${props.horseSlug}`}
                className="inline-block rounded-full border border-white/10 text-white hover:bg-white/5 transition px-8 py-3 text-[11px] font-medium uppercase tracking-widest"
              >
                ← Back to {props.horseName}
              </Link>
            </div>
          </div>
        </main>
        <Footer minimal />
      </>
    );
  }

  if (authLoading || !user || kycStatus !== "verified") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]"></div>
      </div>
    );
  }

  const sharesTotal = inventory?.shares_total ?? 0;
  const sharesAvailable =
    purchasable ? inventory?.shares_available ?? 0 : 0;
  const pricePerShareNzd = inventory?.price_per_share_nzd ?? 0;
  const totalLeasePercent = inventory?.totalLeasePercent ?? 0;
  const leasePeriodMonths = inventory?.leasePeriodMonths ?? 0;
  const leaseStartDate = inventory?.leaseStartDate ?? "TBD";
  const investorReturnPct = inventory?.investorReturnPct ?? 0;

  const totalPriceNzd = sharesToBuy * pricePerShareNzd;
  // Pro-rata % of the whole horse (units slice the Evolution syndicate stake)
  const percentStake =
    sharesTotal > 0 && Number(totalLeasePercent) > 0
      ? ((sharesToBuy / sharesTotal) * Number(totalLeasePercent)).toFixed(2)
      : "0.00";

  const handleStripeCheckout = async () => {
    if (!purchasable) {
      setErrorMsg(props.closedReason || closed.body);
      return;
    }
    if (sharesToBuy < 1 || sharesToBuy > sharesAvailable) {
      setErrorMsg(`Select between 1 and ${sharesAvailable} unit${sharesAvailable === 1 ? "" : "s"}.`);
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
          shares_to_buy: sharesToBuy,
          // Same-origin; server appends Stripe session_id placeholder
          success_url: `${window.location.origin}/marketplace/${props.horseSlug}/confirm?success=true`,
          cancel_url: `${window.location.origin}/marketplace/${props.horseSlug}/purchase`,
          // In-app e-sign acknowledgements (PDS then SA)
          e_sign: {
            signature_name: signatureName,
            pds_agreed: pdsAgreed,
            sa_agreed: saAgreed,
            pds_signed_at: pdsSignedAt,
            sa_signed_at: saSignedAt,
            pds_doc: props.hasPds ? `/documents/${props.horseSlug}/pds.pdf` : null,
            sa_doc: props.hasSa
              ? `/documents/${props.horseSlug}/syndicate-agreement.pdf`
              : null,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create checkout session" }));
        throw new Error(err.error || "Failed to create checkout session");
      }

      const data = await res.json();
      const checkoutUrl = data.url || data.session_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
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
            <span className="text-white/60">Buy</span>
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
                {inventoryLoading
                  ? "Loading..."
                  : purchasable
                    ? `${sharesAvailable} unit${sharesAvailable === 1 ? "" : "s"} available`
                    : STATUS_INFO[campaignStatus]?.label || "Coming Soon"}
              </p>
            </div>
          </div>

          {/* Loading state for inventory */}
          {inventoryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]"></div>
            </div>
          ) : !purchasable || sharesAvailable === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 text-center space-y-4">
              <p className="text-lg font-light text-white/60">{closed.title}</p>
              <p className="text-sm font-light text-white/40 max-w-md mx-auto leading-relaxed">
                {inventory?.eligibility_reason || props.closedReason || closed.body}
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
              <h2 className="text-[18px] font-light text-white">How many units?</h2>

              <div className="flex items-center justify-between border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Quantity</p>
                  <p className="text-[13px] font-medium text-white tabular-nums">
                    {percentStake}% of the horse
                  </p>
                  <p className="text-[11px] font-light text-white/40 mt-0.5">
                    {sharesToBuy} unit{sharesToBuy === 1 ? "" : "s"} · of {Number(totalLeasePercent) || "—"}% syndicate stake
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
                  <span className="text-white/40">Units</span>
                  <span className="text-white font-medium">{sharesToBuy}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Purchase amount</span>
                  <span className="text-white font-medium">${totalPriceNzd.toLocaleString()} NZD</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Of the horse</span>
                  <span className="text-white font-medium">{percentStake}%</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-white/40">Investor return</span>
                  <span className="text-[#34D399] font-medium">{investorReturnPct}% gross stakes won</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-white/40">Lease period</span>
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

              {/* Sub-step 3.1: PDS Review — Stage 1 allows proceed without final legal PDFs */}
              {agreementSubStep === 1 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-white">Product Disclosure Statement</p>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          {props.hasPds
                            ? pdsScrollable
                              ? "Please scroll to the bottom to acknowledge"
                              : "Review the disclosure (or open full PDF), then acknowledge"
                            : "Final PDS pending — acknowledge interim terms to continue"}
                        </p>
                      </div>
                      {props.hasPds && (
                        <a
                          href={`/documents/${props.horseSlug}/pds.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] uppercase tracking-wider text-white/60 hover:text-white transition"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>

                    {props.hasPds ? (
                      <div
                        ref={pdsScrollRef}
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                            setPdsScrolled(true);
                          }
                        }}
                        className="h-[28rem] overflow-y-auto bg-black/40 rounded-lg border border-white/[0.04] scroll-smooth"
                      >
                        <iframe
                          title={`${props.horseName} Product Disclosure Statement`}
                          src={`/documents/${props.horseSlug}/pds.pdf#view=FitH`}
                          className="w-full min-h-[40rem] h-[40rem] bg-white rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-[12px] font-light text-white/60 leading-relaxed">
                        <p className="text-amber-200/90 font-medium text-[11px] uppercase tracking-wider">
                          Interim disclosure (Stage 1)
                        </p>
                        <p>
                          The full Product Disclosure Statement for {props.horseName} is being finalised.
                          Proceeding records your intent and KYC identity. Final legal documents will be
                          issued to your MyStable and email after allocation.
                        </p>
                      </div>
                    )}

                    {/* Skip to End shortcut — also unlocks if stub PDF never scrolls */}
                    {props.hasPds && !pdsScrolled && (
                      <button
                        type="button"
                        onClick={() => {
                          const el = pdsScrollRef.current;
                          if (el && el.scrollHeight > el.clientHeight) {
                            el.scrollTop = el.scrollHeight;
                          }
                          setPdsScrolled(true);
                        }}
                        className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition py-1"
                      >
                        {pdsScrollable ? "Skip to End ↓" : "Mark as reviewed ↓"}
                      </button>
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

                    <label className={`flex items-start gap-3 text-[12px] font-light pt-2 ${pdsScrolled ? "text-white/70" : "text-white/30 cursor-not-allowed"}`}>
                      <input
                        type="checkbox"
                        checked={pdsAgreed}
                        disabled={!pdsScrolled}
                        onChange={(e) => {
                          setPdsAgreed(e.target.checked);
                          setPdsSignedAt(e.target.checked ? new Date().toISOString() : null);
                        }}
                        className="w-4 h-4 mt-0.5 rounded accent-[#d4a964] shrink-0"
                      />
                      <span>
                        {props.hasPds
                          ? "I have read the Product Disclosure Statement for this syndicate and electronically sign / agree to its terms (e-sign 1 of 2)."
                          : "I acknowledge the interim PDS notice and agree to receive the final PDS after allocation"}
                        {pdsSignedAt && (
                          <span className="block text-[10px] text-white/40 mt-1">
                            Signed {new Date(pdsSignedAt).toLocaleString()} as {signatureName}
                          </span>
                        )}
                      </span>
                    </label>
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
                      disabled={!pdsAgreed}
                      onClick={() => setAgreementSubStep(2)}
                      className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Next: Syndicate Agreement
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-step 3.2: SA Review — Stage 1 allows proceed without final legal PDFs */}
              {agreementSubStep === 2 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-white">Syndicate Agreement</p>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          {props.hasSa
                            ? saScrollable
                              ? "Please scroll to the bottom to acknowledge"
                              : "Review the agreement (or open full PDF), then acknowledge"
                            : "Final syndicate agreement pending — acknowledge interim terms to continue"}
                        </p>
                      </div>
                      {props.hasSa && (
                        <a
                          href={`/documents/${props.horseSlug}/syndicate-agreement.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] uppercase tracking-wider text-white/60 hover:text-white transition"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>

                    {props.hasSa ? (
                      <div
                        ref={saScrollRef}
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                            setSaScrolled(true);
                          }
                        }}
                        className="h-[28rem] overflow-y-auto bg-black/40 rounded-lg border border-white/[0.04] scroll-smooth"
                      >
                        <iframe
                          title={`${props.horseName} Syndicate Agreement`}
                          src={`/documents/${props.horseSlug}/syndicate-agreement.pdf#view=FitH`}
                          className="w-full min-h-[40rem] h-[40rem] bg-white rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-[12px] font-light text-white/60 leading-relaxed">
                        <p className="text-amber-200/90 font-medium text-[11px] uppercase tracking-wider">
                          Interim agreement (Stage 1)
                        </p>
                        <p>
                          The full Syndicate Agreement for {props.horseName} is being finalised.
                          Your purchase records allocation in MyStable. Signed final documents will
                          follow (PDF e-sign pipeline deferred for Stage 1).
                        </p>
                      </div>
                    )}

                    {props.hasSa && !saScrolled && (
                      <button
                        type="button"
                        onClick={() => {
                          const el = saScrollRef.current;
                          if (el && el.scrollHeight > el.clientHeight) {
                            el.scrollTop = el.scrollHeight;
                          }
                          setSaScrolled(true);
                        }}
                        className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition py-1"
                      >
                        {saScrollable ? "Skip to End ↓" : "Mark as reviewed ↓"}
                      </button>
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

                    <label className={`flex items-start gap-3 text-[12px] font-light pt-2 ${saScrolled ? "text-white/70" : "text-white/30 cursor-not-allowed"}`}>
                      <input
                        type="checkbox"
                        checked={saAgreed}
                        disabled={!saScrolled}
                        onChange={(e) => {
                          setSaAgreed(e.target.checked);
                          setSaSignedAt(e.target.checked ? new Date().toISOString() : null);
                        }}
                        className="w-4 h-4 mt-0.5 rounded accent-[#d4a964] shrink-0"
                      />
                      <span>
                        {props.hasSa
                          ? "I have read the Syndicate Agreement for this syndicate and electronically sign / agree to its terms (e-sign 2 of 2)."
                          : "I acknowledge the interim syndicate terms and agree to receive the final agreement after allocation"}
                        {saSignedAt && (
                          <span className="block text-[10px] text-white/40 mt-1">
                            Signed {new Date(saSignedAt).toLocaleString()} as {signatureName}
                          </span>
                        )}
                      </span>
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
                      onClick={() => setAgreementSubStep(1)}
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
                      {isRedirecting ? "Redirecting..." : "Buy now"}
                    </button>
                  </div>

                  {/* Compliance Notice */}
                  <p className="text-[10.5px] font-light leading-relaxed text-white/45 text-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                    {props.hasPds && props.hasSa
                      ? "You must e-sign the PDS and the Syndicate Agreement (two steps) before checkout. Your KYC name is recorded with each acknowledgement; payment then records your holding."
                      : "Payment records your holding and sends a welcome email. Final signed PDS/SA delivery follows when legal documents are published."}
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