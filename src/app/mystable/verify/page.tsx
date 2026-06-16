"use client";

import Link from "next/link";
import { FooterBar } from "@/components/site/Footer";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/lib/auth-context";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function VerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerifyIdentity = async () => {
    if (!user) {
      setError("Please sign in to verify your identity");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/kyc/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create verification session");
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error("No client secret received");
      }

      // Redirect to Stripe Identity verification page
      window.location.href = `https://identity.stripe.com/verify/${clientSecret}`;
      setSuccess(true);
    } catch (err) {
      console.error("[KYC] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to start verification");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background pt-28 text-mp-text-primary md:pt-36">
        <div className="mx-auto max-w-2xl px-6 pb-24 md:px-10">
          <p className="text-sm text-mp-text-secondary">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 text-mp-text-primary md:pt-36">
      <div className="mx-auto max-w-2xl space-y-8 px-6 pb-24 md:px-10">
        <header>
          <p className="text-xs uppercase tracking-mp-label text-mp-accent">
            MyStable
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Identity Verification
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mp-text-secondary">
            Verify your identity using Stripe Identity. This secure process
            helps protect your account and ensures compliance with financial
            regulations.
          </p>
        </header>

        {!user ? (
          <div className="rounded-2xl border border-mp-border-prominent bg-mp-surface-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-mp-text-primary">
                  Sign In Required
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mp-text-secondary">
                  Please sign in with Google or email to verify your identity.
                </p>
                <Link
                  href="/auth"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-mp-accent px-4 py-2 text-sm font-medium text-mp-text-inverse transition hover:bg-mp-accent-hover"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-mp-text-primary">
                  Verification Started
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mp-text-secondary">
                  You have been redirected to Stripe's secure verification
                  page. Complete the process there, then return to this page.
                </p>
                <Link
                  href="/mystable"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-mp-accent px-4 py-2 text-sm font-medium text-mp-text-inverse transition hover:bg-mp-accent-hover"
                >
                  Return to MyStable
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-mp-border-prominent bg-mp-surface-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mp-accent/10 text-mp-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-mp-text-primary">
                    Why Verify Your Identity?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-mp-text-secondary">
                    Identity verification is required for financial
                    transactions and regulatory compliance. It protects your
                    account and ensures a secure platform for all users.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-mp-border-prominent bg-mp-surface-card p-6">
              <h3 className="text-lg font-semibold text-mp-text-primary mb-4">
                How It Works
              </h3>
              <ol className="space-y-3 list-decimal list-inside text-sm text-mp-text-secondary">
                <li>Click the button below to start verification</li>
                <li>You'll be redirected to Stripe's secure page</li>
                <li>Upload a photo of your government-issued ID</li>
                <li>Take a selfie for identity matching</li>
                <li>Return to this page once complete</li>
              </ol>
            </div>

            <button
              onClick={handleVerifyIdentity}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-mp-accent px-6 py-3 text-sm font-medium text-mp-text-inverse transition hover:bg-mp-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Starting Verification..." : "Start Identity Verification"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-24">
        <FooterBar />
      </div>
    </main>
  );
}
