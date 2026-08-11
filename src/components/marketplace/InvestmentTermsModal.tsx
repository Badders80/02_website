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
    month: "short",
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

  const termRow = (label: string, value: ReactNode, last = false) => (
    <div
      className={`flex justify-between gap-4 ${
        last ? "pb-1" : "border-b border-border pb-3.5"
      }`}
    >
      <span className="text-muted-foreground shrink-0 max-w-[55%] leading-snug">
        {label}
      </span>
      <span className="text-white font-medium text-right leading-snug">
        {value}
      </span>
    </div>
  );

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/60 backdrop-blur-md px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-surface-base backdrop-blur-2xl p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-frost transition text-xl"
            >
              ✕
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Digital-Syndication Terms
              </p>
              <h3 className="text-[22px] font-light text-white tracking-tight">
                {horseName}
              </h3>
            </div>

            {/* Hero: price + minimum investment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listRatePer1Pct != null && listRatePer1Pct > 0 && (
                <div className="rounded-2xl border border-border bg-surface-base p-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Price
                  </p>
                  <p className="text-[28px] font-light text-white tracking-tight leading-none">
                    ${formatMoney(listRatePer1Pct)}
                    <span className="text-[13px] text-muted-foreground font-light ml-1">
                      NZD
                    </span>
                  </p>
                  <p className="text-[11px] font-light text-white/45 leading-snug pt-1">
                    per month
                  </p>
                  <p className="text-[11px] font-light text-muted-foreground leading-snug">
                    Based on 1% investment
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-border bg-surface-base p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Minimum investment
                </p>
                <p className="text-[28px] font-light text-white tracking-tight leading-none">
                  ${formatMoney(pricePerShareNzd)}
                  <span className="text-[13px] text-muted-foreground font-light ml-1">
                    NZD
                  </span>
                </p>
                <p className="text-[11px] font-light text-white/45 leading-snug pt-1">
                  {unitPctOfHorse > 0
                    ? `${formatPct(unitPctOfHorse)}% unit`
                    : "1 unit"}
                </p>
              </div>
            </div>

            {/* Secondary: lease, stake, return */}
            <div className="space-y-4 text-[13px] font-light border-t border-border pt-5">
              {termRow(
                "Lease period",
                months > 0 ? `${months} months` : "—"
              )}
              {termRow("Lease start date", formatStartDate(leaseStartDate))}
              {termRow(
                "Syndicate stake available",
                stakeAvailablePct > 0 ? (
                  <span className="inline-flex flex-col items-end gap-0.5">
                    <span>{formatPct(stakeAvailablePct)}%</span>
                    <span className="text-[11px] font-light text-muted-foreground">
                      Based on total ownership
                    </span>
                  </span>
                ) : (
                  "—"
                )
              )}
              {termRow(
                "Investor return",
                <span className="text-[#34D399] font-medium">
                  {investorReturnPct}% of gross stakes won
                </span>,
                true
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Returns explained
              </p>
              <p className="text-[11px] font-light text-white/35 leading-relaxed">
                Returns are pro-rata based on your ownership in Evolution&apos;s
                syndicate stake. They are calculated according to official NZTR
                results and distributed quarterly after settlement.{" "}
                {/* TODO: wire real returns explainer page */}
                <a
                  href="/learn/returns"
                  className="text-muted-foreground underline underline-offset-2 hover:text-frost transition"
                >
                  Learn more about how returns work
                </a>
              </p>
            </div>

            {readOnly ? (
              <p className="text-[11px] font-light text-muted-foreground leading-relaxed text-center">
                Terms preview — this offering is not yet open for acquisition.
              </p>
            ) : (
              <>
                {kycStatus !== "verified" && (
                  <p className="text-[11px] font-light text-muted-foreground leading-relaxed text-center">
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

                <p className="text-[10px] font-light leading-relaxed text-muted-foreground text-center">
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
