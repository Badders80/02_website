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
      const response = await fetch("/api/kyc/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email || "",
          return_url: `${window.location.origin}/auth/verify?from=stripe`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Failed to start verification: ${response.status}`,
        }));
        throw new Error(errorData.error || `Failed to start verification: ${response.status}`);
      }

      const data = await response.json();
      const redirectUrl = data.url || data.session_url;
      if (!redirectUrl) {
        throw new Error("No verification URL returned");
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMsg(err.message || "Failed to start verification. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
      <h3 className="text-[16px] font-light text-white tracking-tight">Identity Verification</h3>
      <p className="text-[13px] font-light text-white/60 leading-relaxed">
        Complete verification to purchase shares in {horseName}. This secure process helps protect your account
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
        {isSubmitting ? "Starting..." : "Verify Identity (KYC)"}
      </button>
    </div>
  );
}
