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
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <div
        className={`rounded-full border text-center transition duration-300 flex flex-col justify-center items-center ${
          highlight
            ? "border-[#d4a964]/35 bg-[#d4a964]/10 shadow-[0_0_20px_rgba(212,169,100,0.08)] px-4 h-[42px] min-w-[110px] max-w-[155px]"
            : isEmpty
              ? "border-white/[0.03] bg-white/[0.01] opacity-35 h-[36px] px-3 min-w-[100px]"
              : muted
                ? "border-white/[0.06] bg-white/[0.02] opacity-65 hover:border-white/[0.12] hover:opacity-85 px-2.5 h-[34px] min-w-[95px] max-w-[135px]"
                : "border-white/[0.1] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.06] px-3.5 h-[38px] min-w-[110px] max-w-[150px]"
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

/** Horizontal stubs from pill centre to cell edges — meet connector borders flush. */
function NodeCell({
  fullName,
  label,
  highlight = false,
  muted = false,
  lineIn = false,
  lineOut = false,
  className = "",
  sublabel,
}: {
  fullName: string;
  label?: string;
  highlight?: boolean;
  muted?: boolean;
  lineIn?: boolean;
  lineOut?: boolean;
  className?: string;
  sublabel?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center min-w-0 ${className}`}>
      {lineIn && (
        <div className="absolute left-0 right-1/2 top-1/2 h-px bg-white/10 pointer-events-none" aria-hidden />
      )}
      {lineOut && (
        <div className="absolute left-1/2 right-0 top-1/2 h-px bg-white/10 pointer-events-none" aria-hidden />
      )}
      <div className="relative z-10">
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

/** Top half of a binary fork: spine + arm to upper child (border-share). */
function ForkTop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`box-border h-1/2 self-end w-full border-l border-t border-white/10 ${className}`}
      aria-hidden
    />
  );
}

/** Bottom half of a binary fork: spine + arm to lower child (border-share). */
function ForkBottom({ className = "" }: { className?: string }) {
  return (
    <div
      className={`box-border h-1/2 self-start w-full border-l border-b border-white/10 ${className}`}
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
            4-gen CSS grid pedigree: 4 horse cols + 3 fork cols, 8 equal rows.
            Connectors use border-share (no absolute heights) so lines never drift.
          */}
          <div
            className="grid min-w-fit py-8 items-stretch
              grid-cols-[minmax(118px,150px)_28px_minmax(110px,145px)_24px_minmax(105px,140px)_20px_minmax(95px,130px)]
              grid-rows-[repeat(8,48px)]"
          >
            {/* Gen 1: subject horse */}
            <NodeCell
              fullName={tree.horse}
              highlight
              lineOut
              sublabel={horseLabel}
              className="col-start-1 row-start-1 row-span-8"
            />

            {/* Fork: horse → sire / dam */}
            <ForkTop className="col-start-2 row-start-1 row-span-4" />
            <ForkBottom className="col-start-2 row-start-5 row-span-4" />

            {/* Gen 2: parents */}
            <NodeCell
              fullName={tree.sire}
              label="Sire"
              lineIn
              lineOut
              className="col-start-3 row-start-1 row-span-4"
            />
            <NodeCell
              fullName={tree.dam}
              label="Dam"
              lineIn
              lineOut
              className="col-start-3 row-start-5 row-span-4"
            />

            {/* Fork: parents → grandparents */}
            <ForkTop className="col-start-4 row-start-1 row-span-2" />
            <ForkBottom className="col-start-4 row-start-3 row-span-2" />
            <ForkTop className="col-start-4 row-start-5 row-span-2" />
            <ForkBottom className="col-start-4 row-start-7 row-span-2" />

            {/* Gen 3: grandparents */}
            <NodeCell
              fullName={tree.sireSire}
              label="Sire's Sire"
              lineIn
              lineOut
              className="col-start-5 row-start-1 row-span-2"
            />
            <NodeCell
              fullName={tree.sireDam}
              label="Sire's Dam"
              lineIn
              lineOut
              className="col-start-5 row-start-3 row-span-2"
            />
            <NodeCell
              fullName={tree.damSire}
              label="Dam's Sire"
              lineIn
              lineOut
              className="col-start-5 row-start-5 row-span-2"
            />
            <NodeCell
              fullName={tree.damDam}
              label="Dam's Dam"
              lineIn
              lineOut
              className="col-start-5 row-start-7 row-span-2"
            />

            {/* Fork: grandparents → great-grandparents */}
            <ForkTop className="col-start-6 row-start-1" />
            <ForkBottom className="col-start-6 row-start-2" />
            <ForkTop className="col-start-6 row-start-3" />
            <ForkBottom className="col-start-6 row-start-4" />
            <ForkTop className="col-start-6 row-start-5" />
            <ForkBottom className="col-start-6 row-start-6" />
            <ForkTop className="col-start-6 row-start-7" />
            <ForkBottom className="col-start-6 row-start-8" />

            {/* Gen 4: great-grandparents */}
            <NodeCell fullName={tree.sireSireSire} muted lineIn className="col-start-7 row-start-1" />
            <NodeCell fullName={tree.sireSireDam} muted lineIn className="col-start-7 row-start-2" />
            <NodeCell fullName={tree.sireDamSire} muted lineIn className="col-start-7 row-start-3" />
            <NodeCell fullName={tree.sireDamDam} muted lineIn className="col-start-7 row-start-4" />
            <NodeCell fullName={tree.damSireSire} muted lineIn className="col-start-7 row-start-5" />
            <NodeCell fullName={tree.damSireDam} muted lineIn className="col-start-7 row-start-6" />
            <NodeCell fullName={tree.damDamSire} muted lineIn className="col-start-7 row-start-7" />
            <NodeCell fullName={tree.damDamDam} muted lineIn className="col-start-7 row-start-8" />
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