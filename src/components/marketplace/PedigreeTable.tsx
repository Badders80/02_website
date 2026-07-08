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

function cleanName(fullName: string): string {
  if (!fullName || fullName === "—") return "—";
  // Keep "Horse Name (Country) Year" format but trim if too long
  return fullName.trim();
}

function TreeNode({ name, sublabel }: { name: string; sublabel?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-light text-white/70 leading-tight whitespace-nowrap">{cleanName(name)}</span>
      {sublabel && <span className="text-[8px] text-white/25 mt-0.5">{sublabel}</span>}
    </div>
  );
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

  // Gen 2 parents
  const sire = sireName;
  const dam = damName;

  // Gen 3 grandparents
  // Sire's parents: sireLine[0] = sire himself with his dam, sireLine[1] = sire's sire with his dam
  const sireSire = sireLine[1]?.sire || "—";     // dad's dad
  const sireDam = sireLine[0]?.dam || "—";       // dad's mum
  
  // Dam's parents: damLine[0] = dam herself with her sire, damLine[1] = dam's dam with her sire
  const damSire = damLine[0]?.sire || "—";      // mum's dad
  const damDam = damLine[0]?.mare || "—";       // mum's mum — wait, damLine[0].mare IS the dam herself
  // Actually: damLine[0] = {mare: "Yearn", sire: "Savabeel"} means dam is Yearn, by Savabeel
  // So damSire = damLine[0].sire = Savabeel (mum's dad)
  // damDam = damLine[1]?.mare (mum's mum)
  const damDamName = damLine[1]?.mare || "—";    // mum's mum
  const damSireName = damLine[0]?.sire || "—";   // mum's dad
  const sireSireName = sireLine[1]?.sire || "—"; // dad's dad
  const sireDamName = sireLine[0]?.dam || "—";   // dad's mum

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

      {/* === TREE VIEW — clean, left-to-right fan === */}
      {view === "tree" && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 md:p-8 overflow-x-auto">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-8">Pedigree</h5>
          
          <div className="flex items-center gap-4 md:gap-6 min-w-fit">
            {/* Gen 1 — Horse on the left */}
            <TreeNode name={horseName} sublabel={`${colour} ${sex}${age ? `, ${age}yo` : ""}`} />

            {/* Connector */}
            <div className="flex items-center">
              <div className="h-px bg-white/15 w-6 md:w-8" />
              <div className="flex flex-col">
                <div className="w-px bg-white/15 h-[40px]" />
                <div className="w-px bg-white/15 h-[40px]" />
              </div>
            </div>

            {/* Gen 2 — Sire (top) / Dam (bottom) */}
            <div className="flex flex-col gap-[80px]">
              <div className="flex items-center gap-4 md:gap-6">
                <TreeNode name={sire} sublabel="Sire" />
                {hasFullPedigree && (
                  <>
                    <div className="flex items-center">
                      <div className="h-px bg-white/15 w-4 md:w-6" />
                      <div className="flex flex-col">
                        <div className="w-px bg-white/15 h-[35px]" />
                        <div className="w-px bg-white/15 h-[35px]" />
                      </div>
                    </div>
                    {/* Gen 3 — Sire's parents */}
                    <div className="flex flex-col gap-[55px]">
                      <TreeNode name={sireSireName} sublabel="Sire's Sire" />
                      <TreeNode name={sireDamName} sublabel="Sire's Dam" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 md:gap-6">
                <TreeNode name={dam} sublabel="Dam" />
                {hasFullPedigree && (
                  <>
                    <div className="flex items-center">
                      <div className="h-px bg-white/15 w-4 md:w-6" />
                      <div className="flex flex-col">
                        <div className="w-px bg-white/15 h-[35px]" />
                        <div className="w-px bg-white/15 h-[35px]" />
                      </div>
                    </div>
                    {/* Gen 3 — Dam's parents */}
                    <div className="flex flex-col gap-[55px]">
                      <TreeNode name={damSireName} sublabel="Dam's Sire" />
                      <TreeNode name={damDamName} sublabel="Dam's Dam" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Specs row */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-light">
            <span className="text-white/40">Sex: <span className="text-white/80 capitalize">{sex || "—"}</span></span>
            <span className="text-white/40">Colour: <span className="text-white/80 capitalize">{colour || "—"}</span></span>
            {age && <span className="text-white/40">Age: <span className="text-white/80">{age} Years</span></span>}
            {breedingUrl && (
              <a href={breedingUrl} target="_blank" rel="noopener noreferrer" className="text-[#d4a964] hover:underline ml-auto">
                Full Breeding Record ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* === DAM LINE VIEW — max 10 generations === */}
      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Dam Line</h5>
          <div className="space-y-0">
            {damLine.map((entry, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs font-light py-2.5 ${i < damLine.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <span className="text-white/70 flex-1 truncate">{entry.mare}</span>
                <span className="text-white/30 text-[10px]">by</span>
                <span className="text-white/50 flex-1 truncate">{entry.sire}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SIRE LINE VIEW — max 10 generations === */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Sire Line</h5>
          <div className="space-y-0">
            {sireLine.map((entry, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs font-light py-2.5 ${i < sireLine.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <span className="text-white/70 flex-1 truncate">{entry.sire}</span>
                <span className="text-white/30 text-[10px]">from</span>
                <span className="text-white/50 flex-1 truncate">{entry.dam}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}