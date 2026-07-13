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

function formatMoney(n: number, digits = 2): string {
  return n.toLocaleString("en-NZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
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
  const unitPctOfHorse =
    stakePct > 0 && lots > 0
      ? Math.round((stakePct / lots) * 10000) / 10000
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
        last ? "pb-1" : "border-b border-white/[0.06] pb-3.5"
      }`}
    >
      <span className="text-white/40 shrink-0 max-w-[55%] leading-snug">
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
              <p className="text-[11px] font-light text-white/40 mt-2 leading-relaxed">
                Pro-rata units in Evolution Stables&apos; syndicate stake on
                this horse — not freehold ownership of the whole horse.
              </p>
            </div>

            {/* Hierarchy: price + min invest → term/start → units → stake → returns → capital */}
            <div className="space-y-4 text-[13px] font-light">
              {listRatePer1Pct != null && listRatePer1Pct > 0 && (
                <div className="flex justify-between gap-4 border-b border-white/[0.06] pb-3.5">
                  <span className="text-white/40 shrink-0 max-w-[55%] leading-snug">
                    Price
                  </span>
                  <span className="text-white font-medium text-right leading-snug">
                    ${formatMoney(listRatePer1Pct)} NZD
                    <span className="block text-[11px] font-light text-white/45 mt-0.5">
                      / month per 1% of the horse
                    </span>
                  </span>
                </div>
              )}

              {termRow(
                "Minimum investment",
                <>
                  ${formatMoney(pricePerShareNzd)} NZD
                  <span className="block text-[11px] font-light text-white/45 mt-0.5">
                    1 unit
                    {unitPctOfHorse > 0
                      ? ` · ${unitPctOfHorse}% of the horse`
                      : ""}
                    {months > 0 ? ` · full ${months}-month term` : ""}
                  </span>
                </>
              )}

              {termRow(
                "Lease period",
                months > 0 ? `${months} months` : String(leasePeriodMonths)
              )}

              {termRow("Lease start date", formatStartDate(leaseStartDate))}

              {termRow(
                "Units available",
                `${sharesAvailable} / ${sharesTotal}`
              )}

              {termRow(
                `Evolution Stables syndicate stake in ${horseName}`,
                stakePct > 0 ? `${stakePct}% of the horse` : "—"
              )}

              {termRow(
                "Investor return",
                <span className="text-[#34D399] font-medium">
                  {investorReturnPct}% gross stakes won*
                </span>,
                true
              )}
            </div>

            <p className="text-[11px] font-light text-white/35 leading-relaxed">
              *Returns are pro-rata to your units in the Evolution syndicate
              stake (not of the whole horse), based on official NZTR stakes,
              and distributed quarterly after settlement.
            </p>

            {readOnly ? (
              <p className="text-[11px] font-light text-white/40 leading-relaxed text-center">
                Terms preview — this offering is not yet open for acquisition.
              </p>
            ) : (
              <>
                {kycStatus !== "verified" && (
                  <p className="text-[11px] font-light text-white/40 leading-relaxed text-center">
                    {kycStatus === "pending"
                      ? "Your identity verification is in progress. Click Acquire to check status."
                      : "Identity verification is required before acquiring units."}
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
                  className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#d4a964]/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {kycLoading ? "Starting verification..." : "Become an owner"}
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
