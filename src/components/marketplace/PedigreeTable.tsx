"use client";

import { useState } from "react";

interface PedigreeEntry {
  mare?: string;
  sire?: string;
  dam?: string;
}

interface PedigreeData {
  dam_line?: PedigreeEntry[];
  sire_line?: PedigreeEntry[];
}

interface PedigreeTableProps {
  horseName: string;
  sireName: string;
  damName: string;
  sex: string;
  colour: string;
  age?: number;
  breedingUrl?: string | null;
  pedigreeData?: PedigreeData | null;
}

// Clean horse name: "Derryn (AUS) 2013" → "Derryn"
function shortName(fullName: string): string {
  if (!fullName || fullName === "—") return "—";
  // Strip country code and year: "Derryn (AUS) 2013" → "Derryn"
  return fullName.replace(/\s*\([^)]+\)\s*\d*$/, "").trim() || fullName;
}

function PedigreeBox({ name, label, sublabel }: { name: string; label?: string; sublabel?: string }) {
  const display = shortName(name);
  return (
    <div className="flex flex-col items-center justify-center text-center px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] min-w-[110px] max-w-[140px]">
      {label && (
        <span className="text-[8px] uppercase tracking-widest text-white/25 mb-1">{label}</span>
      )}
      <span className="text-[11px] font-light text-white/80 leading-tight">{display}</span>
      {sublabel && (
        <span className="text-[8px] text-white/30 mt-0.5">{sublabel}</span>
      )}
    </div>
  );
}

// Vertical connector line
function VLine({ className = "" }: { className?: string }) {
  return <div className={`w-px bg-white/10 ${className}`} />;
}

// Horizontal connector line
function HLine({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-white/10 ${className}`} />;
}

export function PedigreeTable({
  horseName,
  sireName,
  damName,
  sex,
  colour,
  age,
  breedingUrl,
  pedigreeData,
}: PedigreeTableProps) {
  const [view, setView] = useState<"tree" | "dam-line" | "sire-line">("tree");

  const damLine = pedigreeData?.dam_line || [];
  const sireLine = pedigreeData?.sire_line || [];
  const hasFullPedigree = damLine.length > 0 || sireLine.length > 0;

  // Build 3-generation tree data
  // Gen 1: Horse
  // Gen 2: Sire (top) / Dam (bottom)
  // Gen 3: Sire's Sire, Sire's Dam / Dam's Sire, Dam's Dam
  const gen2SireSire = sireLine[0]?.sire || "—";
  const gen2SireDam = sireLine[0]?.dam || "—";
  const gen2DamSire = damLine[0]?.sire || "—";
  const gen2DamDam = damLine[0]?.mare || "—";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View toggle */}
      {hasFullPedigree && (
        <div className="flex gap-2">
          {(["tree", "dam-line", "sire-line"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`text-[10px] uppercase tracking-widest font-light px-3 py-1.5 rounded-full border transition-all ${
                view === v
                  ? "border-[#d4a964]/30 text-[#d4a964] bg-[#d4a964]/5"
                  : "border-white/[0.06] text-white/40 hover:text-white/60"
              }`}
            >
              {v.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {/* Tree View — 3-generation fan-out chart */}
      {view === "tree" && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 md:p-8 overflow-x-auto">
          <div className="flex items-center gap-6 md:gap-8 min-w-fit">
            {/* Gen 1 — Subject horse */}
            <div className="flex flex-col items-center gap-4">
              <PedigreeBox name={horseName} label="Subject" />
            </div>

            {/* Connector + Gen 2 */}
            <div className="flex items-center">
              {/* Horizontal line from horse to split */}
              <HLine className="w-6" />
              {/* Vertical split */}
              <div className="flex flex-col items-center h-[120px] justify-between">
                <VLine className="h-[60px]" />
                <VLine className="h-[60px]" />
              </div>
              <HLine className="w-4" />
              {/* Gen 2 boxes */}
              <div className="flex flex-col gap-[60px]">
                <PedigreeBox name={sireName} label="Sire" />
                <PedigreeBox name={damName} label="Dam" />
              </div>
            </div>

            {/* Connector + Gen 3 (only if we have data) */}
            {hasFullPedigree && (
              <>
                {/* Sire side connectors */}
                <div className="flex items-center">
                  <HLine className="w-4" />
                  <div className="flex flex-col items-center h-[100px] justify-between">
                    <VLine className="h-[50px]" />
                    <VLine className="h-[50px]" />
                  </div>
                  <HLine className="w-3" />
                  <div className="flex flex-col gap-[50px]">
                    <PedigreeBox name={gen2SireSire} label="Sire's Sire" />
                    <PedigreeBox name={gen2SireDam} label="Sire's Dam" />
                  </div>
                </div>

                {/* Dam side connectors */}
                <div className="flex items-center">
                  <HLine className="w-4" />
                  <div className="flex flex-col items-center h-[100px] justify-between">
                    <VLine className="h-[50px]" />
                    <VLine className="h-[50px]" />
                  </div>
                  <HLine className="w-3" />
                  <div className="flex flex-col gap-[50px]">
                    <PedigreeBox name={gen2DamSire} label="Dam's Sire" />
                    <PedigreeBox name={gen2DamDam} label="Dam's Dam" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Specs row below the tree */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-light">
            <span className="text-white/40">Sex: <span className="text-white/80 capitalize">{sex || "—"}</span></span>
            <span className="text-white/40">Colour: <span className="text-white/80 capitalize">{colour || "—"}</span></span>
            {age && <span className="text-white/40">Age: <span className="text-white/80">{age} Years</span></span>}
            {breedingUrl && (
              <a
                href={breedingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4a964] hover:underline ml-auto"
              >
                Full Breeding Record ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Dam Line View */}
      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Dam Line</h5>
          <div className="space-y-1">
            {damLine.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-light py-2 ${
                  i < damLine.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <span className="text-white/70 flex-1">{entry.mare}</span>
                <span className="text-white/30 text-[10px]">by</span>
                <span className="text-white/50 flex-1">{entry.sire}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sire Line View */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Sire Line</h5>
          <div className="space-y-1">
            {sireLine.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-light py-2 ${
                  i < sireLine.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <span className="text-white/70 flex-1">{entry.sire}</span>
                <span className="text-white/30 text-[10px]">from</span>
                <span className="text-white/50 flex-1">{entry.dam}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No full pedigree — show basic tree only */}
      {view === "tree" && !hasFullPedigree && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <p className="text-xs text-white/30 font-light leading-relaxed">
            Full multi-generational pedigree will be available when this horse is registered with the NZTR Stud Book.
          </p>
        </div>
      )}
    </div>
  );
}