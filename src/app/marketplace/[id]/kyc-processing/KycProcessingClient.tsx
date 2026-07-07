"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import hltsData from "@/data/hlts.json";

interface KycProcessingClientProps {
  horseSlug: string;
}

export default function KycProcessingClient({ horseSlug }: KycProcessingClientProps) {
  const { user, loading: authLoading, kycStatus, refreshClaims } = useAuth();
  const router = useRouter();

  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState("We are currently verifying your identity. This typically takes less than 2 minutes.");
  const [statusState, setStatusState] = useState<"processing" | "verified" | "failed" | "requires_input">("processing");
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const horseName = (hltsData as any[])?.find((h) => (h.horse_slug || h.id) === horseSlug)?.horse_name || "Racehorse";

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/marketplace/${horseSlug}/kyc-processing`);
    }
  }, [authLoading, user, router, horseSlug]);

  // If already verified, redirect to purchase
  useEffect(() => {
    if (kycStatus === "verified" && user) {
      router.push(`/marketplace/${horseSlug}/purchase`);
    }
  }, [kycStatus, user, router, horseSlug]);

  const checkStatus = useCallback(async () => {
    if (!user) return;
    setChecking(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/kyc/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to check status" }));
        setStatusMsg(err.error || "Failed to check status. Please try again.");
        setStatusState("failed");
        return;
      }
      const data = await res.json();
      const status = data.kyc_status;

      if (status === "verified") {
        await refreshClaims();
        setStatusMsg("Identity verified! Redirecting to purchase...");
        setStatusState("verified");
        setTimeout(() => router.push(`/marketplace/${horseSlug}/purchase`), 1500);
      } else if (status === "requires_input") {
        setStatusMsg("Stripe requires additional information to complete your verification.");
        setStatusState("requires_input");
      } else if (status === "failed" || status === "canceled") {
        setStatusMsg("Verification was not completed. You can try again or request manual assistance.");
        setStatusState("failed");
      } else {
        setStatusMsg("Still processing. Please check again in a moment.");
        setStatusState("processing");
      }
    } catch (err: any) {
      setStatusMsg(err.message || "Failed to check status. Please try again.");
      setStatusState("failed");
    } finally {
      setChecking(false);
    }
  }, [user, horseSlug, router, refreshClaims]);

  // Auto-check status on mount if kycStatus is pending
  useEffect(() => {
    if (user && kycStatus === "pending") {
      checkStatus();
    }
  }, [user, kycStatus, checkStatus]);

  const startKyc = useCallback(async () => {
    if (!user) return;
    setChecking(true);
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
        const err = await res.json().catch(() => ({ error: "Failed to start verification" }));
        throw new Error(err.error || "Failed to start verification");
      }
      const data = await res.json();
      if (data.verified) {
        await refreshClaims();
        router.push(`/marketplace/${horseSlug}/purchase`);
      } else if (data.session_url || data.url) {
        window.location.href = data.session_url || data.url;
      }
    } catch (err: any) {
      setStatusMsg(err.message || "Failed to start verification.");
      setStatusState("failed");
    } finally {
      setChecking(false);
    }
  }, [user, horseSlug, router, refreshClaims]);

  const submitLead = useCallback(async () => {
    if (!user || (!leadName && !leadEmail && !user.email)) return;
    setLeadSubmitting(true);
    try {
      // Write to Leads sheet via a simple fetch to the checkout webhook's sheets lib
      // We'll use the /api/kyc/create-session pattern — but leads need their own endpoint
      // For now, write directly via a fetch to a new leads API route
      const token = await user.getIdToken(true);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          horse_slug: horseSlug,
          action_type: "kyc_failed",
          user_name: leadName || user.displayName || "",
          user_email: leadEmail || user.email || "",
        }),
      });
      if (res.ok) {
        setLeadSubmitted(true);
      } else {
        throw new Error("Failed to submit lead");
      }
    } catch (err: any) {
      setStatusMsg(err.message || "Failed to submit. Please contact support directly.");
    } finally {
      setLeadSubmitting(false);
    }
  }, [user, horseSlug, leadName, leadEmail]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]" />
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-white font-sans pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
            <Link href="/marketplace" className="hover:text-white/60 transition">Marketplace</Link>
            <span>/</span>
            <Link href={`/marketplace/${horseSlug}`} className="hover:text-white/60 transition">{horseName}</Link>
            <span>/</span>
            <span className="text-white/60">Verification</span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 space-y-8 text-center">
            {/* Status icon */}
            <div className="flex justify-center">
              {statusState === "verified" ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                  ✓
                </div>
              ) : statusState === "processing" ? (
                <div className="w-16 h-16 rounded-full bg-[#d4a964]/10 border border-[#d4a964]/20 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
                  !
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-[24px] font-light text-white tracking-tight">
                {statusState === "verified" ? "Verified" : statusState === "processing" ? "Identity Verification" : "Verification Issue"}
              </h1>
              <p className="text-[14px] font-light text-white/50 leading-relaxed max-w-md mx-auto">
                {statusMsg}
              </p>
            </div>

            {/* Actions based on state */}
            {statusState === "processing" && (
              <button
                type="button"
                onClick={checkStatus}
                disabled={checking}
                className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {checking ? "Checking..." : "Check Status Again"}
              </button>
            )}

            {statusState === "requires_input" && (
              <>
                <button
                  type="button"
                  onClick={startKyc}
                  disabled={checking}
                  className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#d4a964]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {checking ? "Starting..." : "Complete Verification"}
                </button>
                <button
                  type="button"
                  onClick={() => setLeadFormOpen(true)}
                  className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Register for Manual Assistance
                </button>
              </>
            )}

            {statusState === "failed" && (
              <>
                <button
                  type="button"
                  onClick={startKyc}
                  disabled={checking}
                  className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#d4a964]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {checking ? "Starting..." : "Try Again"}
                </button>
                <button
                  type="button"
                  onClick={() => setLeadFormOpen(true)}
                  className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Register for Manual Assistance
                </button>
              </>
            )}

            {/* Lead capture form */}
            {leadFormOpen && !leadSubmitted && (
              <div className="border-t border-white/[0.06] pt-8 space-y-4 text-left">
                <div>
                  <p className="text-[14px] font-medium text-white mb-2">Manual Assistance Request</p>
                  <p className="text-[12px] font-light text-white/40 leading-relaxed">
                    If you&apos;re having trouble with automated verification, our team will contact you to complete it manually.
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4a964]/30"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={leadEmail || user.email || ""}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4a964]/30"
                  />
                  <button
                    type="button"
                    onClick={submitLead}
                    disabled={leadSubmitting}
                    className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {leadSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            )}

            {leadSubmitted && (
              <div className="border-t border-white/[0.06] pt-8">
                <p className="text-[13px] font-light text-emerald-400">
                  ✓ Request submitted. Our team will contact you within 24 hours.
                </p>
              </div>
            )}

            <Link
              href={`/marketplace/${horseSlug}`}
              className="block text-center text-[11px] uppercase tracking-widest text-white/40 hover:text-white/60 transition"
            >
              ← Back to {horseName}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}