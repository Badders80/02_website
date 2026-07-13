"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toListRate } from "@/lib/pricing";

interface InvestmentTermsModalProps {
  horseName: string;
  horseSlug: string;
  /** All-in list price for one unit (lot) over the full term — checkout ticket */
  pricePerShareNzd: number;
  /** Evolution syndicate stake as % of the horse (e.g. 5) */
  totalLeasePercent: number | string;
  leasePeriodMonths: number | string;
  leaseStartDate: string;
  investorReturnPct: number | string;
  sharesTotal: number;
  sharesAvailable: number;
  /** Owner rate $/mo per 1% of horse — for apples-to-apples price line */
  ownerRatePer1PctMonth?: number | null;
  platformFeePct?: number | null;
  /** Preview mode: show real terms without purchase CTA (coming_soon_details) */
  readOnly?: boolean;
}

function formatStartDate(raw: string): string {
  if (!raw || raw === "TBD") return raw || "TBD";
  const d = new Date(raw.includes("T") ? raw : `${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Investor list amounts are whole dollars (ceil to nearest $1). */
function formatMoney(n: number): string {
  return Math.round(n).toLocaleString("en-NZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Format stake % without trailing junk (5 → 5, 4.75 → 4.75, 0.25 → 0.25). */
function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 10000) / 10000;
  return String(rounded);
}

export function InvestmentTermsModal({
  horseName,
  horseSlug,
  pricePerShareNzd,
  totalLeasePercent,
  leasePeriodMonths,
  leaseStartDate,
  investorReturnPct,
  sharesTotal,
  sharesAvailable,
  ownerRatePer1PctMonth,
  platformFeePct,
  readOnly = false,
}: InvestmentTermsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState("");
  const { user, kycStatus } = useAuth();
  const router = useRouter();

  const stakePct = Number(totalLeasePercent) || 0;
  const months = Number(leasePeriodMonths) || 0;
  const lots = Number(sharesTotal) || 0;
  const available = Number(sharesAvailable) || 0;
  const unitPctOfHorse =
    stakePct > 0 && lots > 0
      ? Math.round((stakePct / lots) * 10000) / 10000
      : 0;
  // Remaining syndicate as % of the horse (e.g. 19/20 × 5% = 4.75%)
  const stakeAvailablePct =
    stakePct > 0 && lots > 0
      ? Math.round((available / lots) * stakePct * 10000) / 10000
      : 0;

  // Apples-to-apples list rate ($/mo per 1% of horse)
  let listRatePer1Pct: number | null = null;
  if (
    ownerRatePer1PctMonth != null &&
    Number(ownerRatePer1PctMonth) > 0
  ) {
    listRatePer1Pct = toListRate(
      Number(ownerRatePer1PctMonth),
      platformFeePct != null && Number(platformFeePct) >= 0
        ? Number(platformFeePct)
        : 5
    );
  } else if (
    pricePerShareNzd > 0 &&
    unitPctOfHorse > 0 &&
    months > 0
  ) {
    // Reverse from ticket: lot$ = list_rate × unit% × months
    listRatePer1Pct = pricePerShareNzd / (unitPctOfHorse * months);
  }

  const handleAcquire = async () => {
    if (kycStatus === "verified") {
      router.push(`/marketplace/${horseSlug}/purchase`);
    } else if (kycStatus === "pending") {
      router.push(`/marketplace/${horseSlug}/kyc-processing`);
    } else {
      if (!user) return;
      setKycLoading(true);
      setKycError("");
      try {
        const token = await user.getIdToken(true);
        const res = await fetch("/api/kyc/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.uid,
            email: user.email,
            return_url: `${window.location.origin}/marketplace/${horseSlug}/kyc-processing`,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({
            error: "Failed to start KYC",
          }));
          throw new Error(err.error || "Failed to start KYC");
        }
        const data = await res.json();
        if (data.verified) {
          router.push(`/marketplace/${horseSlug}/purchase`);
        } else if (data.session_url || data.url) {
          window.location.href = data.session_url || data.url;
        }
      } catch (err: any) {
        setKycError(err.message || "Failed to start verification");
      } finally {
        setKycLoading(false);
      }
    }
  };

  const termRow = (
    label: string,
    value: ReactNode,
    hint?: string,
    last = false
  ) => (
    <div
      className={`space-y-1 ${
        last ? "pb-1" : "border-b border-white/[0.06] pb-3.5"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="text-[15px] font-medium text-white leading-snug">{value}</p>
      {hint ? (
        <p className="text-[11px] font-light text-white/40 leading-snug">
          {hint}
        </p>
      ) : null}
    </div>
  );

  const priceDisplay =
    listRatePer1Pct != null && listRatePer1Pct > 0
      ? `$${formatMoney(listRatePer1Pct)} NZD per month`
      : null;
  const minInvestDisplay = `$${formatMoney(pricePerShareNzd)} NZD`;
  const leaseTermDisplay =
    months > 0
      ? `${months} months starting ${formatStartDate(leaseStartDate)}`
      : formatStartDate(leaseStartDate);

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
            className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-xl"
            >
              ✕
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                Digital-Syndication Terms
              </p>
              <h3 className="text-[22px] font-light text-white tracking-tight">
                {horseName}
              </h3>
            </div>

            {/* Commercial story — price first, then structure */}
            <div className="space-y-4 text-[13px] font-light">
              {priceDisplay &&
                termRow(
                  "Price",
                  priceDisplay,
                  "Based on 1% investment"
                )}
              {termRow(
                "Minimum investment",
                minInvestDisplay,
                unitPctOfHorse > 0
                  ? `${formatPct(unitPctOfHorse)}% unit`
                  : "1 unit"
              )}
              {termRow("Lease term", leaseTermDisplay)}
              {termRow(
                "Syndicate stake available",
                stakeAvailablePct > 0
                  ? `${formatPct(stakeAvailablePct)}%`
                  : "—",
                "Based on total ownership"
              )}
              {termRow(
                "Investor return",
                <span className="text-[#34D399] font-medium">
                  {investorReturnPct}% of gross stakes won
                </span>,
                undefined,
                true
              )}
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Returns explained
              </p>
              <p className="text-[11px] font-light text-white/35 leading-relaxed">
                Returns are pro-rata based on your ownership in Evolution&apos;s
                syndicate stake. They are calculated according to official NZTR
                results and distributed quarterly after settlement.{" "}
                {/* TODO: wire real returns explainer page */}
                <a
                  href="/learn/returns"
                  className="text-white/55 underline underline-offset-2 hover:text-white/80 transition"
                >
                  Learn more about how returns work
                </a>
              </p>
            </div>

            {readOnly ? (
              <p className="text-[11px] font-light text-white/40 leading-relaxed text-center">
                Terms preview — this offering is not yet open for acquisition.
              </p>
            ) : (
              <>
                {kycStatus !== "verified" && (
                  <p className="text-[11px] font-light text-white/40 leading-relaxed text-center">
                    {kycStatus === "pending"
                      ? "Your identity verification is in progress. Click Buy now to check status."
                      : "Identity verification is required before you can buy units."}
                  </p>
                )}

                {kycError && (
                  <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    {kycError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleAcquire}
                  disabled={kycLoading}
                  className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {kycLoading ? "Starting verification..." : "Buy now"}
                </button>

                <p className="text-[10px] font-light leading-relaxed text-white/20 text-center">
                  All acquisitions are subject to NZTR syndication rules and
                  FMA equine exemptions.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
