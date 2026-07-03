"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface OnboardingFlowProps {
  hasHoldings: boolean;
}

const STEPS = [
  {
    id: "account",
    label: "Create Account",
    description: "Sign in with Google or email to access your stable.",
    actionLabel: "Sign In",
    actionHref: "/auth/login?redirect=/mystable",
  },
  {
    id: "kyc",
    label: "Verify Identity",
    description: "Complete Stripe Identity verification to unlock purchasing.",
    actionLabel: "Start Verification",
    actionHref: "/mystable/verify",
  },
  {
    id: "horse",
    label: "Acquire First Horse",
    description: "Browse the marketplace and secure your first ownership stake.",
    actionLabel: "Go to Marketplace",
    actionHref: "/marketplace",
    shimmer: true,
  },
] as const;

export function OnboardingFlow({ hasHoldings }: OnboardingFlowProps) {
  const { user, kycStatus, loading } = useAuth();

  if (loading) return null;

  const stepStatuses = [
    user ? "complete" : "incomplete",
    kycStatus === "verified" ? "complete" : kycStatus === "pending" || kycStatus === "requires_input" ? "in_progress" : "incomplete",
    hasHoldings ? "complete" : "incomplete",
  ];

  const allComplete = stepStatuses.every((s) => s === "complete");
  if (allComplete) return null;
  if (!user) return null;

  return (
    <section className="px-8 md:px-12 lg:px-16 max-w-6xl mx-auto pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((step, idx) => {
          const status = stepStatuses[idx];

          return (
            <div
              key={step.id}
              className={`relative flex flex-col justify-between aspect-square p-6 rounded-2xl border transition-all duration-500 ${
                status === "complete"
                  ? "border-[#21B981]/20 bg-[#21B981]/[0.03]"
                  : status === "in_progress"
                  ? "border-[#f59e0b]/20 bg-[#f59e0b]/[0.03]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border ${
                    status === "complete"
                      ? "bg-[#21B981]/10 border-[#21B981]/30 text-[#21B981]"
                      : status === "in_progress"
                      ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
                      : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                  }`}
                >
                  {status === "complete" ? "✓" : status === "in_progress" ? "●" : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider ${
                    status === "complete"
                      ? "text-[#21B981]"
                      : status === "in_progress"
                      ? "text-[#f59e0b]"
                      : "text-[#ef4444]/60"
                  }`}
                >
                  {status === "complete" ? "Complete" : status === "in_progress" ? "In Progress" : "Not Started"}
                </span>
              </div>

              {/* Label + description */}
              <div className="flex-1 flex flex-col justify-center py-4">
                <p className="text-base font-light text-white tracking-tight">{step.label}</p>
                <p className="text-xs font-light text-white/40 leading-relaxed mt-2">
                  {step.description}
                </p>
              </div>

              {/* CTA button — same font/style as existing marketplace CTA */}
              {status !== "complete" && (
                <Link
                  href={step.actionHref}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-medium uppercase tracking-widest transition-all duration-200 active:scale-[0.98] ${
                    "shimmer" in step && step.shimmer
                      ? "shimmer-cta bg-[#d4a964] text-black hover:bg-[#e0b870]"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {step.actionLabel} →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}