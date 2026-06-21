"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface KycRequestCardProps {
  horseName: string;
}

export function KycRequestCard({ horseName }: KycRequestCardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerifyIdentity = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${window.location.pathname}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.uid,
          hlt_id: "kyc-verification-request",
          email: user.email || "",
          name: user.displayName || user.email || "Investor",
          units_requested: 0,
          message: "Expressed interest in identity verification / KYC from detail page"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Failed to submit request: ${response.status}` }));
        throw new Error(errorData.error || `Failed to submit request: ${response.status}`);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Verification interest error:", err);
      setErrorMsg(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-[18px] font-medium text-white">Request Received!</h3>
        <p className="text-[13px] leading-relaxed text-white/60">
          Verification request received! We will contact you to initiate secure onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
      <h3 className="text-[16px] font-light text-white tracking-tight">Identity Verification</h3>
      <p className="text-[13px] font-light text-white/60 leading-relaxed">
        Complete verification to purchase shares. This secure process helps protect your account
        and ensures compliance with financial regulations.
      </p>
      {errorMsg && (
        <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
          {errorMsg}
        </p>
      )}
      <button
        type="button"
        onClick={handleVerifyIdentity}
        disabled={loading || isSubmitting}
        className="w-full inline-flex items-center justify-center rounded-lg border border-[#d4af37]/30 px-6 py-3 text-[13px] font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Registering..." : "Verify Identity (KYC)"}
      </button>
    </div>
  );
}
