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
  
  // Strip " (by ...)" from the name
  let cleanName = fullName.replace(/\s*\(by\s+[^)]+\)/i, "");
  
  // Match name, country in parentheses, and optional year + optional suffix (like nsb)
  const match = cleanName.match(/^(.+?)\s*\(([A-Z]{2,4})\)(?:\s+(\d{4})(?:\s+[a-zA-Z]+)?)?$/i);
  if (match) {
    return { name: match[1].trim(), country: match[2], year: match[3] || "" };
  }
  
  const match2 = cleanName.match(/^(.+?)\s+(\d{4})(?:\s+[a-zA-Z]+)?$/i);
  if (match2) {
    return { name: match2[1].trim(), country: "", year: match2[2] };
  }
  
  return { name: cleanName.trim(), country: "", year: "" };
}

function PedigreePill({
  fullName,
  label,
  highlight = false,
  muted = false,
}: {
  fullName: string;
  label?: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  const parsed = parseHorseName(fullName);
  const isEmpty = parsed.name === "—";

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center">
      {/* Opaque fill so connector borders never bleed through the pill */}
      <div
        className={`w-full rounded-full border text-center transition duration-300 flex flex-col justify-center items-center ${
          highlight
            ? "border-[#d4a964]/40 bg-[#14110c] shadow-[0_0_20px_rgba(212,169,100,0.08)] px-3 h-[42px]"
            : isEmpty
              ? "border-white/[0.04] bg-[#0c0c0c] opacity-40 h-[36px] px-2"
              : muted
                ? "border-white/[0.08] bg-[#0e0e0e] opacity-75 hover:border-white/[0.14] hover:opacity-90 px-2 h-[34px]"
                : "border-white/[0.12] bg-[#111111] hover:border-white/[0.18] hover:bg-[#141414] px-2.5 h-[38px]"
        }`}
      >
        <div
          className={`font-medium leading-tight truncate w-full ${
            highlight
              ? "text-[12px] text-white"
              : muted
                ? "text-[9.5px] text-white/80"
                : "text-[11px] text-white/85"
          }`}
          title={parsed.name}
        >
          {parsed.name}
        </div>
        {(parsed.country || parsed.year) && (
          <div
            className={`text-white/40 mt-0.5 font-light tracking-wide ${
              muted ? "text-[8px]" : "text-[9px]"
            }`}
          >
            {parsed.country && parsed.year ? `${parsed.country} ${parsed.year}` : parsed.country || parsed.year}
          </div>
        )}
      </div>
      {label && !isEmpty && (
        <span className="absolute top-[100%] left-1/2 -translate-x-1/2 text-[7px] text-white/20 uppercase tracking-widest font-light mt-1 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Horse node only — no line stubs.
 * Lines live exclusively in the fork columns so they never cross pill faces.
 * Full-width pills sit flush against adjacent connector columns.
 */
function NodeCell({
  fullName,
  label,
  highlight = false,
  muted = false,
  className = "",
  sublabel,
}: {
  fullName: string;
  label?: string;
  highlight?: boolean;
  muted?: boolean;
  className?: string;
  sublabel?: string;
}) {
  return (
    <div className={`relative z-10 flex w-full min-w-0 items-center justify-center ${className}`}>
      <div className="relative w-full">
        <PedigreePill fullName={fullName} label={label} highlight={highlight} muted={muted} />
        {sublabel && (
          <span className="absolute top-[100%] left-1/2 -translate-x-1/2 text-[9px] text-white/35 font-light capitalize mt-1.5 whitespace-nowrap">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/** Top half of a binary fork in a spacing column only (border-share). */
function ForkTop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`box-border h-1/2 w-full self-end border-l border-t border-white/15 ${className}`}
      aria-hidden
    />
  );
}

/** Bottom half of a binary fork in a spacing column only (border-share). */
function ForkBottom({ className = "" }: { className?: string }) {
  return (
    <div
      className={`box-border h-1/2 w-full self-start border-l border-b border-white/15 ${className}`}
      aria-hidden
    />
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

  const damLine = (pedigreeData?.dam_line || []).slice(0, 8);
  const sireLine = (pedigreeData?.sire_line || []).slice(0, 8);
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
          {/*
            4-gen grid: horse cols (1/3/5/7) + fork-only cols (2/4/6).
            Lines never enter horse cells — pills are full-width + opaque, flush to forks.
          */}
          <div
            className="grid min-w-fit py-8 items-stretch
              grid-cols-[minmax(120px,155px)_36px_minmax(112px,148px)_32px_minmax(108px,142px)_28px_minmax(100px,132px)]
              grid-rows-[repeat(8,48px)]"
          >
            <NodeCell
              fullName={tree.horse}
              highlight
              sublabel={horseLabel}
              className="col-start-1 row-start-1 row-span-8"
            />

            {/* Fork cols only — no lines under pills */}
            <ForkTop className="col-start-2 row-start-1 row-span-4" />
            <ForkBottom className="col-start-2 row-start-5 row-span-4" />

            <NodeCell fullName={tree.sire} label="Sire" className="col-start-3 row-start-1 row-span-4" />
            <NodeCell fullName={tree.dam} label="Dam" className="col-start-3 row-start-5 row-span-4" />

            <ForkTop className="col-start-4 row-start-1 row-span-2" />
            <ForkBottom className="col-start-4 row-start-3 row-span-2" />
            <ForkTop className="col-start-4 row-start-5 row-span-2" />
            <ForkBottom className="col-start-4 row-start-7 row-span-2" />

            <NodeCell fullName={tree.sireSire} label="Sire's Sire" className="col-start-5 row-start-1 row-span-2" />
            <NodeCell fullName={tree.sireDam} label="Sire's Dam" className="col-start-5 row-start-3 row-span-2" />
            <NodeCell fullName={tree.damSire} label="Dam's Sire" className="col-start-5 row-start-5 row-span-2" />
            <NodeCell fullName={tree.damDam} label="Dam's Dam" className="col-start-5 row-start-7 row-span-2" />

            <ForkTop className="col-start-6 row-start-1" />
            <ForkBottom className="col-start-6 row-start-2" />
            <ForkTop className="col-start-6 row-start-3" />
            <ForkBottom className="col-start-6 row-start-4" />
            <ForkTop className="col-start-6 row-start-5" />
            <ForkBottom className="col-start-6 row-start-6" />
            <ForkTop className="col-start-6 row-start-7" />
            <ForkBottom className="col-start-6 row-start-8" />

            <NodeCell fullName={tree.sireSireSire} muted className="col-start-7 row-start-1" />
            <NodeCell fullName={tree.sireSireDam} muted className="col-start-7 row-start-2" />
            <NodeCell fullName={tree.sireDamSire} muted className="col-start-7 row-start-3" />
            <NodeCell fullName={tree.sireDamDam} muted className="col-start-7 row-start-4" />
            <NodeCell fullName={tree.damSireSire} muted className="col-start-7 row-start-5" />
            <NodeCell fullName={tree.damSireDam} muted className="col-start-7 row-start-6" />
            <NodeCell fullName={tree.damDamSire} muted className="col-start-7 row-start-7" />
            <NodeCell fullName={tree.damDamDam} muted className="col-start-7 row-start-8" />
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