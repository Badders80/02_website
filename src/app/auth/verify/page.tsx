"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    message: "Your verification is being reviewed. This can take a few minutes.",
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
  const { user, kycStatus, loading: authLoading, refreshClaims } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [isFromStripe, setIsFromStripe] = useState(false);

  // Keep refs in sync with latest state without mutating during render.
  const kycStatusRef = useRef(kycStatus);
  const refreshClaimsRef = useRef(refreshClaims);
  useEffect(() => {
    kycStatusRef.current = kycStatus;
    refreshClaimsRef.current = refreshClaims;
  }, [kycStatus, refreshClaims]);

  // Capture Stripe return state and start polling. State updates that happen
  // during effect evaluation are deferred via setTimeout so they do not
  // trigger cascading renders.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStripe = urlParams.get("from") === "stripe" || document.referrer.includes("stripe.com");

    if (!fromStripe || !user) {
      setTimeout(() => {
        setIsFromStripe(fromStripe);
        setPolling(false);
      }, 0);
      return;
    }

    if (kycStatusRef.current === "verified") {
      setTimeout(() => {
        setIsFromStripe(true);
        setPolling(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setIsFromStripe(true);
      setPolling(true);
    }, 0);
    console.log("[KYC verify] Starting server-side polling for uid:", user.uid);

    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      interval = null;
      timeout = null;
      setPolling(false);
    };

    const poll = async () => {
      if (!user || kycStatusRef.current === "verified") {
        cleanup();
        return;
      }

      try {
        const token = await user.getIdToken(true);
        const res = await fetch("/api/kyc/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: user.uid,
            email: user.email,
            return_url: `${window.location.origin}/auth/verify?from=stripe`,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          console.error("[KYC verify] Poll create-session failed:", err.error || res.status);
          return;
        }

        const data = await res.json();
        console.log("[KYC verify] Poll result:", data);

        if (data.verified) {
          console.log("[KYC verify] Verified from server-side sync; refreshing claims and redirecting");
          try { await refreshClaimsRef.current(); } catch {}
          cleanup();
          router.push('/mystable');
          return;
        }

        // Refresh the session so claim updates flow through so the UI reflects any webhook updates.
        try { await refreshClaimsRef.current(); } catch {}
      } catch (err: any) {
        console.error("[KYC verify] Polling error:", err.message);
      }
    };

    // Initial immediate check + interval
    poll();
    interval = setInterval(poll, 3000);

    // Stop polling after 60 seconds
    timeout = setTimeout(() => {
      console.log("[KYC verify] Polling timeout reached; stopping");
      cleanup();
    }, 60000);

    return cleanup;
  }, [user, router]);

  const startKYC = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/kyc/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email,
          return_url: `${window.location.origin}/auth/verify?from=stripe`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create KYC session");
      }
      const data = await res.json();
      if (data.verified) {
        try { await refreshClaims(); } catch {}
        router.push('/mystable');
        return;
      }
      const redirectUrl = data.session_url || data.url;
      if (!redirectUrl) {
        throw new Error("No verification URL returned");
      }
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, refreshClaims, router]);

  const config = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.none;
  const showStartButton = kycStatus === "none" || kycStatus === "canceled" || kycStatus === "requires_input";

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl font-bold text-gold">
            Evolution Stables
          </Link>
          <p className="mt-2 text-sm text-muted">Identity Verification</p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-panel p-6">
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
            {isFromStripe && kycStatus !== "verified" && (
              <>
                <button
                  onClick={async () => {
                    setPolling(true);
                    await refreshClaims();
                    setTimeout(() => setPolling(false), 3000);
                  }}
                  className="mt-2 text-xs text-gold hover:underline"
                >
                  Force refresh status
                </button>
                <button
                  onClick={startKYC}
                  disabled={loading || !user}
                  className="mt-2 block w-full rounded-full border border-gold/30 px-4 py-1 text-xs font-medium text-gold transition hover:bg-gold/10 disabled:opacity-50"
                >
                  {loading ? "Syncing..." : "Sync status from Stripe now (recommended)"}
                </button>
              </>
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
