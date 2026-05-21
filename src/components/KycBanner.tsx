"use client";

import Link from "next/link";
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
  const { kycStatus, loading } = useAuth();

  if (loading) return null;

  const config = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.none;
  if (!config.show) return null;

  return (
    <section className="px-8 md:px-12 lg:px-16 max-w-6xl mx-auto pb-6">
      <div className="rounded-xl border border-warning-border bg-warning-bg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-foreground mb-2">{config.title}</h2>
            <p className="text-sm font-light text-muted max-w-2xl">{config.message}</p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/auth/verify"
              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-hover"
            >
              {config.action} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
