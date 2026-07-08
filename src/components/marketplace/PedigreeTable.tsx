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
  foalingDate?: string;
  breedingUrl?: string | null;
  pedigreeData?: PedigreeData | null;
}

function formatFoalingDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

// Parse a name like "Proisir (AUS) 2009" → { name: "Proisir", country: "AUS", year: "2009" }
function parseHorseName(fullName: string): { name: string; country: string; year: string } {
  if (!fullName || fullName === "—") return { name: "—", country: "", year: "" };
  const match = fullName.match(/^(.+?)\s*\(([A-Z]{2,4})\)\s*(\d{4})?$/);
  if (match) {
    return { name: match[1].trim(), country: match[2], year: match[3] || "" };
  }
  // Try just name + year without country
  const match2 = fullName.match(/^(.+?)\s+(\d{4})$/);
  if (match2) {
    return { name: match2[1].trim(), country: "", year: match2[2] };
  }
  return { name: fullName.trim(), country: "", year: "" };
}

interface TreeNodeProps {
  fullName: string;
  label?: string;
  opacity?: string;
}

function TreeNode({ fullName, label, opacity = "70" }: TreeNodeProps) {
  const parsed = parseHorseName(fullName);
  return (
    <div className="flex flex-col items-end text-right min-w-[100px]">
      <span className={`text-[11px] md:text-[12px] font-medium leading-tight whitespace-nowrap text-white/${opacity}`}>
        {parsed.name}
      </span>
      {(parsed.country || parsed.year) && (
        <span className={`text-[9px] text-white/${Number(opacity) * 0.5} mt-0.5 font-light`}>
          {parsed.country && parsed.year ? `${parsed.country} ${parsed.year}` : parsed.country || parsed.year}
        </span>
      )}
      {label && <span className="text-[7px] text-white/20 mt-0.5 uppercase tracking-wider">{label}</span>}
    </div>
  );
}

