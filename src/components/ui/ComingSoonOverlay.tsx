"use client";

import React from "react";

interface ComingSoonOverlayProps {
  /** Text to display on the overlay. Defaults to "Coming Soon" */
  label?: string;
  /** Optional additional className for the outer wrapper */
  className?: string;
  /** Content to render behind the frosted overlay */
  children: React.ReactNode;
}

/**
 * ComingSoonOverlay
 *
 * A reusable glassmorphic overlay that sits on top of its children,
 * blurring the underlying content and displaying a centered label.
 *
 * Usage:
 * ```tsx
 * <ComingSoonOverlay>
 *   <SomeCard />
 *   <AnotherSection />
 * </ComingSoonOverlay>
 *
 * <ComingSoonOverlay label="Launching Q3 2026">
 *   <PricingWidget />
 * </ComingSoonOverlay>
 * ```
 */
export function ComingSoonOverlay({
  label = "Coming Soon",
  className = "",
  children,
}: ComingSoonOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Glassmorphic frosted overlay */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.06]"
        style={{ backdropFilter: "blur(12px) saturate(140%)" }}
      >
        <span className="text-[14px] font-medium tracking-[0.3em] uppercase text-white/80">
          {label}
        </span>
      </div>

      {/* Underlying content — visible but non-interactive */}
      <div className="select-none pointer-events-none">{children}</div>
    </div>
  );
}
