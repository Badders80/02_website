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

interface PedigreeTableSandboxProps {
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
  
  // Match name, country in parentheses, and optional year + optional suffix (like nsb)
  const match = fullName.match(/^(.+?)\s*\(([A-Z]{2,4})\)(?:\s+(\d{4})(?:\s+[a-zA-Z]+)?)?$/i);
  if (match) {
    return { name: match[1].trim(), country: match[2], year: match[3] || "" };
  }
  
  const match2 = fullName.match(/^(.+?)\s+(\d{4})(?:\s+[a-zA-Z]+)?$/i);
  if (match2) {
    return { name: match2[1].trim(), country: "", year: match2[2] };
  }
  
  return { name: fullName.trim(), country: "", year: "" };
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
            ? "border-[#d4a964]/35 bg-[#d4a964]/10 shadow-[0_0_20px_rgba(212,169,100,0.08)] px-4 h-[46px] min-w-[110px] max-w-[155px]"
            : isEmpty
              ? "border-white/[0.03] bg-white/[0.01] opacity-35 h-[38px] px-3 min-w-[100px]"
              : muted
                ? "border-white/[0.06] bg-white/[0.02] opacity-65 hover:border-white/[0.12] hover:opacity-85 px-2.5 h-[36px] min-w-[95px] max-w-[135px]"
                : "border-white/[0.1] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.06] px-3.5 h-[40px] min-w-[110px] max-w-[150px]"
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

function Connector({ width = 16, height = 60 }: { width?: number; height?: number }) {
  return (
    <div className="flex items-center shrink-0" style={{ width: `${width + 2}px` }}>
      {/* Entry line */}
      <div className="h-px bg-white/10 flex-grow" />
      {/* Branch bracket */}
      <div className="relative w-px bg-white/10 shrink-0" style={{ height: `${height}px` }}>
        {/* Top horizontal branch prong */}
        <div className="absolute top-0 left-0 h-px bg-white/10" style={{ width: `${width}px` }} />
        {/* Bottom horizontal branch prong */}
        <div className="absolute bottom-0 left-0 h-px bg-white/10" style={{ width: `${width}px` }} />
      </div>
    </div>
  );
}

export function PedigreeTableSandbox({
  horseName,
  sireName,
  damName,
  sex,
  colour,
  age,
  foalingDate,
  breedingUrl,
  pedigreeData,
}: PedigreeTableSandboxProps) {
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
          {/* Title removed per user instruction */}

          {/* Pedigree tree: goes Left (Gen 1: Horse) to Right (Gen 4: Great-Grandparents) */}
          <div className="flex items-center justify-start min-w-fit py-6">
            
            {/* Gen 1: Target Horse */}
            <div className="flex flex-col items-center gap-1 pr-2 shrink-0">
              <PedigreePill fullName={tree.horse} highlight />
              <span className="text-[9px] text-white/35 font-light capitalize mt-3">{horseLabel}</span>
            </div>

            {/* Connecting Horse (Gen 1) to Sire/Dam (Gen 2) */}
            <Connector width={20} height={240} />

            {/* Gen 2, Gen 3, Gen 4 nested structure */}
            <div className="flex flex-col gap-10 shrink-0">
              
              {/* SIRE side */}
              <div className="flex items-center gap-2">
                <PedigreePill fullName={tree.sire} label="Sire" />
                <Connector width={16} height={116} />
                
                <div className="flex flex-col gap-8">
                  {/* Sire's Sire branch */}
                  <div className="flex items-center gap-2">
                    <PedigreePill fullName={tree.sireSire} label="Sire's Sire" />
                    <Connector width={12} height={48} />
                    <div className="flex flex-col gap-3">
                      <PedigreePill fullName={tree.sireSireSire} muted />
                      <PedigreePill fullName={tree.sireSireDam} muted />
                    </div>
                  </div>

                  {/* Sire's Dam branch */}
                  <div className="flex items-center gap-2">
                    <PedigreePill fullName={tree.sireDam} label="Sire's Dam" />
                    <Connector width={12} height={48} />
                    <div className="flex flex-col gap-3">
                      <PedigreePill fullName={tree.sireDamSire} muted />
                      <PedigreePill fullName={tree.sireDamDam} muted />
                    </div>
                  </div>
                </div>

              </div>

              {/* DAM side */}
              <div className="flex items-center gap-2">
                <PedigreePill fullName={tree.dam} label="Dam" />
                <Connector width={16} height={116} />
                
                <div className="flex flex-col gap-8">
                  {/* Dam's Sire branch */}
                  <div className="flex items-center gap-2">
                    <PedigreePill fullName={tree.damSire} label="Dam's Sire" />
                    <Connector width={12} height={48} />
                    <div className="flex flex-col gap-3">
                      <PedigreePill fullName={tree.damSireSire} muted />
                      <PedigreePill fullName={tree.damSireDam} muted />
                    </div>
                  </div>

                  {/* Dam's Dam branch */}
                  <div className="flex items-center gap-2">
                    <PedigreePill fullName={tree.damDam} label="Dam's Dam" />
                    <Connector width={12} height={48} />
                    <div className="flex flex-col gap-3">
                      <PedigreePill fullName={tree.damDamSire} muted />
                      <PedigreePill fullName={tree.damDamDam} muted />
                    </div>
                  </div>
                </div>

              </div>

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
