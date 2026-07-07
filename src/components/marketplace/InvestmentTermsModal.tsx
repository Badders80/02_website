"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface InvestmentTermsModalProps {
  horseName: string;
  horseSlug: string;
  pricePerShareNzd: number;
  totalLeasePercent: number | string;
  leasePeriodMonths: number | string;
  leaseStartDate: string;
  investorReturnPct: number | string;
  sharesTotal: number;
  sharesAvailable: number;
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
}: InvestmentTermsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState("");
  const { user, kycStatus } = useAuth();
  const router = useRouter();

  const handleAcquire = async () => {
    // KYC gate: verified → purchase, pending → processing screen, none → trigger KYC
    if (kycStatus === "verified") {
      router.push(`/marketplace/${horseSlug}/purchase`);
    } else if (kycStatus === "pending") {
      router.push(`/marketplace/${horseSlug}/kyc-processing`);
    } else {
      // Trigger Stripe Identity KYC flow
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
          const err = await res.json().catch(() => ({ error: "Failed to start KYC" }));
          throw new Error(err.error || "Failed to start KYC");
        }
        const data = await res.json();
        if (data.verified) {
          // Already verified server-side — go to purchase
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-lg w-full rounded-3xl border border-white/[0.08] bg-[#0A0A0F] p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-xl"
            >
              ✕
            </button>

            {/* Title */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                Digital-Syndication Terms
              </p>
              <h3 className="text-[22px] font-light text-white tracking-tight">
                {horseName}
              </h3>
            </div>

            {/* Terms */}
            <div className="space-y-4 text-[13px] font-light">
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Price per share</span>
                <span className="text-white font-medium">
                  ${pricePerShareNzd.toLocaleString()} NZD
                </span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Total lease percentage</span>
                <span className="text-white font-medium">{totalLeasePercent}%</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Lease period</span>
                <span className="text-white font-medium">{leasePeriodMonths} months</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Lease start date</span>
                <span className="text-white font-medium">{leaseStartDate}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Investor returns</span>
                <span className="text-[#34D399] font-medium">
                  {investorReturnPct}% of stakes won
                </span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-white/40">Shares available</span>
                <span className="text-white font-medium">
                  {sharesAvailable} / {sharesTotal}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/40">Capital calls</span>
                <span className="text-white font-medium">None</span>
              </div>
            </div>

            {/* No capital calls note */}
            <p className="text-[11px] font-light text-white/30 leading-relaxed">
              Race-day costs — jockey, trainer, nominations — are handled within the ownership framework. Investors are not asked to fund operating expenses.
            </p>

            {/* KYC status hint */}
            {kycStatus !== "verified" && (
              <p className="text-[11px] font-light text-white/40 leading-relaxed text-center">
                {kycStatus === "pending"
                  ? "Your identity verification is in progress. Click Acquire to check status."
                  : "Identity verification is required before acquiring shares."}
              </p>
            )}

            {kycError && (
              <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                {kycError}
              </p>
            )}

            {/* Acquire CTA */}
            <button
              type="button"
              onClick={handleAcquire}
              disabled={kycLoading}
              className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#d4a964]/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {kycLoading ? "Starting verification..." : "Acquire"}
            </button>

            <p className="text-[10px] font-light leading-relaxed text-white/20 text-center">
              All acquisitions are subject to NZTR syndication rules and FMA equine exemptions.
            </p>
          </div>
        </div>
      )}
    </>
  );
}