"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

/**
 * OnboardingFlow — 3-step progress tracker shown on /mystable for new users.
 *
 * Step 1: Create Account (login)  — red → green when user exists
 * Step 2: Verify Identity (KYC)    — red → amber when pending → green when verified
 * Step 3: Acquire First Horse       — red until holdings.length > 0 → green
 *
 * Hides itself entirely when all 3 steps are complete (user is fully onboarded).
 */

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
  },
] as const;

export function OnboardingFlow({ hasHoldings }: OnboardingFlowProps) {
  const { user, kycStatus, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (loading) return null;

  // Determine step statuses
  const stepStatuses = [
    user ? "complete" : "incomplete",
    kycStatus === "verified" ? "complete" : kycStatus === "pending" || kycStatus === "requires_input" ? "in_progress" : "incomplete",
    hasHoldings ? "complete" : "incomplete",
  ];

  // Hide when all complete
  const allComplete = stepStatuses.every((s) => s === "complete");
  if (allComplete || dismissed) return null;

  // Only show for logged-in users (guests see the full-page gate overlay instead)
  if (!user) return null;

  const completedCount = stepStatuses.filter((s) => s === "complete").length;
  const progressPercent = (completedCount / 3) * 100;

  return (
    <section className="px-8 md:px-12 lg:px-16 max-w-6xl mx-auto pb-8">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-light text-white tracking-tight">Onboarding</h2>
            <p className="text-xs font-light text-white/40 mt-1">
              Complete these steps to start your ownership journey · {completedCount}/3 done
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-white/30 hover:text-white/60 transition text-sm"
            aria-label="Dismiss onboarding"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #21B981 100%)",
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, idx) => {
            const status = stepStatuses[idx];
            const isLast = idx === STEPS.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Connector line (between steps, not after last) */}
                {!isLast && (
                  <div
                    className="hidden md:block absolute top-6 left-[calc(100%-12px)] w-[24px] h-[2px]"
                    style={{
                      background:
                        status === "complete" ? "#21B981" : "rgba(255,255,255,0.08)",
                    }}
                  />
                )}

                <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-all ${
                        status === "complete"
                          ? "bg-[#21B981]/10 border-[#21B981]/30 text-[#21B981]"
                          : status === "in_progress"
                          ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
                          : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                      }`}
                    >
                      {status === "complete" ? "✓" : status === "in_progress" ? "●" : idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{step.label}</p>
                      <p
                        className={`text-[10px] uppercase tracking-wider mt-0.5 ${
                          status === "complete"
                            ? "text-[#21B981]"
                            : status === "in_progress"
                            ? "text-[#f59e0b]"
                            : "text-[#ef4444]/60"
                        }`}
                      >
                        {status === "complete"
                          ? "Complete"
                          : status === "in_progress"
                          ? "In Progress"
                          : "Not Started"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-light text-white/50 leading-relaxed">
                    {step.description}
                  </p>

                  {status !== "complete" && (
                    <Link
                      href={step.actionHref}
                      className="inline-flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium px-4 py-2 transition-all mt-1"
                    >
                      {step.actionLabel} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}