"use client";

import { useState } from "react";
import { buildPedigreeTree } from "@/lib/pedigree-tree";
import type { PedigreeCrossLine } from "@/lib/pedigree-tree";

interface PedigreeEntry {
  mare?: string;
  sire?: string;
  dam?: string;
}

interface PedigreeData {
  dam_line?: PedigreeEntry[];
  sire_line?: PedigreeEntry[];
  cross_line?: PedigreeCrossLine;
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

function parseHorseName(fullName: string): { name: string; country: string; year: string } {
  if (!fullName || fullName === "—") return { name: "—", country: "", year: "" };
  const match = fullName.match(/^(.+?)\s*\(([A-Z]{2,4})\)\s*(\d{4})?$/);
  if (match) {
    return { name: match[1].trim(), country: match[2], year: match[3] || "" };
  }
  const match2 = fullName.match(/^(.+?)\s+(\d{4})$/);
  if (match2) {
    return { name: match2[1].trim(), country: "", year: match2[2] };
  }
  return { name: fullName.trim(), country: "", year: "" };
}

function PedigreePill({
  fullName,
  highlight = false,
  muted = false,
}: {
  fullName: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  const parsed = parseHorseName(fullName);
  const isEmpty = parsed.name === "—";

  return (
    <div
      className={`rounded-full border px-3.5 py-2 text-center min-w-[92px] max-w-[140px] ${
        highlight
          ? "border-[#d4a964]/35 bg-[#d4a964]/10 shadow-[0_0_20px_rgba(212,169,100,0.08)]"
          : isEmpty || muted
            ? "border-white/[0.05] bg-white/[0.02] opacity-50"
            : "border-white/[0.1] bg-white/[0.05] hover:border-white/[0.16] transition-colors"
      }`}
    >
      <div className={`text-[11px] font-medium leading-tight ${highlight ? "text-white" : "text-white/85"}`}>
        {parsed.name}
      </div>
      {(parsed.country || parsed.year) && (
        <div className="text-[9px] text-white/40 mt-0.5 font-light tracking-wide">
          {parsed.country && parsed.year ? `${parsed.country} ${parsed.year}` : parsed.country || parsed.year}
        </div>
      )}
    </div>
  );
}

function PedigreeBranch({
  gen4Top,
  gen4Bottom,
  gen3Top,
  gen3Bottom,
  gen2,
}: {
  gen4Top: string;
  gen4Bottom: string;
  gen3Top: string;
  gen3Bottom: string;
  gen2: string;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="flex flex-col gap-2 md:gap-3">
        <PedigreePill fullName={gen4Top} muted />
        <PedigreePill fullName={gen4Bottom} muted />
      </div>
      <div className="w-4 md:w-6 h-px bg-white/10 shrink-0" />
      <div className="flex flex-col gap-3 md:gap-5">
        <PedigreePill fullName={gen3Top} />
        <PedigreePill fullName={gen3Bottom} />
      </div>
      <div className="w-4 md:w-6 h-px bg-white/10 shrink-0" />
      <PedigreePill fullName={gen2} />
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

  const tree = buildPedigreeTree(
    sireName,
    damName,
    horseName,
    sireLine,
    damLine,
    pedigreeData?.cross_line,
  );

  const horseLabel = `${colour} ${sex}${age ? `, ${age}yo` : ""}`;
  const damLineUrl = breedingUrl ? `${breedingUrl}#bm-dam` : undefined;
  const sireLineUrl = breedingUrl ? `${breedingUrl}#bm-sire` : undefined;

  return (
    <div className="space-y-6">
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

      {view === "tree" && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-5 md:p-8 overflow-x-auto">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-6">4-Generation Pedigree</h5>

          <div className="flex items-center gap-3 md:gap-5 min-w-fit">
            <div className="flex flex-col gap-10 md:gap-14">
              <PedigreeBranch
                gen4Top={tree.sireSireSire}
                gen4Bottom={tree.sireSireDam}
                gen3Top={tree.sireSire}
                gen3Bottom={tree.sireDam}
                gen2={tree.sire}
              />
              <PedigreeBranch
                gen4Top={tree.damSireSire}
                gen4Bottom={tree.damSireDam}
                gen3Top={tree.damSire}
                gen3Bottom={tree.damDam}
                gen2={tree.dam}
              />
            </div>

            <div className="w-5 md:w-8 h-px bg-white/10 shrink-0" />

            <div className="flex flex-col items-center gap-1">
              <PedigreePill fullName={tree.horse} highlight />
              <span className="text-[9px] text-white/35 font-light capitalize mt-1">{horseLabel}</span>
            </div>
          </div>

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