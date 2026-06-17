"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const STATUS_CONFIG: Record<string, { title: string; message: string; color: string }> = {
  verified: {
    title: "Verified",
    message: "Your identity has been verified. You now have full platform access.",
    color: "text-green-400",
  },
  pending: {
    title: "Verification Pending",
    message: "Your verification is being reviewed. This usually takes 1-2 minutes in test mode.",
    color: "text-yellow-400",
  },
  requires_input: {
    title: "Action Required",
    message: "Stripe needs additional information to complete your verification.",
    color: "text-orange-400",
  },
  canceled: {
    title: "Verification Canceled",
    message: "Your verification was not completed. You can try again.",
    color: "text-red-400",
  },
  none: {
    title: "Not Verified",
    message: "Complete identity verification to unlock full platform access.",
    color: "text-muted",
  },
};

export default function VerifyPage() {
  const router = useRouter();
  const { user, kycStatus, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Poll for status changes after returning from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStripe = urlParams.get("from") === "stripe" || document.referrer.includes("stripe.com");

    if (fromStripe && kycStatus !== "verified" && kycStatus !== "none") {
      setPolling(true);
      const interval = setInterval(async () => {
        try {
          // Force token refresh to get updated claims
          if (user) {
            await user.getIdToken(true);
          }
        } catch {
          // Token refresh failed, stop polling
          clearInterval(interval);
          setPolling(false);
        }
      }, 3000);

      // Stop polling after 60 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setPolling(false);
      }, 60000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [user, kycStatus]);

  const startKYC = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/kyc/create-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.uid, email: user.email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create KYC session");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const config = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.none;
  const showStartButton = kycStatus === "none" || kycStatus === "canceled" || kycStatus === "requires_input";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl font-bold text-gold">
            Evolution Stables
          </Link>
          <p className="mt-2 text-sm text-muted">Identity Verification</p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-panel p-6">
          {/* Status display */}
          <div className="mb-6 text-center">
            <div className={`mb-2 text-lg font-semibold ${config.color}`}>
              {polling ? "Checking status..." : config.title}
            </div>
            <p className="text-sm text-muted">{config.message}</p>
            {polling && (
              <div className="mt-3 flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {showStartButton && (
            <button
              onClick={startKYC}
              disabled={loading || !user}
              className="w-full rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-hover disabled:opacity-50"
            >
              {loading ? "Starting..." : kycStatus === "requires_input" ? "Complete Verification" : "Start Verification"}
            </button>
          )}

          {kycStatus === "verified" && (
            <button
              onClick={() => router.push("/mystable")}
              className="w-full rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-hover"
            >
              Go to MyStable →
            </button>
          )}

          {!user && (
            <p className="mt-4 text-center text-sm text-muted">
              Please{" "}
              <Link href="/auth/login" className="text-gold hover:underline">sign in</Link>{" "}
              first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