function Connector({ h = 24, gap = 70 }: { h?: number; gap?: number }) {
  return (
    <div className="flex items-center shrink-0">
      <div className="h-px bg-white/10" style={{ width: `${h}px` }} />
      <div className="flex flex-col" style={{ gap: `${gap}px` }}>
        <div className="w-px bg-white/10" style={{ height: `${gap / 2}px` }} />
        <div className="w-px bg-white/10" style={{ height: `${gap / 2}px` }} />
      </div>
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
  foalingDate,
  breedingUrl,
  pedigreeData,
}: PedigreeTableProps) {
  const formattedFoalingDate = formatFoalingDate(foalingDate);
  const [view, setView] = useState<"tree" | "dam-line" | "sire-line">("tree");

  const damLine = (pedigreeData?.dam_line || []).slice(0, 10);
  const sireLine = (pedigreeData?.sire_line || []).slice(0, 10);
  const hasFullPedigree = damLine.length > 0 || sireLine.length > 0;

  // Gen 2
  const sire = sireName;
  const dam = damName;

  // Gen 3
  const sireSire = sireLine[1]?.sire || "—";
  const sireDam = sireLine[0]?.dam || "—";
  const damSire = damLine[0]?.sire || "—";
  const damDam = damLine[1]?.mare || "—";

  // Gen 4 — parents of each gen 3 horse
  // Sire's Sire's parents (from sireLine)
  const sireSireSire = sireLine[2]?.sire || "—";
  const sireSireDam = sireLine[1]?.dam || "—";
  // Sire's Dam's parents — cross-line, not in our data
  const sireDamSire = "—";
  const sireDamDam = "—";
  // Dam's Sire's parents — cross-line, not in our data
  const damSireSire = "—";
  const damSireDam = "—";
  // Dam's Dam's parents (from damLine)
  const damDamSire = damLine[1]?.sire || "—";
  const damDamDam = damLine[2]?.mare || "—";

  // Dam line and sire line URLs
  const damLineUrl = breedingUrl ? `${breedingUrl}#bm-dam` : undefined;
  const sireLineUrl = breedingUrl ? `${breedingUrl}#bm-sire` : undefined;

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

      {/* === TREE VIEW — 4 generations === */}
      {view === "tree" && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 md:p-10 overflow-x-auto">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-8">4-Generation Pedigree</h5>

          <div className="flex items-center min-w-fit">
            {/* Gen 1 — Horse */}
            <TreeNode fullName={horseName} label={`${colour} ${sex}${age ? `, ${age}yo` : ""}`} opacity="90" />

            {/* Connector to Gen 2 */}
            <Connector h={28} gap={120} />

            {/* Gen 2 — Sire (top) / Dam (bottom) */}
            <div className="flex flex-col" style={{ gap: "120px" }}>
              {/* SIRE branch */}
              <div className="flex items-center">
                <TreeNode fullName={sire} label="Sire" opacity="80" />
                {hasFullPedigree && (
                  <>
                    <Connector h={20} gap={80} />
                    {/* Gen 3 — Sire's parents */}
                    <div className="flex flex-col" style={{ gap: "80px" }}>
                      <div className="flex items-center">
                        <TreeNode fullName={sireSire} label="Sire's Sire" opacity="70" />
                        {sireLine.length > 2 && (
                          <>
                            <Connector h={16} gap={50} />
                            {/* Gen 4 — Sire's Sire's parents */}
                            <div className="flex flex-col" style={{ gap: "50px" }}>
                              <TreeNode fullName={sireSireSire} opacity="50" />
                              <TreeNode fullName={sireSireDam} opacity="50" />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center">
                        <TreeNode fullName={sireDam} label="Sire's Dam" opacity="60" />
                        <Connector h={16} gap={40} />
                        {/* Gen 4 — Sire's Dam's parents (cross-line, unknown) */}
                        <div className="flex flex-col" style={{ gap: "40px" }}>
                          <TreeNode fullName={sireDamSire} opacity="25" />
                          <TreeNode fullName={sireDamDam} opacity="25" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* DAM branch */}
              <div className="flex items-center">
                <TreeNode fullName={dam} label="Dam" opacity="80" />
                {hasFullPedigree && (
                  <>
                    <Connector h={20} gap={80} />
                    {/* Gen 3 — Dam's parents */}
                    <div className="flex flex-col" style={{ gap: "80px" }}>
                      <div className="flex items-center">
                        <TreeNode fullName={damSire} label="Dam's Sire" opacity="60" />
                        <Connector h={16} gap={40} />
                        {/* Gen 4 — Dam's Sire's parents (cross-line, unknown) */}
                        <div className="flex flex-col" style={{ gap: "40px" }}>
                          <TreeNode fullName={damSireSire} opacity="25" />
                          <TreeNode fullName={damSireDam} opacity="25" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TreeNode fullName={damDam} label="Dam's Dam" opacity="70" />
                        {damLine.length > 1 && (
                          <>
                            <Connector h={16} gap={50} />
                            {/* Gen 4 — Dam's Dam's parents */}
                            <div className="flex flex-col" style={{ gap: "50px" }}>
                              <TreeNode fullName={damDamSire} opacity="50" />
                              <TreeNode fullName={damDamDam} opacity="50" />
                            </div>
                          </>
                        )}
                      </div>
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
            {formattedFoalingDate && (
              <span className="text-white/40">
                Foaled: <span className="text-white/80">{formattedFoalingDate}</span>
              </span>
            )}
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
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs uppercase tracking-wider text-white/45">Dam Line</h5>
            {damLineUrl && (
              <a href={damLineUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#d4a964] hover:underline uppercase tracking-widest">
                Full Dam Line ↗
              </a>
            )}
          </div>
          <div className="space-y-0">
            {damLine.map((entry, i) => {
              const parsedMare = parseHorseName(entry.mare || "");
              const parsedSire = parseHorseName(entry.sire || "");
              return (
                <div key={i} className={`flex items-center gap-3 text-xs font-light py-2.5 ${i < damLine.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                  <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                  <span className="text-white/70 flex-1 truncate">{parsedMare.name}</span>
                  <span className="text-white/30 text-[10px]">by</span>
                  <span className="text-white/50 flex-1 truncate">{parsedSire.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === SIRE LINE VIEW — max 10 generations === */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs uppercase tracking-wider text-white/45">Sire Line</h5>
            {sireLineUrl && (
              <a href={sireLineUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#d4a964] hover:underline uppercase tracking-widest">
                Full Sire Line ↗
              </a>
            )}
          </div>
          <div className="space-y-0">
            {sireLine.map((entry, i) => {
              const parsedSire = parseHorseName(entry.sire || "");
              const parsedDam = parseHorseName(entry.dam || "");
              return (
                <div key={i} className={`flex items-center gap-3 text-xs font-light py-2.5 ${i < sireLine.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                  <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                  <span className="text-white/70 flex-1 truncate">{parsedSire.name}</span>
                  <span className="text-white/30 text-[10px]">from</span>
                  <span className="text-white/50 flex-1 truncate">{parsedDam.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}