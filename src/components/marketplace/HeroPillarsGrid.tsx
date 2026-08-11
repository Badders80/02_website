"use client";

import React from "react";
import { HeroPillar } from "@/lib/types";

interface HeroPillarsGridProps {
  pillars?: HeroPillar[];
}

export function HeroPillarsGrid({ pillars }: HeroPillarsGridProps) {
  if (!pillars || pillars.length === 0) {
    return null;
  }

  const gridColsClass =
    pillars.length === 1
      ? "grid-cols-1"
      : pillars.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridColsClass} gap-3 my-6`}>
      {pillars.map((pillar, index) => (
        <div
          key={index}
          className="relative group overflow-hidden rounded-xl bg-surface-base/60 border border-zinc-800/80 p-4 transition-all duration-300 hover:border-amber-500/40 hover:bg-surface-base/90"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-accent/90 mb-1">
            {pillar.category}
          </div>
          <div className="text-sm font-medium text-frost group-hover:text-heading transition-colors">
            {pillar.value}
          </div>
        </div>
      ))}
    </div>
  );
}
