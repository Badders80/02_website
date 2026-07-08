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

function shortName(fullName: string): string {
  if (!fullName || fullName === "—") return "—";
  return fullName.replace(/\s*\([^)]+\)\s*\d*$/, "").trim() || fullName;
}

function PedigreeBox({ name, label }: { name: string; label?: string }) {
  const display = shortName(name);
  return (
    <div className="flex flex-col items-center justify-center text-center px-2 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] min-w-[90px] max-w-[130px]">
      {label && (
        <span className="text-[7px] uppercase tracking-widest text-white/25 mb-0.5">{label}</span>
      )}
      <span className="text-[10px] font-light text-white/80 leading-tight">{display}</span>
    </div>
  );
}

function HLine({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-white/10 ${className}`} />;
}

function VLine({ className = "" }: { className?: string }) {
  return <div className={`w-px bg-white/10 ${className}`} />;
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

  const damLine = (pedigreeData?.dam_line || []).slice(0, 10);
  const sireLine = (pedigreeData?.sire_line || []).slice(0, 10);
  const hasFullPedigree = damLine.length > 0 || sireLine.length > 0;

  // Gen 2: sire and dam
  const gen2Sire = sireName;
  const gen2Dam = damName;

  // Gen 3: from sire_line and dam_line
  const gen3SireSire = sireLine[1]?.sire || "—";  // sire's sire
  const gen3SireDam = sireLine[0]?.dam || "—";    // sire's dam
  const gen3DamSire = damLine[0]?.sire || "—";    // dam's sire
  const gen3DamDam = damLine[0]?.mare || "—";     // dam's dam

  // Gen 4: from sire_line[2,3] and dam_line[1,2]
  const gen4SSS = sireLine[2]?.sire || "—";  // sire's sire's sire
  const gen4SSD = sireLine[1]?.dam || "—";   // sire's sire's dam
  const gen4SDS = sireLine[2]?.sire || "—";  // (same as above for now)
  const gen4SDD = sireLine[1]?.dam || "—";
  const gen4DSS = damLine[1]?.sire || "—";   // dam's dam's sire
  const gen4DSD = damLine[0]?.mare || "—";   // (dam's dam - already gen3)
  const gen4DDS = damLine[1]?.sire || "—";   
  const gen4DDD = damLine[1]?.mare || "—";   // dam's dam's dam

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
              {v === "tree" ? "Pedigree" : v.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {/* === TREE VIEW — 4-generation pedigree === */}
      {view === "tree" && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 md:p-8 overflow-x-auto">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-6">4-Generation Pedigree</h5>
          <div className="flex items-stretch min-w-fit">
            {/* Gen 1 — Subject */}
            <div className="flex items-center">
              <PedigreeBox name={horseName} label="Subject" />
            </div>

            {/* Connector to Gen 2 */}
            <div className="flex items-center">
              <HLine className="w-4" />
              <div className="flex flex-col h-[100px] justify-between">
                <VLine className="h-[50px]" />
                <VLine className="h-[50px]" />
              </div>
              <HLine className="w-3" />
            </div>

            {/* Gen 2 — Sire (top) / Dam (bottom) */}
            <div className="flex flex-col gap-[50px]">
              <PedigreeBox name={gen2Sire} label="Sire" />
              <PedigreeBox name={gen2Dam} label="Dam" />
            </div>

            {/* Connector to Gen 3 (only if data) */}
            {hasFullPedigree && (
              <>
                {/* Sire side */}
                <div className="flex items-center">
                  <HLine className="w-3" />
                  <div className="flex flex-col h-[90px] justify-between">
                    <VLine className="h-[45px]" />
                    <VLine className="h-[45px]" />
                  </div>
                  <HLine className="w-2" />
                </div>
                <div className="flex flex-col gap-[45px]">
                  <div className="flex flex-col gap-[40px]">
                    <PedigreeBox name={gen3SireSire} label="Sire's Sire" />
                    <PedigreeBox name={gen3SireDam} label="Sire's Dam" />
                  </div>
                </div>

                {/* Dam side */}
                <div className="flex items-center">
                  <HLine className="w-3" />
                  <div className="flex flex-col h-[90px] justify-between">
                    <VLine className="h-[45px]" />
                    <VLine className="h-[45px]" />
                  </div>
                  <HLine className="w-2" />
                </div>
                <div className="flex flex-col gap-[45px]">
                  <div className="flex flex-col gap-[40px]">
                    <PedigreeBox name={gen3DamSire} label="Dam's Sire" />
                    <PedigreeBox name={gen3DamDam} label="Dam's Dam" />
                  </div>
                </div>

                {/* Gen 4 — only if we have deeper data */}
                {sireLine.length > 2 && (
                  <>
                    {/* Sire's Sire side */}
                    <div className="flex items-center">
                      <HLine className="w-2" />
                      <div className="flex flex-col h-[80px] justify-between">
                        <VLine className="h-[40px]" />
                        <VLine className="h-[40px]" />
                      </div>
                      <HLine className="w-2" />
                    </div>
                    <div className="flex flex-col gap-[40px]">
                      <PedigreeBox name={sireLine[2]?.sire || "—"} />
                      <PedigreeBox name={sireLine[1]?.dam || "—"} />
                    </div>
                  </>
                )}

                {damLine.length > 1 && (
                  <>
                    {/* Dam's Dam side */}
                    <div className="flex items-center">
                      <HLine className="w-2" />
                      <div className="flex flex-col h-[80px] justify-between">
                        <VLine className="h-[40px]" />
                        <VLine className="h-[40px]" />
                      </div>
                      <HLine className="w-2" />
                    </div>
                    <div className="flex flex-col gap-[40px]">
                      <PedigreeBox name={damLine[1]?.sire || "—"} />
                      <PedigreeBox name={damLine[1]?.mare || "—"} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Specs row */}
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

      {/* === DAM LINE VIEW — max 10 generations === */}
      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Dam Line ({damLine.length} generations)</h5>
          <div className="space-y-0">
            {damLine.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-light py-2.5 ${
                  i < damLine.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <span className="text-white/70 truncate block">{entry.mare}</span>
                </div>
                <span className="text-white/30 text-[10px]">by</span>
                <div className="flex-1 min-w-0">
                  <span className="text-white/50 truncate block">{entry.sire}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SIRE LINE VIEW — max 10 generations === */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Sire Line ({sireLine.length} generations)</h5>
          <div className="space-y-0">
            {sireLine.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-light py-2.5 ${
                  i < sireLine.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <span className="text-white/70 truncate block">{entry.sire}</span>
                </div>
                <span className="text-white/30 text-[10px]">from</span>
                <div className="flex-1 min-w-0">
                  <span className="text-white/50 truncate block">{entry.dam}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}