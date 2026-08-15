"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { STATUS_INFO, type CampaignStatus } from "@/lib/campaign-status";
import { posthog } from "@/lib/posthog-client";
import { roundUpListPriceNzd, sizeGridPct } from "@/lib/pricing";

interface SubscriptionPurchasePageProps {
  horseName: string;
  horseSlug: string;
  horseImage: string;
  hasPds: boolean;
  hasSa: boolean;
  /** Server-computed: false unless PURCHASES_ENABLED and campaign open */
  purchasable?: boolean;
  campaignStatus?: CampaignStatus;
  closedReason?: string;
  /** Pre-select stake % from InvestmentTermsModal (subscription_float) */
  preselectedStakePct?: number | null;
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
  // 017 subscription fields
  list_rate_per_1pct_month?: number | null;
  payment_style?: string | null;
  deposit_months?: number | null;
  prepaid_months?: number | null;
  min_stake_pct?: number | null;
  stake_step_pct?: number | null;
  max_stake_pct?: number | null;
  service_end_date?: string | null;
  owner_rate_per_1pct_month?: number | null;
  platform_fee_pct?: number | null;
}

function closedCopy(status?: CampaignStatus): { title: string; body: string } {
  if (status === "fully_subscribed") {
    return {
      title: "Fully Subscribed",
      body: "All allocations in this syndicate have been filled.",
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

export default function SubscriptionPurchasePage(props: SubscriptionPurchasePageProps) {
  const { user, loading: authLoading, kycStatus } = useAuth();
  const router = useRouter();
  const serverPurchasable = props.purchasable === true;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedStakePct, setSelectedStakePct] = useState<number | null>(null);
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
  const [inventoryLoading, setInventoryLoading] = useState(serverPurchasable);

  // Derived 017 pricing
  const listRate = inventory?.list_rate_per_1pct_month ?? 0;
  const depositMonths = inventory?.deposit_months ?? 3;
  const prepaidMonths = inventory?.prepaid_months ?? 2;
  const minStakePct = inventory?.min_stake_pct ?? 1;
  const stakeStepPct = inventory?.stake_step_pct ?? 0.5;
  const maxStakePct = inventory?.max_stake_pct ?? Number(inventory?.totalLeasePercent || 5);
  const paymentStyle = inventory?.payment_style || "one_time";

  // Build size grid
  const remainingStakePct =
    maxStakePct > 0 && inventory?.shares_available != null && inventory?.shares_total != null
      ? Math.round(
          (inventory.shares_available / inventory.shares_total) * maxStakePct * 100
        ) / 100
      : maxStakePct;

  const sizeGrid = sizeGridPct(minStakePct, stakeStepPct, remainingStakePct);

  const monthlyNzd = selectedStakePct ? roundUpListPriceNzd(listRate * selectedStakePct) : 0;
  const joinFeeMonths = depositMonths + prepaidMonths;
  const joinFeeNzd = selectedStakePct ? roundUpListPriceNzd(listRate * selectedStakePct * joinFeeMonths) : 0;

  // Redirect if not authenticated/verified
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/auth/login?redirect=/marketplace/${props.horseSlug}/purchase`);
      } else if (kycStatus !== "verified") {
        router.push(`/marketplace/${props.horseSlug}`);
      }
    }
  }, [authLoading, user, kycStatus, router, props.horseSlug]);

  // Fetch live inventory
  const initialInventoryFetchRef = useState(false);
  useEffect(() => {
    if (initialInventoryFetchRef[0]) return;
    initialInventoryFetchRef[1](true);
    if (!user || !serverPurchasable) {
      setTimeout(() => setInventoryLoading(false), 0);
      return;
    }
    async function fetchLive() {
      try {
        setInventoryLoading(true);
        const res = await fetch(`/api/inventory/${encodeURIComponent(props.horseSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setInventory(data);
          // AUTO-SELECT: propose the stake from InvestmentTermsModal, else min
          if (props.preselectedStakePct != null && props.preselectedStakePct > 0) {
            // Clamp to available grid
            const grid = sizeGridPct(
              Number(data.min_stake_pct || 1),
              Number(data.stake_step_pct || 0.5),
              data.shares_available != null && data.shares_total != null
                ? Math.round((data.shares_available / data.shares_total) * Number(data.max_stake_pct || data.totalLeasePercent || 5) * 100) / 100
                : Number(data.max_stake_pct || data.totalLeasePercent || 5)
            );
            const matched = grid.length > 0
              ? grid.reduce((prev, curr) =>
                  Math.abs(curr - props.preselectedStakePct!) < Math.abs(prev - props.preselectedStakePct!) ? curr : prev
                )
              : props.preselectedStakePct;
            setSelectedStakePct(matched);
          } else if (data.min_stake_pct) {
            setSelectedStakePct(Number(data.min_stake_pct));
          }
        }
      } catch (err) {
        console.error("Failed to fetch live inventory:", err);
      } finally {
        setInventoryLoading(false);
      }
    }
    const t = setTimeout(() => fetchLive(), 0);
    return () => clearTimeout(t);
  }, [props.horseSlug, user, serverPurchasable, initialInventoryFetchRef]);

  // Scroll detection for PDS/SA
  useEffect(() => {
    function isScrollable(el: HTMLElement) {
      return el.scrollHeight > el.clientHeight + 1;
    }
    function updateScrollable() {
      if (!props.hasPds) {
        setPdsScrollable(false);
        setPdsScrolled(true);
      }
      if (!props.hasSa) {
        setSaScrollable(false);
        setSaScrolled(true);
      }
    }
    updateScrollable();
  }, [props.hasPds, props.hasSa]);

  const signatureName = user?.displayName || user?.email?.split("@")[0] || "Verified Investor";

  const campaignStatus =
    inventory?.campaign_status || props.campaignStatus || "coming_soon";
  const purchasable =
    serverPurchasable && inventory?.purchasable !== false;
  const closed = closedCopy(campaignStatus);

  // ── Closed / Not-available ──
  if (!serverPurchasable) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-canvas text-pure-white font-sans pt-32 pb-24">
          <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-12">
            <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/marketplace" className="hover:text-frost transition">Marketplace</Link>
              <span>/</span>
              <Link href={`/marketplace/${props.horseSlug}`} className="hover:text-frost transition">{props.horseName}</Link>
              <span>/</span>
              <span className="text-foreground">Buy</span>
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-xl bg-surface-base border border-border overflow-hidden relative flex-shrink-0">
                {props.horseImage && (
                  <Image src={props.horseImage} alt={props.horseName} fill className="object-cover" />
                )}
              </div>
              <div>
                <h1 className="text-[24px] font-light text-heading tracking-tight">{props.horseName}</h1>
                <p className="text-[12px] text-muted-foreground">{STATUS_INFO[campaignStatus]?.label || "Coming Soon"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-base p-12 text-center space-y-4">
              <p className="text-lg font-light text-foreground">{closed.title}</p>
              <p className="text-sm font-light text-muted-foreground max-w-md mx-auto leading-relaxed">
                {props.closedReason || closed.body}
              </p>
              <Link href={`/marketplace/${props.horseSlug}`}
                className="inline-block rounded-full border border-border text-pure-white hover:bg-white/5 transition px-8 py-3 text-[11px] font-medium uppercase tracking-widest">
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
      <div className="flex min-h-screen items-center justify-center bg-canvas text-pure-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const investorReturnPct = inventory?.investorReturnPct ?? 0;
  const leasePeriodMonths = inventory?.leasePeriodMonths ?? 0;

  const handleStripeCheckout = async () => {
    if (!purchasable || !selectedStakePct) {
      setErrorMsg(props.closedReason || closed.body);
      return;
    }

    setIsRedirecting(true);
    setErrorMsg("");

    posthog.capture("purchase_started", {
      horse_slug: props.horseSlug,
      payment_model: "subscription_float",
      stake_pct: selectedStakePct,
      monthly_nzd: monthlyNzd,
      join_fee_nzd: joinFeeNzd,
    });

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
          stake_pct: selectedStakePct,
          success_url: `${window.location.origin}/marketplace/${props.horseSlug}/confirm?success=true`,
          cancel_url: `${window.location.origin}/marketplace/${props.horseSlug}/purchase`,
          e_sign: {
            signature_name: signatureName,
            pds_agreed: pdsAgreed,
            sa_agreed: saAgreed,
            pds_signed_at: pdsSignedAt,
            sa_signed_at: saSignedAt,
            pds_doc: props.hasPds ? `/documents/${props.horseSlug}/pds.pdf` : null,
            sa_doc: props.hasSa ? `/documents/${props.horseSlug}/sa.pdf` : null,
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
        window.location.assign(checkoutUrl);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(err.message || "Failed to start checkout. Please try again.");
      setIsRedirecting(false);
    }
  };

  // ── Render ──
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-canvas text-pure-white font-sans pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Link href="/marketplace" className="hover:text-frost transition">Marketplace</Link>
            <span>/</span>
            <Link href={`/marketplace/${props.horseSlug}`} className="hover:text-frost transition">{props.horseName}</Link>
            <span>/</span>
            <span className="text-foreground">Buy</span>
          </div>

          {/* Horse header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-xl bg-surface-base border border-border overflow-hidden relative flex-shrink-0">
              {props.horseImage && (
                <Image src={props.horseImage} alt={props.horseName} fill className="object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-[24px] font-light text-heading tracking-tight">{props.horseName}</h1>
              <p className="text-[12px] text-muted-foreground">
                {inventoryLoading
                  ? "Loading..."
                  : purchasable
                    ? `${inventory?.shares_available ?? 0} allocation${(inventory?.shares_available ?? 0) === 1 ? "" : "s"} available`
                    : STATUS_INFO[campaignStatus]?.label || "Coming Soon"}
              </p>
            </div>
          </div>

          {inventoryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : !purchasable || sizeGrid.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface-base p-12 text-center space-y-4">
              <p className="text-lg font-light text-foreground">{closed.title}</p>
              <p className="text-sm font-light text-muted-foreground max-w-md mx-auto leading-relaxed">
                {inventory?.eligibility_reason || props.closedReason || closed.body}
              </p>
              <Link href={`/marketplace/${props.horseSlug}`}
                className="inline-block rounded-full border border-border text-pure-white hover:bg-white/5 transition px-8 py-3 text-[11px] font-medium uppercase tracking-widest">
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
                      step >= s ? "bg-accent text-black" : "bg-surface-base text-muted-foreground border border-border"
                    }`}>
                      {s}
                    </div>
                    {s < 3 && <div className={`w-12 h-[1px] ${step > s ? "bg-accent" : "bg-border"}`} />}
                  </div>
                ))}
              </div>

              {/* ── Step 1: Stake size picker ── */}
              {step === 1 && (
                <div className="space-y-8">
                  <h2 className="text-[18px] font-light text-heading">Choose your monthly stake</h2>

                  {/* Hero price */}
                  <div className="rounded-2xl border border-border bg-surface-base p-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                      Monthly investment
                    </p>
                    <p className="text-[36px] font-light text-accent tracking-tight">
                      NZD${(monthlyNzd || (listRate > 0 ? roundUpListPriceNzd(listRate * minStakePct) : 0)).toLocaleString()}
                      <span className="text-[14px] text-muted-foreground font-light ml-1">/mo</span>
                    </p>
                    <p className="text-[11px] font-light text-muted-foreground mt-1">
                      {listRate > 0
                        ? `NZD$${listRate}/month per 1%`
                        : ""}
                    </p>
                  </div>

                  {/* Stake grid */}
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Select your stake
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {sizeGrid.map((stake) => {
                        const isSelected = selectedStakePct === stake;
                        const monthly = roundUpListPriceNzd(listRate * stake);
                        const joinFee = roundUpListPriceNzd(listRate * stake * joinFeeMonths);
                        return (
                          <button
                            key={stake}
                            type="button"
                            onClick={() => setSelectedStakePct(stake)}
                            className={`rounded-2xl border p-4 text-center transition-all duration-200 ${
                              isSelected
                                ? "border-accent bg-accent/10 text-pure-white"
                                : "border-border bg-surface-base text-muted-foreground hover:border-steel-border hover:text-pure-white"
                            }`}
                          >
                            <p className="text-[16px] font-medium tabular-nums">{stake}%</p>
                            <p className="text-[11px] font-light mt-0.5">NZD${monthly}/mo</p>
                            <p className="text-[9px] font-light text-muted-foreground/60 mt-0.5">
                              {joinFeeMonths}mo join: NZD${joinFee}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedStakePct && (
                    <div className="space-y-4 border-t border-border pt-6">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] font-light text-muted-foreground">Join fee (deposit + prepaid)</span>
                        <span className="text-[14px] font-medium text-pure-white">
                          NZD${joinFeeNzd.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] font-light text-muted-foreground/60">
                        {depositMonths}-month deposit + {prepaidMonths}-month prepaid = {joinFeeMonths} months
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] font-light text-muted-foreground">Monthly recurring</span>
                        <span className="text-[14px] font-medium text-pure-white">
                          NZD${monthlyNzd.toLocaleString()}/month
                        </span>
                      </div>
                      {inventory?.service_end_date && (
                        <div className="text-[11px] font-light text-muted-foreground/60">
                          Service ends: {new Date(inventory.service_end_date).toLocaleDateString("en-NZ", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!selectedStakePct}
                    onClick={() => setStep(2)}
                    className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Continue
                  </button>

                  {/* Compliance */}
                  <p className="text-[10px] font-light leading-relaxed text-muted-foreground text-center">
                    Monthly subscription — cancel anytime. All acquisitions are subject to NZTR syndication rules and FMA equine exemptions.
                  </p>
                </div>
              )}

              {/* ── Step 2: Summary ── */}
              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-[18px] font-light text-heading">Summary</h2>

                  <div className="rounded-2xl border border-border bg-surface-base p-6 space-y-4 text-[14px] font-light">
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Stake</span>
                      <span className="text-pure-white font-medium">{selectedStakePct}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Join fee</span>
                      <span className="text-pure-white font-medium">NZD${joinFeeNzd.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Monthly fee</span>
                      <span className="text-pure-white font-medium">NZD${monthlyNzd.toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Investor return</span>
                      <span className="text-[#34D399] font-medium">{investorReturnPct}% of gross stakes won</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-muted-foreground">Lease period</span>
                      <span className="text-pure-white font-medium">{leasePeriodMonths} months</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-border text-pure-white hover:bg-white/5 transition"
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

              {/* ── Step 3: Agreements + Checkout ── */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-light text-heading">
                      Agreement ({agreementSubStep === 1 ? "1/2 — PDS" : "2/2 — Syndicate Agreement"})
                    </h2>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Step 3.{agreementSubStep}</span>
                  </div>

                  {/* PDS substep */}
                  {agreementSubStep === 1 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border bg-surface-base p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[14px] font-medium text-heading">Product Disclosure Statement</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {props.hasPds
                                ? "Please scroll to the bottom to acknowledge"
                                : "Final PDS pending — acknowledge interim terms to continue"}
                            </p>
                          </div>
                          {props.hasPds && (
                            <a
                              href={`/documents/${props.horseSlug}/pds.pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] uppercase tracking-wider text-foreground hover:text-pure-white transition"
                            >
                              Open ↗
                            </a>
                          )}
                        </div>

                        {props.hasPds ? (
                          <div className="h-[24rem] overflow-y-auto bg-canvas/40 rounded-lg border border-border">
                            <iframe
                              title={`${props.horseName} PDS`}
                              src={`/documents/${props.horseSlug}/pds.pdf#view=FitH`}
                              className="w-full min-h-[36rem] bg-white rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-[12px] font-light text-foreground leading-relaxed">
                            <p className="text-amber-200/90 font-medium text-[11px] uppercase tracking-wider">Interim disclosure</p>
                            <p>The full Product Disclosure Statement is being finalised. Proceeding records your intent.</p>
                          </div>
                        )}

                        <div className="space-y-2.5 pt-2 border-t border-border">
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Acknowledged by
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={signatureName}
                            className="w-full bg-surface-base border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                          />
                        </div>

                        <label className="flex items-start gap-3 text-[12px] font-light pt-2">
                          <input
                            type="checkbox"
                            checked={pdsAgreed}
                            onChange={(e) => {
                              setPdsAgreed(e.target.checked);
                              setPdsSignedAt(e.target.checked ? new Date().toISOString() : null);
                            }}
                            className="w-4 h-4 mt-0.5 rounded accent-accent shrink-0"
                          />
                          <span>
                            {props.hasPds
                              ? "I have read the PDS and electronically sign / agree (e-sign 1 of 2)."
                              : "I acknowledge the interim PDS notice."}
                            {pdsSignedAt && (
                              <span className="block text-[10px] text-muted-foreground mt-1">
                                Signed {new Date(pdsSignedAt).toLocaleString()} as {signatureName}
                              </span>
                            )}
                          </span>
                        </label>
                      </div>

                      <div className="flex gap-4">
                        <button type="button" onClick={() => { setStep(2); setAgreementSubStep(1); }}
                          className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-border text-pure-white hover:bg-white/5 transition">
                          Back
                        </button>
                        <button type="button" disabled={!pdsAgreed} onClick={() => setAgreementSubStep(2)}
                          className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition">
                          Next: Syndicate Agreement
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SA substep */}
                  {agreementSubStep === 2 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-border bg-surface-base p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[14px] font-medium text-heading">Syndicate Agreement</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {props.hasSa ? "Please scroll to the bottom to acknowledge" : "Final agreement pending"}
                            </p>
                          </div>
                          {props.hasSa && (
                            <a href={`/documents/${props.horseSlug}/sa.pdf`} target="_blank" rel="noreferrer"
                              className="text-[10px] uppercase tracking-wider text-foreground hover:text-pure-white transition">
                              Open ↗
                            </a>
                          )}
                        </div>

                        {props.hasSa ? (
                          <div className="h-[24rem] overflow-y-auto bg-canvas/40 rounded-lg border border-border">
                            <iframe title="Syndicate Agreement"
                              src={`/documents/${props.horseSlug}/sa.pdf#view=FitH`}
                              className="w-full min-h-[36rem] bg-white rounded-lg" />
                          </div>
                        ) : (
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-[12px] font-light text-foreground">
                            <p>Final Syndicate Agreement is being finalised.</p>
                          </div>
                        )}

                        <div className="space-y-2.5 pt-2 border-t border-border">
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Acknowledged by
                          </label>
                          <input type="text" readOnly value={signatureName}
                            className="w-full bg-surface-base border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed" />
                        </div>

                        <label className="flex items-start gap-3 text-[12px] font-light pt-2">
                          <input type="checkbox" checked={saAgreed}
                            onChange={(e) => {
                              setSaAgreed(e.target.checked);
                              setSaSignedAt(e.target.checked ? new Date().toISOString() : null);
                            }}
                            className="w-4 h-4 mt-0.5 rounded accent-accent shrink-0" />
                          <span>
                            {props.hasSa
                              ? "I have read the Syndicate Agreement and electronically sign / agree (e-sign 2 of 2)."
                              : "I acknowledge the interim syndicate terms."}
                            {saSignedAt && (
                              <span className="block text-[10px] text-muted-foreground mt-1">
                                Signed {new Date(saSignedAt).toLocaleString()} as {signatureName}
                              </span>
                            )}
                          </span>
                        </label>
                      </div>

                      {errorMsg && (
                        <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">{errorMsg}</p>
                      )}

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setAgreementSubStep(1)}
                          className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-border text-pure-white hover:bg-white/5 transition">
                          Back
                        </button>
                        <button type="button" onClick={handleStripeCheckout}
                          disabled={!pdsAgreed || !saAgreed || isRedirecting}
                          className="flex-1 text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-accent text-black hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition">
                          {isRedirecting ? "Redirecting..." : "Subscribe now"}
                        </button>
                      </div>

                      <p className="text-[10.5px] font-light leading-relaxed text-muted-foreground text-center bg-surface-base border border-border rounded-xl p-3">
                        You must e-sign the PDS and Syndicate Agreement before checkout. You&apos;ll be charged the join fee (NZD${joinFeeNzd.toLocaleString()}) plus your first month (NZD${monthlyNzd.toLocaleString()}) at checkout, then NZD${monthlyNzd.toLocaleString()}/month thereafter.
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
