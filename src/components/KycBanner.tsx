"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const STATUS_CONFIG: Record<string, { title: string; message: string; action: string; show: boolean }> = {
  verified: {
    title: "Identity Verified",
    message: "You have full platform access.",
    action: "",
    show: false,
  },
  pending: {
    title: "Verification Pending",
    message: "Your identity verification is being reviewed. This usually takes 1-2 minutes in test mode.",
    action: "Check Status",
    show: true,
  },
  requires_input: {
    title: "Action Required",
    message: "Stripe needs additional information to complete your verification.",
    action: "Complete Verification",
    show: true,
  },
  canceled: {
    title: "Verification Incomplete",
    message: "Your verification was not completed. Please try again to unlock full platform access.",
    action: "Try Again",
    show: true,
  },
  none: {
    title: "Verify Your Identity",
    message: "Complete Stripe Identity verification to unlock full platform access.",
    action: "Start Verification",
    show: true,
  },
};

export function KycBanner() {
  const { user, kycStatus, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) return null;

  const config = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.none;
  if (!config.show) return null;

  const handleAction = async () => {
    if (!user) return;

    if (kycStatus === "pending") {
      router.push("/auth/verify");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/kyc/create-session", {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          error: `Failed to start verification: ${res.status}`,
        }));
        throw new Error(errorData.error || `Failed to start verification: ${res.status}`);
      }

      const data = await res.json();
      const redirectUrl = data.url || data.session_url;
      if (!redirectUrl) {
        throw new Error("No verification URL returned");
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error("KYC session error:", err);
      setErrorMsg(err.message || "Failed to start verification. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-8 md:px-12 lg:px-16 max-w-6xl mx-auto pb-6">
      <div className="rounded-xl border border-warning-border bg-warning-bg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-foreground mb-2">{config.title}</h2>
            <p className="text-sm font-light text-muted max-w-2xl">{config.message}</p>
            {errorMsg && (
              <p className="text-xs font-light text-red-400 mt-2">{errorMsg}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleAction}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Starting..." : `${config.action} →`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
